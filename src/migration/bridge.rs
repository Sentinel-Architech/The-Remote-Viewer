use crate::migration::parser::LegacyPost;

pub struct ProtocolBridge;

impl ProtocolBridge {
    pub fn translate_to_remote_viewer_event(post: &LegacyPost) -> String {
        format!(
            "[Migrated Event] @{} at {}: {}",
            post.author_handle, post.timestamp, post.content
        )
    }
}
