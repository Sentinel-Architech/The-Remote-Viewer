# Abuse limits (free tier)

Free Viewers get **weaker signal**, not fewer rights under the constitution of the product.

## Allowed to throttle (free)

- Media bitrate / resolution  
- Search rate  
- Broadcast reach  
- Concurrent live sessions  

## Never throttled by “free”

- Ability to report Integrity concerns  
- Creator split rules when they sell  
- Mute / block / report of other Viewers  
- Access to public policy docs  

## Node / $96

Removes comms cap and soft signal caps tied to free tier only.

## Implementation sketch

Feature flags: `free.signal`, `free.rpm_search`, `free.concurrent_live`. Defaults conservative; raise only with evidence.
