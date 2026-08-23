//! Model orchestration worker (ollama-rs).
//! Desktop binds a local Ollama daemon. The hub DApp never sees the seed.

use ollama_rs::generation::completion::request::GenerationRequest;
use ollama_rs::Ollama;
use std::error::Error;
use tokio_stream::StreamExt;

pub struct ModelOrchestrator {
    client: Ollama,
    model_name: String,
}

impl ModelOrchestrator {
    pub fn new(host: String, port: u16, model_name: String) -> Self {
        Self {
            client: Ollama::new(host, port),
            model_name,
        }
    }

    pub fn local_llama3() -> Self {
        Self::new("http://127.0.0.1".to_string(), 11434, "llama3".to_string())
    }

    pub async fn generate_stream_response(
        &self,
        prompt: String,
        mut callback: impl FnMut(String),
    ) -> Result<(), Box<dyn Error + Send + Sync>> {
        let request = GenerationRequest::new(self.model_name.clone(), prompt);
        let mut stream = self.client.generate_stream(request).await?;

        while let Some(res) = stream.next().await {
            let chunk = res?;
            for part in chunk {
                if !part.response.is_empty() {
                    callback(part.response);
                }
            }
        }
        Ok(())
    }
}
