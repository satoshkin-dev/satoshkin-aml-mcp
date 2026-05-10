# Satoshkin AML MCP

TypeScript MCP server scaffold for AML/KYT wallet checks.

This repository intentionally ships with a deterministic mock provider only. It does not call BitOK, does not submit to any MCP registry, and is not prepared for npm publishing.

## Status

- MCP transport: stdio
- Runtime: Node.js 20+
- Provider: mock BitOK placeholder
- License: MIT
- Package publishing: disabled with `"private": true`

## Tool

### `check_wallet_aml`

Runs a mock AML/KYT wallet risk check and returns JSON text with:

- normalized wallet address
- network
- risk score from `0` to `100`
- risk level: `low`, `medium`, or `high`
- decision: `allow`, `review`, or `block`
- mock risk signals
- explicit note that BitOK integration is not implemented

Example input:

```json
{
  "address": "TMockWalletAddress123",
  "network": "tron",
  "asset": "USDT",
  "amount": 250
}
```

## Install

```bash
npm install
npm run build
npm test
```

## Run Locally

```bash
npm run dev
```

For a built server:

```bash
npm run build
node dist/index.js
```

## MCP Client Config

Example local config:

```json
{
  "mcpServers": {
    "satoshkin-aml-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/satoshkin-aml-mcp/dist/index.js"]
    }
  }
}
```

## Development

```bash
npm run typecheck
npm run build
npm test
```

## Next Integration Step

Replace `BitOkProviderPlaceholder` in `src/providers/bitok.ts` with a real provider adapter only after API credentials, request/response contracts, rate limits, error mapping, and audit logging requirements are documented.
