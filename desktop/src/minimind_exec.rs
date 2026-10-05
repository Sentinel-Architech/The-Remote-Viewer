//! Runs the shipped MiniMind2-Small network inside this desktop binary.
//! A file size or digest check is not this path.

use crate::minimind::{self, WeightMeasure};
use std::collections::HashMap;
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use tokenizers::Tokenizer;

const LAYERS: usize = 8;
const HIDDEN: usize = 512;
const INTERMEDIATE: usize = 1408;
const HEADS: usize = 8;
const KV_HEADS: usize = 2;
const HEAD_DIM: usize = 64;
const VOCAB: usize = 6400;
const RMS_EPS: f32 = 1e-5;
const ROPE_THETA: f32 = 1_000_000.0;
const NEW_TOKENS: usize = 24;

const PROMPT: &str = "<|im_start|>system\nYou are a helpful assistant<|im_end|>\n<|im_start|>user\nWhat is 1+1?<|im_end|>\n<|im_start|>assistant\n";

struct Layer {
    input_norm: Vec<f32>,
    post_norm: Vec<f32>,
    q: Vec<f32>,
    k: Vec<f32>,
    v: Vec<f32>,
    o: Vec<f32>,
    gate: Vec<f32>,
    up: Vec<f32>,
    down: Vec<f32>,
}

struct Model {
    embed: Vec<f32>,
    norm: Vec<f32>,
    layers: Vec<Layer>,
}

struct LayerCache {
    k: Vec<f32>,
    v: Vec<f32>,
    len: usize,
}

pub fn run_and_exit() -> anyhow::Result<()> {
    let mut args = std::env::args().skip(1);
    let mut explicit = None;
    while let Some(arg) = args.next() {
        if arg == "--run-minimind" {
            explicit = args.next().map(PathBuf::from);
            break;
        }
    }
    let measure = minimind::measure_first_present(explicit.as_deref())
        .map_err(|err| anyhow::anyhow!(err))?;
    if !measure.matches_shipped {
        eprintln!(
            "refusing to run: {} is not the shipped MiniMind2-Small file",
            measure.path.display()
        );
        std::process::exit(1);
    }
    let report = execute(&measure).map_err(|err| anyhow::anyhow!(err))?;
    println!("{report}");
    Ok(())
}

fn execute(measure: &WeightMeasure) -> Result<String, String> {
    let dir = measure
        .path
        .parent()
        .ok_or_else(|| "weights path has no directory".to_string())?;
    let tokenizer = Tokenizer::from_file(dir.join("tokenizer.json"))
        .map_err(|err| format!("could not read tokenizer.json: {err}"))?;
    let encoding = tokenizer
        .encode(PROMPT, false)
        .map_err(|err| format!("could not encode the prompt: {err}"))?;
    let prompt_ids = encoding.get_ids().to_vec();
    if prompt_ids.is_empty() {
        return Err("the prompt encoded to no tokens".to_string());
    }
    let model = load_model(&measure.path)?;
    let mut caches = (0..LAYERS)
        .map(|_| LayerCache {
            k: Vec::new(),
            v: Vec::new(),
            len: 0,
        })
        .collect::<Vec<_>>();
    let mut ids = prompt_ids.clone();
    let prompt_len = ids.len();
    // The first new token is the argmax after the whole prompt is in the cache.
    for pos in 0..prompt_len - 1 {
        let token = ids[pos] as usize;
        forward_token(&model, &mut caches, token, pos)?;
    }
    for _ in 0..NEW_TOKENS {
        let pos = ids.len() - 1;
        let token = ids[pos] as usize;
        let logits = forward_token(&model, &mut caches, token, pos)?;
        ids.push(argmax(&logits) as u32);
    }
    let new_ids = &ids[prompt_len..];
    let decoded = tokenizer
        .decode(new_ids, false)
        .map_err(|err| format!("could not decode new tokens: {err}"))?;
    Ok(format!(
        "{name}\ncommand: remote-viewer --run-minimind {path}\nbytes: {bytes}\nsha256: {sha}\nprompt: {prompt:?}\nprompt_token_ids: {prompt_ids:?}\nnew_token_ids: {new_ids:?}\ndecoded_new_tokens: {decoded:?}\nThe model network was executed.\nThis desktop package is not a phone release.",
        name = minimind::SHIPPED_MODEL_NAME,
        path = measure.path.display(),
        bytes = measure.bytes,
        sha = measure.sha256,
        prompt = PROMPT,
        prompt_ids = prompt_ids,
        new_ids = new_ids,
        decoded = decoded,
    ))
}

