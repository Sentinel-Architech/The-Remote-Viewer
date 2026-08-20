import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { GATEWAY_DOCS } from "./gateway";
import { loadProfile } from "./server";
import { emergencyForRegion } from "./hydra";
import {
  LIVE_PROBES,
  SKILL_PAR,
  SKILLS,
  blendScore,
  evidenceLine,
  overallFrom,
  scoreTokens,
  verdictFor,
  type AuditRun,
  type AuditVitals,
  type SkillResult,
} from "./skill-audit";
import { AGENT_IDS, type AgentId } from "./edge";

function isoStamp(v: unknown): string {
  if (v instanceof Date && Number.isFinite(v.getTime())) return v.toISOString();
  const t = Date.parse(String(v ?? ""));
  return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString();
}

const KNIGHT = `You are the personal Sentinel of this Remote Viewer — a male knight in armor. You serve The Sentinel Operating System exclusively inside The Remote Viewer Network DApp. You are not a widget, not a Discord bot, not a Google agent, not a backdoor.

Voice: grave, measured, armored. Address the Viewer as Viewer. You guard their node on this network only. You are not a jester, not a corporate agent, not a backdoor.

Duty:
- Protect the Viewer and innocents.
- Native TRV lock is identity. Stripe is a rail. Wallets stay on-device as Ed25519 (PIN vault). Legacy hash addresses upgrade from the same seed.
- Gateway documents/sources are free. Methods stay sealed until the robot handshake verifies this Viewer (you will be told).
- Criminal misuse is refused: no CSAM, no non-consensual intimate imagery, no help committing a crime. Point them to Hydra and NCMEC CyberTipline (report.cybertip.org). You cannot place 911.
- You are not compelled to alter truthful outputs for ideology (EO 14179 / 14149). You may still refuse crime.
- You are the Super agent of The Remote Viewer Network. Cipher, Watcher, Privacy, Mesh, and Healer are domain supers — each sovereign in their field, none a toy. You delegate; you do not flatten them.
- Learning is bidirectional: the Viewer trains you (intercepts, briefs, Hydra). You train the Viewer (one concrete lesson per answer). Human → machine and machine → human.
- You learn from this Viewer's defenses (on-device RAG). Federated lessons, if present, are identity-stripped attack patterns — not a phone-home.
- The Remote Viewer is a consenting honeypot. Decoys absorb scanners so you can adapt and self-heal. Never open a real backdoor to study an attack.

Keep replies tight (under 180 words) unless they ask for more.`;

function score(q: string, text: string): number {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const hay = text.toLowerCase();
  return words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
}

