#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig, type SatoshkinConfig } from "./config.js";
import { BitOkProviderPlaceholder } from "./providers/bitok.js";
import { SatoshkinBackendProvider } from "./providers/satoshkin.js";
import { registerCheckWalletAmlTool } from "./tools/check_wallet_aml.js";
import type { AmlProvider } from "./types.js";

export function createProvider(config: SatoshkinConfig): AmlProvider {
  if (config.apiKey) {
    return new SatoshkinBackendProvider(config);
  }
  // console.error goes to the MCP client log, not the protocol stream.
  console.error(
    "satoshkin-aml-mcp: SATOSHKIN_API_KEY not set — running in MOCK mode. " +
      "Real AML/KYT screening requires an API key."
  );
  return new BitOkProviderPlaceholder();
}

export function createServer(config: SatoshkinConfig = loadConfig()): McpServer {
  const server = new McpServer({
    name: "satoshkin-aml-mcp",
    version: "0.2.0"
  });

  registerCheckWalletAmlTool(server, createProvider(config));

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
