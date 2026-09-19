#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "trv-context",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_hub_profile",
        description: "Return the current Viewer Hub citizen profile handle and basic identity status (local-first).",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_optical_airgap_status",
        description: "Return the latest optical air-gap integrity / verification status.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_wallet_context",
        description: "Return currently connected Solana public key (if any) and SIWS session status.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  switch (name) {
    case "get_hub_profile":
      // TODO: read from local Hub store / Better Auth session
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              handle: "placeholder",
              ed25519_registered: true,
              source: "local-first",
            }),
          },
        ],
      };

    case "get_optical_airgap_status":
      // TODO: call integrity-pulse or read last known status
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "unknown",
              last_checked: null,
              note: "Wire to optical-airgap/modules/defense/integrity-pulse.sh",
            }),
          },
        ],
      };

    case "get_wallet_context":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              connected: false,
              publicKey: null,
              siwsSession: null,
              note: "Populate from SolanaProvider / useSiwsAuth",
            }),
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TRV Context MCP server running on stdio");
}

main().catch(console.error);
