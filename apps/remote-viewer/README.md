# The Remote Viewer

> This space connects over the network. The Sentinel on your device does not need it.

Native social layer for Viewers — posts, photos, video, private talk, optional place.

## Run

```bash
cd apps/remote-viewer
python3 -m http.server 8777 --bind 127.0.0.1
# open http://127.0.0.1:8777/
```

## What Viewers see

| Screen | Purpose |
|--------|--------|
| **Home** | Posts from you and people you follow |
| **Create** | Text · photo · video · optional place |
| **Talk** | Private messages |
| **You** | Viewer ID · profile · people you follow |

No developer jargon in the interface. Media currently embeds small files (about 1.5 MB max per item). Larger media hosting can come later without changing the product language.