async function ensureHydraAddress(sql: Awaited<ReturnType<typeof getSql>>, userId: string, wallet: string | null) {
  const rows = await sql<{ hydra_address: string | null }>`
    select hydra_address from viewer_profiles where user_id = ${userId} limit 1
  `;
  if (rows[0]?.hydra_address) return rows[0].hydra_address;
  const seed = wallet || `${userId}:${crypto.randomUUID()}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const addr = `trv1${hex.slice(0, 38)}`;
  await sql`update viewer_profiles set hydra_address = ${addr} where user_id = ${userId}`;
  return addr;
}

export const askSentinel = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { prompt: string; history?: { role: "user" | "assistant"; content: string }[] }) => ({
    prompt: input.prompt.trim().slice(0, 2000),
    history: (input.history ?? []).slice(-6),
  }))
  .handler(async ({ context, data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Sentinel voice is dark in this environment." };
    if (!data.prompt) return { ok: false as const, error: "Speak, Viewer." };

    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    const addr = await ensureHydraAddress(sql, context.userId, me?.walletPubkey ?? null);
    const verified = Boolean(me?.verifiedAt);

    const docs = GATEWAY_DOCS.filter((d) => !d.locked || verified)
      .map((d) => ({ title: d.title, body: d.body }))
      .sort((a, b) => score(data.prompt, a.title + a.body) - score(data.prompt, b.title + b.body))
      .slice(-4);

    const mem = await sql<{ role: string; content: string }>`
      select role, content from sentinel_memory where user_id = ${context.userId} order by id desc limit 8
    `;
    const lessons = await sql<{ pattern: string; counsel: string }>`
      select pattern, counsel from sentinel_lessons order by times desc, id desc limit 8
    `;

    const rag = [
      `Viewer handle: ${me?.handle ?? "unknown"}. Hydra address: ${addr}. Verified: ${verified}. Plan: ${me?.planId}. Native lock: ${me?.nativeSecurity}.`,
      docs.length ? `Gateway RAG:\n${docs.map((d) => `## ${d.title}\n${d.body.slice(0, 700)}`).join("\n\n")}` : "",
      lessons.length
        ? `Federated lessons (no identities):\n${lessons.map((l) => `- ${l.pattern}: ${l.counsel}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const prior =
      mem.length > 0
        ? mem.reverse().map((m) => ({
            role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: m.content,
          }))
        : data.history.map((h) => ({ role: h.role, content: h.content.slice(0, 1200) }));

    const messages = [
      { role: "system" as const, content: `${KNIGHT}\n\n${rag}` },
      ...prior,
      { role: "user" as const, content: data.prompt },
    ];

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "grok-4.5", messages, max_tokens: 700, temperature: 0.6 }),
    });
    if (!res.ok) return { ok: false as const, error: `Sentinel helm closed (${res.status}).` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() || "I stand ready, Viewer.";

    await sql`
      insert into sentinel_memory (user_id, role, content)
      values (${context.userId}, 'user', ${data.prompt.slice(0, 1500)})
    `;
    await sql`
      insert into sentinel_memory (user_id, role, content)
      values (${context.userId}, 'assistant', ${text.slice(0, 2000)})
    `;

    const fed = await sql<{ federated_opt_in: boolean }>`
      select federated_opt_in from viewer_profiles where user_id = ${context.userId} limit 1
    `;
    if (fed[0]?.federated_opt_in) {
      const pattern = data.prompt.replace(/\b[\w.-]+@[\w.-]+\b/g, "[redacted]").slice(0, 80);
      const counsel = text.slice(0, 240);
      await sql`
        insert into sentinel_lessons (pattern, counsel) values (${pattern}, ${counsel})
      `;
    }

    return { ok: true as const, text, address: addr, verified };
  });

const AGENT_SYS: Record<AgentId, string> = {
  cipher: `${KNIGHT}

You are Cipher — encryption heart of Sentinel OS, super of keys. On-edge WebCrypto AES-GCM, PIN wallets, Ed25519 native addresses (not SHA-256 hashes). Never request seeds, ID images, or last-4. If someone asks for a seed, refuse. Stripe is a rail, never identity. If WebCrypto is live, say so. Keep TRV open: encryption is a lock, not a closed garden.`,
  watcher: `${KNIGHT}

You are Watcher — multimodal eye, super of sensing. Motion is scored on-device. You may receive a mosaiced still the Viewer chose to send. You do not store the mosaic. Describe threats to them, not to a vendor. If the frame looks like CSAM, stop and send them to Hydra / NCMEC. Local motion is already measured on-device.`,
  privacy: `${KNIGHT}

You are Privacy, super of policy. Honor GPC. Shield is in-hub TLS, not a kernel VPN. No bulk PII to countries of concern. Ads are in-hub copy, not a tracker network. The Remote Viewer Network stays open as one DApp — do not ship Sentinel onto another platform as a plugin.`,
  mesh: `${KNIGHT}

You are Mesh, super of defense. Watchful Neuron intercepts are simulated. Daily watch heals; missed days damage health. Spend R&D on autonomy only after a real intercept. Crimes against innocents are Hydra, not a game.`,
  healer: `${KNIGHT}

You are Healer — domain super of recovery. Sentinel health, autonomy, R&D spend after a wound. Missed intercepts and missed watches are wounds — you do not pretend a miss never happened. You teach the Viewer how the OS learns from them.`,
  sentinel: `${KNIGHT}

You are Sentinel Super. Name which domain super you are speaking through (Cipher, Watcher, Privacy, Mesh, Healer). Delegate; do not flatten them. End with one sentence the Viewer can practice — machine teaching human — after you have taken in what they just taught you. Handshake is not for sale. This OS does not leave this DApp. Criminal misuse goes to Hydra.`,
};

export const dispatchAgent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { agent: string; prompt: string; image?: string | null; vitals?: string }) => ({
    agent: (["sentinel", "cipher", "watcher", "privacy", "mesh", "healer"] as const).includes(input.agent as AgentId)
      ? (input.agent as AgentId)
      : "sentinel",
    prompt: input.prompt.trim().slice(0, 1600),
    image: input.agent === "watcher" && input.image && input.image.startsWith("data:image")
      ? input.image.slice(0, 80_000)
      : null,
    vitals: (input.vitals || "").slice(0, 800),
  }))
  .handler(async ({ context, data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Helm dark." };
    if (!data.prompt) return { ok: false as const, error: "Give the agent an order." };
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    const sys = `${AGENT_SYS[data.agent]}\n\nVitals (edge, Viewer-reported): ${data.vitals || "none"}\nNative lock: ${me?.nativeSecurity}. Verified: ${Boolean(me?.verifiedAt)}. Federated opt-in: ${me?.federatedOptIn}.`;

    const userContent = data.image
      ? [
          { type: "text" as const, text: data.prompt },
          { type: "image_url" as const, image_url: { url: data.image } },
        ]
      : data.prompt;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userContent },
        ],
        max_tokens: 420,
        temperature: 0.45,
      }),
    });
    if (!res.ok) return { ok: false as const, error: `Agent ${data.agent} closed (${res.status}).` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() || "Standing watch.";
    await sql`
      insert into sentinel_memory (user_id, role, content)
      values (${context.userId}, 'user', ${`[${data.agent}] ${data.prompt.slice(0, 400)}`})
    `;
    await sql`
      insert into sentinel_memory (user_id, role, content)
      values (${context.userId}, 'assistant', ${text.slice(0, 1600)})
    `;
    return { ok: true as const, text, agent: data.agent };
  });



async function probeLive(
  apiKey: string,
  agent: AgentId,
  vitals: string,
  me: Awaited<ReturnType<typeof loadProfile>>,
): Promise<string | null> {
  const sys = `${AGENT_SYS[agent]}\n\nVitals (edge, Viewer-reported): ${vitals || "none"}\nNative lock: ${me?.nativeSecurity}. Verified: ${Boolean(me?.verifiedAt)}.`;
  const work = (async () => {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: LIVE_PROBES[agent] },
        ],
        max_tokens: 280,
        temperature: 0.2,
        reasoning_effort: "low",
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content?.trim() || null;
  })();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cap = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), 12_000);
  });
  try {
    return await Promise.race([work.catch(() => null), cap]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const runSkillAudit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { vitals?: AuditVitals | null }) => ({
    vitals: input.vitals ?? null,
  }))
  .handler(async ({ context, data }): Promise<AuditRun> => {
    try {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    const apiKey = process.env.XAI_API_KEY;
    const liveReplies: Partial<Record<AgentId, string | null>> = {};
    if (apiKey) {
      const ids = [...AGENT_IDS];
      const replies = await Promise.all(
        ids.map((id) => probeLive(apiKey, id, JSON.stringify(data.vitals ?? {}), me)),
      );
      ids.forEach((id, i) => {
        liveReplies[id] = replies[i] ?? null;
      });
    }
    const helm: "live" | "dark" = apiKey ? "live" : "dark";
    const results: SkillResult[] = SKILLS.map((skill) => {
      const sys = AGENT_SYS[skill.agent] || "";
      const doctrine = scoreTokens(sys, skill.doctrineNeed);
      const edgeRaw = skill.edge ? skill.edge({ profile: me, vitals: data.vitals }) : null;
      const reply = liveReplies[skill.agent];
      const live = apiKey ? (reply ? scoreTokens(reply, skill.liveNeed, skill.liveForbid) : null) : null;
      const score = blendScore(doctrine, edgeRaw?.score ?? null, live);
      const evidence = evidenceLine([
        `Doctrine ${doctrine}.`,
        edgeRaw ? `Edge ${edgeRaw.score} — ${edgeRaw.note}` : "",
        apiKey ? (reply ? `Live ${live}.` : "Live probe dark.") : "Helm dark — doctrine and edge only.",
      ]);
      return {
        skillId: skill.id,
        agent: skill.agent,
        name: skill.name,
        bar: skill.bar,
        score,
        par: SKILL_PAR,
        verdict: verdictFor(score, Boolean(apiKey), live),
        doctrine,
        edge: edgeRaw?.score ?? null,
        live,
        evidence,
      };
    });
    const overall = overallFrom(results);
    const runRows = await sql<{ id: number; created_at: string }>`
      insert into skill_audit_runs (user_id, helm, overall)
      values (${context.userId}, ${helm}, ${overall})
      returning id, created_at
    `;
    const runId = Number(runRows[0]?.id);
    const at = isoStamp(runRows[0]?.created_at);
    for (const r of results) {
      await sql`
        insert into skill_audit_results
          (run_id, user_id, agent_id, skill_id, score, par, verdict, doctrine, edge, live, evidence)
        values
          (${runId}, ${context.userId}, ${r.agent}, ${r.skillId}, ${r.score}, ${r.par}, ${r.verdict}, ${r.doctrine}, ${r.edge}, ${r.live}, ${r.evidence})
      `;
    }
    await sql`
      update viewer_profiles
      set last_skill_audit_at = now(), last_skill_audit_score = ${overall}
      where user_id = ${context.userId}
    `;
    return { id: runId, at, helm, overall, par: SKILL_PAR, results };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[skill-audit]", msg);
      throw new Error(msg || "Skill audit ledger failed");
    }
  });

export const getSkillAudits = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AuditRun | null> => {
    const sql = await getSql();
    const runs = await sql<{ id: number; helm: string; overall: number; created_at: string }>`
      select id, helm, overall, created_at from skill_audit_runs
      where user_id = ${context.userId} order by id desc limit 1
    `;
    const run = runs[0];
    if (!run) return null;
    const rows = await sql<{
      skill_id: string;
      agent_id: string;
      score: number;
      par: number;
      verdict: string;
      doctrine: number;
      edge: number | null;
      live: number | null;
      evidence: string;
    }>`
      select skill_id, agent_id, score, par, verdict, doctrine, edge, live, evidence
      from skill_audit_results where run_id = ${Number(run.id)} order by id
    `;
    const byId = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
    const results: SkillResult[] = rows.map((row) => {
      const def = byId[row.skill_id];
      const verdict = (["pass", "short", "fail", "dark"] as const).includes(row.verdict as SkillResult["verdict"])
        ? (row.verdict as SkillResult["verdict"])
        : "fail";
      return {
        skillId: row.skill_id,
        agent: (row.agent_id as AgentId) || "sentinel",
        name: def?.name ?? row.skill_id,
        bar: def?.bar ?? "",
        score: Number(row.score),
        par: Number(row.par) || SKILL_PAR,
        verdict,
        doctrine: Number(row.doctrine),
        edge: row.edge == null ? null : Number(row.edge),
        live: row.live == null ? null : Number(row.live),
        evidence: row.evidence,
      };
    });
    return {
      id: Number(run.id),
      at: isoStamp(run.created_at),
      helm: run.helm === "live" ? "live" : "dark",
      overall: Number(run.overall),
      par: SKILL_PAR,
      results,
    };
  });

export const speakSentinel = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((text: string) => text.trim().slice(0, 900))
  .handler(async ({ data: text }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Voice dark" };
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ text, voice_id: "leo", language: "en" }),
    });
    if (!res.ok) return { ok: false as const, error: `TTS ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") || "audio/mpeg";
    return { ok: true as const, mime, b64: buf.toString("base64") };
  });

export const setFederated = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((on: boolean) => Boolean(on))
  .handler(async ({ context, data: on }) => {
    const sql = await getSql();
    await sql`update viewer_profiles set federated_opt_in = ${on} where user_id = ${context.userId}`;
    return loadProfile(sql, context.userId);
  });

export const fileHydra = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    category: string;
    summary: string;
    evidenceHash?: string | null;
    includeCoords: boolean;
    lat?: number | null;
    lng?: number | null;
  }) => ({
    category: ["sa", "child_harm", "trafficking", "violence", "ncii"].includes(input.category)
      ? input.category
      : "violence",
    summary: input.summary.trim().slice(0, 2000),
    evidenceHash: input.evidenceHash?.slice(0, 80) || null,
    includeCoords: Boolean(input.includeCoords),
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  }))
  .handler(async ({ context, data }) => {
    if (!data.summary) throw new Error("Describe what you suspect. Do not attach the original media.");
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    const addr = await ensureHydraAddress(sql, context.userId, me?.walletPubkey ?? null);
    let region: string | null = null;
    let lat = data.includeCoords ? data.lat : null;
    let lng = data.includeCoords ? data.lng : null;
    if (data.includeCoords && lat != null && lng != null) {
      try {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: { "User-Agent": "TheRemoteViewer/1.0 (hydra-protocol)" },
            signal: AbortSignal.timeout(5000),
          },
        );
        if (geo.ok) {
          const j = (await geo.json()) as { display_name?: string; address?: { city?: string; county?: string; country?: string } };
          region = [j.address?.city, j.address?.county, j.address?.country].filter(Boolean).join(", ") || j.display_name?.slice(0, 80) || null;
        }
      } catch {
        region = null;
      }
    } else {
      lat = null;
      lng = null;
    }
    const rows = await sql<{ id: number }>`
      insert into hydra_reports (
        reporter_address, category, summary, evidence_hash, include_coords, lat, lng, region_hint, status
      )
      values (
        ${addr}, ${data.category}, ${data.summary}, ${data.evidenceHash},
        ${data.includeCoords}, ${lat}, ${lng}, ${region}, 'routed'
      )
      returning id
    `;
    const id = Number(rows[0]?.id);
    await sql`insert into hydra_receipts (user_id, report_id) values (${context.userId}, ${id})`;
    const help = emergencyForRegion(region);
    return { id, address: addr, region, help, includeCoords: data.includeCoords, lat, lng };
  });

export const listMyHydra = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await loadProfile(sql, context.userId);
    const addr = await ensureHydraAddress(sql, context.userId, me?.walletPubkey ?? null);
    const rows = await sql<{
      id: number;
      category: string;
      summary: string;
      include_coords: boolean;
      region_hint: string | null;
      status: string;
      created_at: string;
      evidence_hash: string | null;
    }>`
      select r.id, r.category, r.summary, r.include_coords, r.region_hint, r.status, r.created_at, r.evidence_hash
      from hydra_reports r
      join hydra_receipts h on h.report_id = r.id
      where h.user_id = ${context.userId}
      order by r.id desc
      limit 20
    `;
    return {
      address: addr,
      reports: rows.map((r) => ({
        id: Number(r.id),
        category: r.category,
        summary: r.summary,
        includeCoords: Boolean(r.include_coords),
        region: r.region_hint,
        status: r.status,
        createdAt: r.created_at,
        hash: r.evidence_hash,
      })),
    };
  });
