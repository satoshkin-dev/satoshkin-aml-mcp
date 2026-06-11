# Tools

## `check_wallet_aml`

Checks a crypto wallet address for AML/KYT risk.

With `SATOSHKIN_API_KEY` configured the check is real (BitOK data via the
Satoshkin backend, `POST /api-accounts/aml-check`). Without a key the server
returns a clearly-labeled mock response.

### Input

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `address` | string | yes | Wallet address, validated against the per-chain format before any quota is spent. |
| `chain` | enum | yes | `BTC`, `ETH`, `TRON`, `USDT-ERC20`, or `USDT-TRC20`. |

### Output (real mode)

One MCP text content item containing pretty-printed JSON:

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

Results are informational risk indicators, not legal or compliance advice.

### Errors

Failures are returned as structured `isError` tool results:

| `error` code | Meaning |
|---|---|
| `unauthorized` | Missing/invalid API key |
| `insufficient_balance` | Key balance below the per-check price (includes `current_balance_usd`, `required_usd`) |
| `rate_limited` | Hourly per-key limit exceeded (includes `retry_after` seconds) |
| `validation_error` | Backend rejected the address/chain |
| `bitok_upstream_error` | BitOK returned an upstream failure |
| `bitok_timeout` | Screening did not finish in time — retry shortly |
| `upstream_unreachable` | Network failure reaching the Satoshkin backend |

### Output (mock mode)

```json
{
  "address": "TMockWalletAddress123",
  "chain": "TRON",
  "riskScore": "unknown",
  "status": "mock",
  "provider": "mock-bitok",
  "checkedAt": "2026-06-10T00:00:00.000Z",
  "message": "This is a mock response (no SATOSHKIN_API_KEY configured). ..."
}
```
