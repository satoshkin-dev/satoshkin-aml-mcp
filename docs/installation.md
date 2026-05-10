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
      "args": ["-y", "github:skhmtp/satoshkin-aml-mcp"]
    }
  }
}
```

## Local Setup

```bash
git clone https://github.com/skhmtp/satoshkin-aml-mcp.git
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

This package is intentionally marked `"private": true` and is not configured for npm publishing or MCP registry submission in v0.1.0.
