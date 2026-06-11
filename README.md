# Satoshkin AML/KYT MCP Server

[![CI](https://github.com/satoshkin-dev/satoshkin-aml-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/satoshkin-dev/satoshkin-aml-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Status: v0.2](https://img.shields.io/badge/status-v0.2%20real%20screening-brightgreen.svg)]()

MCP server for AML/KYT crypto wallet screening. It is designed to connect AI clients such as Claude Desktop, Claude Code, ChatGPT MCP clients, and internal agent tools to Satoshkin wallet risk checks.

This MCP server provides AI assistants with crypto compliance tools for AML (Anti-Money Laundering) and KYT (Know Your Transaction) screening. Compatible with Claude Desktop, Claude Code, and any MCP-compatible client.

With an API key configured, checks return real BitOK-backed data: risk score 0-100, risk level, source-of-funds tags, activity dates, and volume totals. Without a key the server runs in clearly-labeled mock mode.

## Status

v0.2.0 performs real AML/KYT screening through the Satoshkin backend
(`POST /api-accounts/aml-check`, BitOK data) when `SATOSHKIN_API_KEY` is set.

Without an API key the server runs in mock mode: deterministic, clearly-labeled
placeholder responses that can never be mistaken for a real verdict.

This repository does not contain BitOK credentials, production AML/KYT business logic, user data, or paid-tier enforcement. Those belong in the private backend service.

## Available Tool

### `check_wallet_aml`

Checks a crypto wallet address for AML/KYT risk. Addresses are validated
against per-chain formats client-side before any quota is spent.

Input:

```json
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "chain": "BTC"
}
```

Supported `chain` values:

- `BTC`
- `ETH`
- `TRON`
- `USDT-ERC20`
- `USDT-TRC20`

Real output (with `SATOSHKIN_API_KEY`):

```json
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "chain": "BTC",
  "checked_at": "2026-06-10T12:00:00.000Z",
  "risk_score": 17,
  "risk_level": "low",
  "tags": ["exchange"],
  "first_activity": "2021-01-01",
  "last_activity": "2026-06-01",
  "total_volume_in_usd": "1000.00",
  "total_volume_out_usd": "900.00",
  "source": "bitok",
  "cache_hit": false,
  "rate_limit": { "remaining": 999, "resets_at": "2026-06-10T13:00:00.000Z" },
  "balance": { "charged_usd": "0.55", "after_usd": "9.45" }
}
```

Errors come back as structured `isError` payloads with machine-readable codes:
`unauthorized`, `insufficient_balance`, `rate_limited`, `validation_error`,
`bitok_upstream_error`, `bitok_timeout`, `upstream_unreachable`,
`invalid_response`, `internal_error`, and `http_<status>` (fallback when a
backend error body has no `error` field). Every error payload also carries
an `http_status` field.

Results are informational risk indicators, not legal or compliance advice.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `SATOSHKIN_API_KEY` | _(unset = mock mode)_ | API key `sk_live_*` / `sk_test_*` issued by Satoshkin |
| `SATOSHKIN_API_BASE_URL` | `https://satoshkin.com` | Backend base URL (staging override) |
| `SATOSHKIN_TIMEOUT_MS` | `30000` | Request timeout; first-time checks may take several seconds |

## Claude Desktop / Claude Code

This package is not published to npm yet. Use the public GitHub repository through `npx`.

Add this to your MCP settings:

```json
{
  "mcpServers": {
    "satoshkin-aml": {
      "command": "npx",
      "args": ["-y", "github:satoshkin-dev/satoshkin-aml-mcp"],
      "env": {
        "SATOSHKIN_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

Omit the `env` block to run in mock mode.

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
git clone https://github.com/satoshkin-dev/satoshkin-aml-mcp.git
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

## Check Scope

Shipped in v0.2:

- Risk score `0-100` + risk level (low / medium / high)
- Source-of-funds tags
- First and last activity dates
- Total volume in and out (USD)
- Per-key rate limiting and billing through Satoshkin backend authentication

Planned next: counterparty and cluster analysis, allow/review/block decisions.

## Monetization Model

The MCP server is a free open-source connector.

Real checks require a Satoshkin API key. Billing is per successful check
($0.55, debited from a prepaid key balance), the first real check per key is
free, and cached repeat checks within 60 seconds are not charged. Keys are
currently issued by [Satoshkin support](https://t.me/satoshkin_support);
a self-service dashboard is in development. Mock mode is free and unlimited.

## Related Satoshkin Products

- P2P bot: https://satoshkin.com
- AML/KYT Telegram bot: https://t.me/SatoshkinKYTbot
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
- [x] v0.2: Real BitOK integration via Satoshkin backend (per-check billing, free first check, mock mode without key)
- [ ] v0.3: Self-service key dashboard + top-up
- [ ] v0.4: Additional chains (Solana, BNB, Polygon)
- [ ] v0.5: Richer tag taxonomy and sanctions-specific flags
- [ ] v0.6: Cluster analysis and entity attribution

## License

MIT
