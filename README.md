# Satoshkin AML/KYT MCP Server

MCP server for AML/KYT crypto wallet screening. It is designed to connect AI clients such as Claude Desktop, Claude Code, ChatGPT MCP clients, and internal agent tools to Satoshkin wallet risk checks.

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

## Roadmap

- v0.1: scaffold with mock checks
- v0.2: BitOK API integration and real risk scoring
- v0.3: free tier plus API key tier for higher limits
- v0.4: additional chains such as Solana, BNB Chain, Polygon, and TON

## Related Satoshkin Products

- P2P bot: https://satoshkin.com
- AML/KYT Telegram bot: planned
- AML/KYT web app: planned

## License

MIT
