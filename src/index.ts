#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
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

  registerCheckWalletAmlTool(server, createProvider(config), { isMock: !config.apiKey });

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/**
 * True when this module is the process entry point. A plain
 * `import.meta.url === file://${process.argv[1]}` check fails when the server
 * is launched through npm's .bin symlink (`npx`, the documented install path):
 * Node realpaths the ESM main module, so import.meta.url is the resolved file
 * while argv[1] is still the symlink. Compare against the realpath, and
 * pathToFileURL handles Windows drive letters / URL-encoding.
 */
function isEntryPoint(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  try {
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  main().catch((error) => {
    console.error("Failed to start satoshkin-aml-mcp:", error);
    process.exit(1);
  });
}
