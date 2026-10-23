# Installation

## Requirements and transport

- Node.js 20 or newer
- npm 10 or newer
- An MCP client that launches local stdio servers

The published package is `satoshkin-aml-mcp@0.2.0` on npm. This package has no
remote HTTP transport or ChatGPT connector. Claude Desktop and Cursor are the
initial acceptance targets; this document does not certify untested app/OS
versions or a completed paid customer journey.

## Configure a local MCP server

Add this server entry to your client's MCP configuration:

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

Omit `env` to start in mock mode. The client must be able to find Node.js and
`npx` in its environment. Confirm it lists `check_wallet_aml`; a mock call must
return `status: "mock"` and `riskScore: "unknown"`. A working mock call confirms
the local connection only.

For real checks, use the existing
[API-key dashboard](https://satoshkin.com/aml-kyt/dashboard) and
[billing page](https://satoshkin.com/aml-kyt/billing), or contact
[Satoshkin support](https://t.me/satoshkin_support) if access is unavailable.
The first successful fresh check costs USD 0.55, as do subsequent fresh checks.
Backend-confirmed cache hits (`cache_hit: true`) are free; repeats are not
guaranteed cache hits. Complete customer onboarding and paid acceptance remain
unverified for this candidate.

## Configuration

| Environment variable | Default | Purpose |
|---|---|---|
| `SATOSHKIN_API_KEY` | unset | Key issued by Satoshkin (`sk_live_*` / `sk_test_*`); absent means mock mode |
| `SATOSHKIN_API_BASE_URL` | `https://satoshkin.com` | Backend base URL |
| `SATOSHKIN_TIMEOUT_MS` | `30000` | Request timeout in milliseconds |

Do not publish API keys in issues or shared configuration. A `sk_test_*` prefix
does not itself promise free checks; billing is enforced by the backend.

## Local source setup

```bash
git clone https://github.com/satoshkin-dev/satoshkin-aml-mcp.git
cd satoshkin-aml-mcp
npm ci
npm test
npm run typecheck
npm run build
```

To test the checked-out source instead of the published npm version, configure
the built entrypoint:

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

This example uses mock mode. `npm run dev` starts the source entrypoint; after
building, `node dist/index.js` starts the compiled stdio server.

## Errors and billing recovery

See the [tool error reference](tools.md). A timeout or connection loss does not
prove that the backend did not complete or charge a check. There is no automatic
retry: inspect billing history or contact support before a new request, which
may be charged. A local connection or mock test does not verify live payment,
provider results or billing recovery.

## Publishing

The package is public (`"private": false`) and version 0.2.0 is already published.
Local builds do not publish a new version. Source changes require a separately
reviewed release; running the pinned npm command above uses the existing release.
