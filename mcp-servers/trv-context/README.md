# TRV Context MCP Server

Exposes local-first context from The Remote Viewer to AI agents via the Model Context Protocol.

**100% native stack. Fully operational offline. Solana never required.**

## Tools (v0.3)

| Tool | Description |
|------|-------------|
| `get_hub_profile` | Citizen handle / Ed25519 status |
| `get_optical_airgap_status` | Optical air-gap integrity |
| `get_wallet_context` | Optional Solana context (never required) |
| `get_native_stack_status` | Confirms native-stack rules in force |
| `evaluate_sentinel_security` | Native MoE security decision (individual / enhanced / whole-network) |

## Quick start

```bash
cd mcp-servers/trv-context
npm install
npm run dev
```

## Register with an agent

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

This server is local-first. It never requires Solana or any remote service. Wire real Hub / optical / wallet state as the parallel tracks mature.
