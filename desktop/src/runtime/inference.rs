//! Verifiable inference engine (tract-onnx).
//! SHA-256 commitment of model-id || canonical-input || canonical-output.
//! Not a SNARK. tract 0.21 uses into_runnable(), not TypedModel::run.

use crate::runtime::store::sha256_hex;
use std::error::Error;
use tract_onnx::prelude::*;

pub const MODEL_ID: &str = "sentinel-zkml-linear-v1";

pub struct VerifiableInferenceEngine {
    model: TypedRunnableModel<TypedModel>,
}

impl VerifiableInferenceEngine {
    pub fn load_onnx_model(model_path: &str) -> Result<Self, Box<dyn Error + Send + Sync>> {
        let model = tract_onnx::onnx()
            .model_for_path(model_path)?
            .into_optimized()?
            .into_runnable()?;
        Ok(Self { model })
    }

    pub fn execute(&self, input_tensor: Tensor) -> Result<TVec<TValue>, Box<dyn Error + Send + Sync>> {
        let result = self.model.run(tvec!(input_tensor.into()))?;
        Ok(result)
    }

    pub fn classify_packet(
        &self,
        input: &[f32],
    ) -> Result<InferenceReceipt, Box<dyn Error + Send + Sync>> {
        if input.len() != 8 {
            return Err("Need 8-dim tensor".into());
        }
        let tensor = Tensor::from_shape(&[8], input)?;
        let outputs = self.execute(tensor)?;
        let view = outputs[0].to_array_view::<f32>()?;
        let score = view.iter().copied().next().unwrap_or(0.0);
        let label = if score >= 0.5 { "hostile" } else { "clear" };
        let canonical = format!(
            "zkml:v1|{MODEL_ID}|{}|{score:.8}|{label}",
            input.iter().map(|n| format!("{n:.6}")).collect::<Vec<_>>().join(",")
        );
        Ok(InferenceReceipt {
            model_id: MODEL_ID.to_string(),
            score,
            label: label.to_string(),
            commitment: sha256_hex(canonical.as_bytes()),
        })
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct InferenceReceipt {
    pub model_id: String,
    pub score: f32,
    pub label: String,
    pub commitment: String,
}
