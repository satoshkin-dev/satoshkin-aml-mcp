# Installation

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MCP-compatible client that can launch stdio servers

## Claude Desktop / Claude Code

This package is not published to npm yet. Use the public GitHub repository through `npx`:

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

This package is intentionally marked `"private": true` and is not yet configured for npm publishing.
