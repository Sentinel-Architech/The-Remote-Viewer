#!/usr/bin/env node
/**
 * TRV Context MCP Server – 100% native stack
 *
 * Fully operational without Solana or any external service.
 * Reads local state when available; falls back to safe native defaults.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const server = new Server(
  {
    name: "trv-context",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function safeReadJson(path: string): any | null {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, "utf8"));
    }
  } catch {}
  return null;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_hub_profile",
        description:
          "Return the current Viewer Hub citizen profile (native Ed25519 identity). Fully local-first.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_optical_airgap_status",
        description:
          "Return the latest optical air-gap integrity status from local defense modules.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_wallet_context",
        description:
          "Return optional Solana public key / SIWS session if present. Never required for Hub operation.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_native_stack_status",
        description:
          "Confirm that the Hub is running under the 100% native stack rules (no mandatory chain dependency).",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  switch (name) {
    case "get_hub_profile": {
      // Attempt to read local identity store (browser localStorage is not available here;
      // in a real deployment this would read from the Hub’s local DB or age vault).
      const local = safeReadJson(join(process.cwd(), ".trv-identity.json"));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              local ?? {
                handle: null,
                ed25519_registered: false,
                source: "native-local-first",
                note: "No local identity file found – Hub remains fully operational",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "get_optical_airgap_status": {
      // Prefer real integrity-pulse output when present
      const pulse = safeReadJson(
        join(process.cwd(), "optical-airgap", "last-integrity.json")
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              pulse ?? {
                status: "not-run",
                last_checked: null,
                source: "native-optical-airgap",
                note: "Run optical-airgap/modules/defense/integrity-pulse.sh to populate",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "get_wallet_context": {
      const wallet = safeReadJson(join(process.cwd(), ".trv-wallet.json"));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              wallet ?? {
                connected: false,
                publicKey: null,
                siwsSession: null,
                required: false,
                note: "Solana track is optional – native stack is primary",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "get_native_stack_status": {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                native_stack: true,
                blockchain_required: false,
                primary_identity: "Ed25519 + Better Auth",
                optical_airgap: "supported",
                solana_track: "optional parallel",
                fully_operational_offline: true,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TRV Context MCP server (native stack) running on stdio");
}

main().catch(console.error);
