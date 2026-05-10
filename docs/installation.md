# Installation

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MCP-compatible client that can launch stdio servers

## Local Setup

```bash
git clone https://github.com/skhmtp/satoshkin-aml-mcp.git
cd satoshkin-aml-mcp
npm install
npm run build
npm test
```

## Run

Development mode:

```bash
npm run dev
```

Built mode:

```bash
npm run build
node dist/index.js
```

## MCP Client Example

Use the built entrypoint in your MCP client config:

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

## Publishing

This package is private and is not configured for npm publishing or registry submission.