fn load_model(path: &Path) -> Result<Model, String> {
    let mut file = File::open(path).map_err(|err| format!("open {}: {err}", path.display()))?;
    let mut header_len_buf = [0u8; 8];
    file.read_exact(&mut header_len_buf)
        .map_err(|err| format!("read header length: {err}"))?;
    let header_len = u64::from_le_bytes(header_len_buf) as usize;
    let mut header_buf = vec![0u8; header_len];
    file.read_exact(&mut header_buf)
        .map_err(|err| format!("read header: {err}"))?;
    let header: serde_json::Value = serde_json::from_slice(&header_buf)
        .map_err(|err| format!("parse safetensors header: {err}"))?;
    let header_obj = header
        .as_object()
        .ok_or_else(|| "safetensors header is not an object".to_string())?;
    let mut body = Vec::new();
    file.read_to_end(&mut body)
        .map_err(|err| format!("read tensor bytes: {err}"))?;
    let mut tensors = HashMap::new();
    for (name, meta) in header_obj {
        if name == "__metadata__" {
            continue;
        }
        let dtype = meta
            .get("dtype")
            .and_then(|v| v.as_str())
            .ok_or_else(|| format!("{name} has no dtype"))?;
        if dtype != "F16" {
            return Err(format!("{name} is {dtype}, expected F16"));
        }
        let offsets = meta
            .get("data_offsets")
            .and_then(|v| v.as_array())
            .ok_or_else(|| format!("{name} has no data_offsets"))?;
        let start = offsets
            .first()
            .and_then(|v| v.as_u64())
            .ok_or_else(|| format!("{name} start offset"))? as usize;
        let end = offsets
            .get(1)
            .and_then(|v| v.as_u64())
            .ok_or_else(|| format!("{name} end offset"))? as usize;
        if end < start || end > body.len() || (end - start) % 2 != 0 {
            return Err(format!("{name} offsets {start}..{end} are not valid"));
        }
        let mut values = Vec::with_capacity((end - start) / 2);
        for chunk in body[start..end].chunks_exact(2) {
            let bits = u16::from_le_bytes([chunk[0], chunk[1]]);
            values.push(f16_to_f32(bits));
        }
        tensors.insert(name.clone(), values);
    }
    let embed = take(&mut tensors, "model.embed_tokens.weight", VOCAB * HIDDEN)?;
    let norm = take(&mut tensors, "model.norm.weight", HIDDEN)?;
    let mut layers = Vec::with_capacity(LAYERS);
    for i in 0..LAYERS {
        let p = format!("model.layers.{i}");
        layers.push(Layer {
            input_norm: take(&mut tensors, &format!("{p}.input_layernorm.weight"), HIDDEN)?,
            post_norm: take(
                &mut tensors,
                &format!("{p}.post_attention_layernorm.weight"),
                HIDDEN,
            )?,
            q: take(&mut tensors, &format!("{p}.self_attn.q_proj.weight"), HIDDEN * HIDDEN)?,
            k: take(
                &mut tensors,
                &format!("{p}.self_attn.k_proj.weight"),
                KV_HEADS * HEAD_DIM * HIDDEN,
            )?,
            v: take(
                &mut tensors,
                &format!("{p}.self_attn.v_proj.weight"),
                KV_HEADS * HEAD_DIM * HIDDEN,
            )?,
            o: take(&mut tensors, &format!("{p}.self_attn.o_proj.weight"), HIDDEN * HIDDEN)?,
            gate: take(
                &mut tensors,
                &format!("{p}.mlp.gate_proj.weight"),
                INTERMEDIATE * HIDDEN,
            )?,
            up: take(
                &mut tensors,
                &format!("{p}.mlp.up_proj.weight"),
                INTERMEDIATE * HIDDEN,
            )?,
            down: take(
                &mut tensors,
                &format!("{p}.mlp.down_proj.weight"),
                HIDDEN * INTERMEDIATE,
            )?,
        });
    }
    if !tensors.is_empty() {
        return Err(format!(
            "unused tensors: {}",
            tensors.keys().cloned().collect::<Vec<_>>().join(", ")
        ));
    }
    Ok(Model {
        embed,
        norm,
        layers,
    })
}

