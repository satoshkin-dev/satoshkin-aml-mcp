# Satoshkin AML/KYT MCP Server

[![CI](https://github.com/skhmtp/satoshkin-aml-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/skhmtp/satoshkin-aml-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Status: v0.1 scaffold](https://img.shields.io/badge/status-v0.1%20scaffold-orange.svg)]()

MCP server for AML/KYT crypto wallet screening. It is designed to connect AI clients such as Claude Desktop, Claude Code, ChatGPT MCP clients, and internal agent tools to Satoshkin wallet risk checks.

This MCP server provides AI assistants with crypto compliance tools for AML (Anti-Money Laundering) and KYT (Know Your Transaction) screening. Compatible with Claude Desktop, Claude Code, and any MCP-compatible client.

The planned BitOK integration will support wallet risk scoring, source-of-funds analysis, sanctions exposure checks, and mixer-related address detection.

## Status

v0.1.0 is a scaffold with mock checks only.

Real BitOK API integration is planned for v0.2.

This repository does not contain BitOK credentials, production AML/KYT business logic, user data, or paid-tier enforcement. Those belong in the private backend service.

## Available Tool

### `check_wallet_aml`

Checks a crypto wallet address for AML/KYT risk. In v0.1.0 this returns deterministic mock metadata only.

Input:

```json
{
  "address": "TMockWalletAddress123",
  "chain": "BTC"
}
```

Supported `chain` values:

- `BTC`
- `ETH`
- `TRON`
- `USDT-ERC20`
- `USDT-TRC20`

Mock output:

```json
{
  "address": "TMockWalletAddress123",
  "chain": "BTC",
  "riskScore": "unknown",
  "status": "mock",
  "provider": "mock-bitok",
  "checkedAt": "2026-05-10T00:00:00.000Z",
  "message": "This is a mock response. Real AML screening via BitOK integration will be available in v0.2."
}
```

## Claude Desktop / Claude Code

This package is not published to npm yet. Use the public GitHub repository through `npx`.

Add this to your MCP settings:

```json
{
  "mcpServers": {
    "satoshkin-aml": {
      "command": "npx",
      "args": ["-y", "github:skhmtp/satoshkin-aml-mcp"]
    }
  }
}
```

For local development, use the built entrypoint:

```json
{
  "mcpServers": {
    "satoshkin-aml": {
      "command": "node",
      "args": ["/absolute/path/to/satoshkin-aml-mcp/dist/index.js"]
    }
  }
}
```

## Local Development

```bash
git clone https://github.com/skhmtp/satoshkin-aml-mcp.git
cd satoshkin-aml-mcp
npm install
npm run build
npm test
```

Run the server locally:

```bash
npm run dev
```

Run the built server:

```bash
npm run build
node dist/index.js
```

## Full AML/KYT Check Scope Planned For v0.2+

- Risk score `0-100`
- Source-of-funds tags: exchange, mixer, scam, sanctions, darknet, bridge, P2P, gambling
- First and last activity dates
- Total volume in and out
- Counterparty and cluster analysis
- Clear decisions for agent workflows: allow, review, block
- Rate limits and paid-tier checks through Satoshkin backend authentication

## Monetization Model

The MCP server is a free open-source connector.

Production checks will require authentication against the Satoshkin AML/KYT service. The backend can enforce free daily limits, paid tiers, API keys, and audit logging without exposing private implementation details in this repository.

## Related Satoshkin Products

- P2P bot: https://satoshkin.com
- AML/KYT Telegram bot: planned
- AML/KYT web app: planned

## Use Cases

- **OTC desks**: Screen counterparty wallets before settling P2P trades
- **Compliance officers**: Quick wallet risk checks during AI-assisted workflows
- **Crypto fund managers**: Vet wallet addresses for sanctions/mixer exposure via AI agent
- **Web3 builders**: Add AML screening to Claude/ChatGPT-powered dApps
- **Crypto journalists**: Investigate wallet history with AI assistance

## Why MCP Instead of REST API?

Traditional AML APIs (Chainalysis, Elliptic, TRM Labs) require:

- Custom integrations per AI client
- Backend infrastructure to broker calls
- Manual prompt engineering for context

This MCP server lets any AI assistant call AML checks **natively**, with structured input/output that the LLM understands. Install once, use across all your AI tools.

## Roadmap

- [x] v0.1: Scaffold with mock checks
- [ ] v0.2: Real BitOK API integration via Satoshkin backend proxy (paid-only $49/mo + 7-day trial)
- [ ] v0.3: Free tier rate-limiting + paid tier API key support
- [ ] v0.4: Additional chains (Solana, BNB, Polygon)
- [ ] v0.5: Source-of-funds tagging (exchange/mixer/scam/sanctions)
- [ ] v0.6: Cluster analysis and entity attribution

## License

MIT
