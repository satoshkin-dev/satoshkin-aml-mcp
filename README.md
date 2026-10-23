# Satoshkin AML/KYT MCP Server

[![CI](https://github.com/satoshkin-dev/satoshkin-aml-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/satoshkin-dev/satoshkin-aml-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Local stdio MCP server for AML/KYT crypto wallet risk screening. With a Satoshkin
API key, it requests BitOK-backed risk scores, risk levels and risk tags from
the Satoshkin backend. Without a key, it returns clearly labelled mock data.

## Status and scope

Version **0.2.0 is published on npm** as
[`satoshkin-aml-mcp`](https://www.npmjs.com/package/satoshkin-aml-mcp).
The package exposes one tool, `check_wallet_aml`, over **local stdio only**.
There is no remote HTTP transport or ChatGPT connector in this package.

The configuration below is for clients that launch local stdio servers.
Claude Desktop and Cursor are the initial client acceptance targets; exact
app/OS versions and the complete paid customer journey have not yet been
accepted for this release candidate. See [installation](docs/installation.md).

Full-wallet activity dates and incoming/outgoing transaction totals are
unavailable. Risk-event data must not be presented as full wallet history.
The v2 response example below describes the corrected backend contract; it is
not evidence that the backend update has been deployed. The connector accepts
legacy responses during rollout without requiring v2 metadata. Legacy activity
and volume fields must not be treated as verified full-wallet data.

The private backend owns provider credentials, assessment validation and billing.
This repository contains the connector, not those backend services or customer data.

## Install and configure

Requirements: Node.js 20 or newer, npm 10 or newer, and a client that can launch
local stdio MCP servers. Add a local server in your client's MCP settings:

```json
{
  "mcpServers": {
    "satoshkin-aml": {
      "command": "npx",
      "args": ["-y", "satoshkin-aml-mcp@0.2.0"],
      "env": {
        "SATOSHKIN_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

Omit the `env` block to use free mock mode. Use your own key and keep it out of
shared configuration, screenshots and issue reports. Local development
instructions are in [installation](docs/installation.md).

## Available tool

### `check_wallet_aml`

Checks a wallet address for risk indicators. The connector validates the address
format before sending it to the backend. Supported `chain` values are `BTC`,
`ETH`, `TRON`, `USDT-ERC20` and `USDT-TRC20`.

Input:

```json
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "chain": "BTC"
}
```

Illustrative real response under backend report contract v2:

```json
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "chain": "BTC",
  "checked_at": "2026-10-23T12:00:00.000Z",
  "risk_score": 17,
  "risk_level": "low",
  "tags": ["exchange"],
  "first_activity": null,
  "last_activity": null,
  "total_volume_in_usd": "unavailable",
  "total_volume_out_usd": "unavailable",
  "report_schema_version": 2,
  "limitations": [
    "Full-wallet activity dates and incoming/outgoing USD totals are unavailable. Risk-event data is not wallet history."
  ],
  "source": "bitok",
  "cache_hit": false,
  "balance": { "charged_usd": "0.55", "after_usd": "9.45" }
}
```

A valid score of zero is possible; missing, malformed or unavailable risk is
not a zero-risk verdict. Under the corrected backend contract, an invalid core
assessment or incomplete provider check returns an error before a successful-check
debit. Unavailable optional history does not invalidate a valid core assessment.

Tool errors use MCP `isError: true` and a JSON error code. `http_status` is present
when the failure has an HTTP status. See [tool contract and errors](docs/tools.md).
Results are informational risk indicators, not legal or compliance advice.

## Billing, keys and support

The open-source connector is free. A successful fresh real check costs **USD 0.55**
from a prepaid balance, **including the first check**. A response confirmed by the
backend as `cache_hit: true` is free. The current backend cache lasts 60 seconds;
repeating an address does not guarantee a cache hit. Inspect the returned billing
information and your balance history.

An interrupted or timed-out request can leave its completion and charge status
unknown. The connector does not automatically retry. Check balance history or
contact support before submitting another check; a new request may be charged.

Existing account routes:

- [API-key dashboard](https://satoshkin.com/aml-kyt/dashboard)
- [Balance, history and top-up](https://satoshkin.com/aml-kyt/billing)
- [Satoshkin support](https://t.me/satoshkin_support)

These routes exist; their complete customer setup and paid journey remain subject
to release acceptance. For connector defects, use
[GitHub issues](https://github.com/satoshkin-dev/satoshkin-aml-mcp/issues) without
keys, account details or private wallet information.

## Configuration

| Environment variable | Default | Purpose |
|---|---|---|
| `SATOSHKIN_API_KEY` | unset | Satoshkin API key; absent means mock mode |
| `SATOSHKIN_API_BASE_URL` | `https://satoshkin.com` | Backend base URL, including staging overrides |
| `SATOSHKIN_TIMEOUT_MS` | `30000` | Request timeout in milliseconds; a timeout does not prove that no charge occurred |

## Local development

```bash
git clone https://github.com/satoshkin-dev/satoshkin-aml-mcp.git
cd satoshkin-aml-mcp
npm ci
npm test
npm run typecheck
npm run build
```

Run `npm run dev` for source development or `node dist/index.js` for the built
stdio server. These commands use mock mode when no API key is configured.

## License

MIT