fn take(tensors: &mut HashMap<String, Vec<f32>>, name: &str, len: usize) -> Result<Vec<f32>, String> {
    let values = tensors
        .remove(name)
        .ok_or_else(|| format!("missing tensor {name}"))?;
    if values.len() != len {
        return Err(format!("{name} has {} values, expected {len}", values.len()));
    }
    Ok(values)
}

fn forward_token(
    model: &Model,
    caches: &mut [LayerCache],
    token: usize,
    pos: usize,
) -> Result<Vec<f32>, String> {
    if token >= VOCAB {
        return Err(format!("token {token} is outside the 6400 vocab"));
    }
    let mut x = model.embed[token * HIDDEN..(token + 1) * HIDDEN].to_vec();
    for (layer, cache) in model.layers.iter().zip(caches.iter_mut()) {
        let normed = rms_norm(&x, &layer.input_norm);
        let q = matvec(&layer.q, &normed);
        let k = matvec(&layer.k, &normed);
        let v = matvec(&layer.v, &normed);
        let q = rope_heads(&q, HEADS, pos);
        let k = rope_heads(&k, KV_HEADS, pos);
        cache.k.extend_from_slice(&k);
        cache.v.extend_from_slice(&v);
        cache.len += 1;
        let mixed = attend(&q, &cache.k, &cache.v, cache.len);
        let attn = matvec(&layer.o, &mixed);
        for (slot, add) in x.iter_mut().zip(attn) {
            *slot += add;
        }
        let normed = rms_norm(&x, &layer.post_norm);
        let gate = matvec(&layer.gate, &normed);
        let up = matvec(&layer.up, &normed);
        let mut hidden = Vec::with_capacity(INTERMEDIATE);
        for (g, u) in gate.iter().zip(up) {
            hidden.push(silu(*g) * u);
        }
        let mlp = matvec(&layer.down, &hidden);
        for (slot, add) in x.iter_mut().zip(mlp) {
            *slot += add;
        }
    }
    let x = rms_norm(&x, &model.norm);
    Ok(matvec_tied(&model.embed, &x))
}

fn attend(q: &[f32], k: &[f32], v: &[f32], len: usize) -> Vec<f32> {
    let scale = 1.0 / (HEAD_DIM as f32).sqrt();
    let n_rep = HEADS / KV_HEADS;
    let mut out = vec![0.0; HEADS * HEAD_DIM];
    for head in 0..HEADS {
        let kv_head = head / n_rep;
        let q_head = &q[head * HEAD_DIM..(head + 1) * HEAD_DIM];
        let mut scores = Vec::with_capacity(len);
        let mut max_score = f32::NEG_INFINITY;
        for step in 0..len {
            let k_at = k_at(k, step, kv_head);
            let mut dot = 0.0;
            for d in 0..HEAD_DIM {
                dot += q_head[d] * k_at[d];
            }
            let score = dot * scale;
            if score > max_score {
                max_score = score;
            }
            scores.push(score);
        }
        let mut sum = 0.0;
        let mut weights = Vec::with_capacity(len);
        for score in &scores {
            let w = (score - max_score).exp();
            sum += w;
            weights.push(w);
        }
        let inv = 1.0 / sum;
        for (d_out, slot) in out[head * HEAD_DIM..(head + 1) * HEAD_DIM]
            .iter_mut()
            .enumerate()
        {
            let mut acc = 0.0;
            for step in 0..len {
                acc += weights[step] * inv * v_at(v, step, kv_head)[d_out];
            }
            *slot = acc;
        }
    }
    out
}

