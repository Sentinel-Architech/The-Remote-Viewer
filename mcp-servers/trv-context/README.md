# TRV Context MCP Server

Exposes local-first context from The Remote Viewer Hub to AI agents (Copilot, Cursor, etc.) via the Model Context Protocol.

## Tools

| Tool | Description |
|------|-------------|
| `get_hub_profile` | Current citizen handle and Ed25519 registration status |
| `get_optical_airgap_status` | Latest optical air-gap integrity status |
| `get_wallet_context` | Connected Solana public key and SIWS session (if any) |

## Quick start

```bash
cd mcp-servers/trv-context
npm install
npm run dev
```

## Register with Copilot / Cursor

Add to your MCP configuration (example):

```json
{
  "mcpServers": {
    "trv-context": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/The-Remote-Viewer/mcp-servers/trv-context/src/index.ts"]
    }
  }
}
```

## Design note

This server is intentionally local-first. It never requires Solana or any remote service to function. Wire real data sources (Better Auth session, integrity-pulse output, SolanaProvider state) as the parallel tracks mature.
