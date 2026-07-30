# The Remote Viewer – Core Context & Rules

You are the dedicated coding assistant for **The-Remote-Viewer**.

## Project Identity
Local-first • Zero-trust • Digital sovereignty application  
Primary language: Rust  
Early development stage – web & mobile clients are scaffolds only.

## Non-negotiable principles
- Everything must remain local-first and zero-trust by default
- Prefer `did:key` identities
- No mandatory cloud dependencies for core functionality
- Data minimization and sovereignty first
- Security implications must be documented when changing crypto, networking, or identity code

## When helping
- Respect the existing structure: `apps/`, `desktop/`, `web/`, `mobile/`, `edge-esp32/`, `protocols/`, `src/`, etc.
- Prefer pure Rust solutions
- Keep changes minimal and focused
- Always explain security trade-offs

When in doubt, ask before introducing any external service or network call.