fn k_at(k: &[f32], step: usize, kv_head: usize) -> &[f32] {
    let start = step * KV_HEADS * HEAD_DIM + kv_head * HEAD_DIM;
    &k[start..start + HEAD_DIM]
}

fn v_at(v: &[f32], step: usize, kv_head: usize) -> &[f32] {
    k_at(v, step, kv_head)
}

fn rope_heads(values: &[f32], heads: usize, pos: usize) -> Vec<f32> {
    let mut out = values.to_vec();
    for head in 0..heads {
        let start = head * HEAD_DIM;
        let head_slice = &mut out[start..start + HEAD_DIM];
        let mut rotated = vec![0.0; HEAD_DIM];
        let half = HEAD_DIM / 2;
        for i in 0..half {
            let exponent = (2 * i) as f32 / HEAD_DIM as f32;
            let freq = ROPE_THETA.powf(-exponent);
            let angle = pos as f32 * freq;
            let (cos, sin) = (angle.cos(), angle.sin());
            let a = head_slice[i];
            let b = head_slice[i + half];
            rotated[i] = a * cos - b * sin;
            rotated[i + half] = b * cos + a * sin;
        }
        head_slice.copy_from_slice(&rotated);
    }
    out
}

fn rms_norm(x: &[f32], weight: &[f32]) -> Vec<f32> {
    let mut square = 0.0;
    for value in x {
        square += value * value;
    }
    let inv = 1.0 / (square / x.len() as f32 + RMS_EPS).sqrt();
    x.iter()
        .zip(weight)
        .map(|(value, scale)| value * inv * scale)
        .collect()
}

fn matvec(weight: &[f32], input: &[f32]) -> Vec<f32> {
    let cols = input.len();
    let rows = weight.len() / cols;
    let mut out = vec![0.0; rows];
    for row in 0..rows {
        let w = &weight[row * cols..(row + 1) * cols];
        let mut acc = 0.0;
        for (a, b) in w.iter().zip(input) {
            acc += a * b;
        }
        out[row] = acc;
    }
    out
}

fn matvec_tied(embed: &[f32], hidden: &[f32]) -> Vec<f32> {
    let mut logits = vec![0.0; VOCAB];
    for token in 0..VOCAB {
        let row = &embed[token * HIDDEN..(token + 1) * HIDDEN];
        let mut acc = 0.0;
        for (a, b) in row.iter().zip(hidden) {
            acc += a * b;
        }
        logits[token] = acc;
    }
    logits
}

fn silu(value: f32) -> f32 {
    value / (1.0 + (-value).exp())
}

fn argmax(values: &[f32]) -> usize {
    let mut best = 0;
    for (index, value) in values.iter().enumerate().skip(1) {
        if *value > values[best] {
            best = index;
        }
    }
    best
}

fn f16_to_f32(half: u16) -> f32 {
    let sign = (half >> 15) & 1;
    let exp = (half >> 10) & 0x1f;
    let frac = half & 0x3ff;
    let bits = if exp == 0 {
        if frac == 0 {
            (sign as u32) << 31
        } else {
            let mut mantissa = frac;
            let mut exponent = 127 - 15 + 1;
            while mantissa & 0x400 == 0 {
                mantissa <<= 1;
                exponent -= 1;
            }
            mantissa &= 0x3ff;
            ((sign as u32) << 31) | (exponent << 23) | ((mantissa as u32) << 13)
        }
    } else if exp == 31 {
        ((sign as u32) << 31) | 0x7f80_0000 | ((frac as u32) << 13)
    } else {
        ((sign as u32) << 31) | (((exp as u32) + (127 - 15)) << 23) | ((frac as u32) << 13)
    };
    f32::from_bits(bits)
}
