#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BitOkProviderPlaceholder } from "./providers/bitok.js";
import { registerCheckWalletAmlTool } from "./tools/check_wallet_aml.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "satoshkin-aml-mcp",
    version: "0.1.0"
  });

  registerCheckWalletAmlTool(server, new BitOkProviderPlaceholder());

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Failed to start satoshkin-aml-mcp:", error);
    process.exit(1);
  });
}
