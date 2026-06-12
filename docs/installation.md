# Installation

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MCP-compatible client that can launch stdio servers

## Claude Desktop / Claude Code

The package is published on npm as [`satoshkin-aml-mcp`](https://www.npmjs.com/package/satoshkin-aml-mcp) and listed in the MCP registry as `io.github.satoshkin-dev/satoshkin-aml-mcp`. Install it through `npx`:

```json
{
  "mcpServers": {
    "satoshkin-aml": {
      "command": "npx",
      "args": ["-y", "satoshkin-aml-mcp"],
      "env": {
        "SATOSHKIN_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

## Configuration

- `SATOSHKIN_API_KEY` — API key issued by Satoshkin (`sk_live_*` / `sk_test_*`).
  Without it the server runs in clearly-labeled mock mode.
- `SATOSHKIN_API_BASE_URL` — backend base URL, default `https://satoshkin.com`.
- `SATOSHKIN_TIMEOUT_MS` — request timeout, default `30000`.

## Local Setup

```bash
git clone https://github.com/satoshkin-dev/satoshkin-aml-mcp.git
cd satoshkin-aml-mcp
npm install
npm run build
npm test
```

Use the built entrypoint in your MCP client config:

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

## Run Locally

Development mode:

```bash
npm run dev
```

Built mode:

```bash
npm run build
node dist/index.js
```

## Publishing

Releases are published to npm as `satoshkin-aml-mcp` and registered in the MCP registry under `io.github.satoshkin-dev/satoshkin-aml-mcp` (via the `mcpName` field in `package.json` and `server.json`).
