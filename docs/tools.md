# Tools

## `check_wallet_aml`

Checks a crypto wallet address for AML/KYT risk. With `SATOSHKIN_API_KEY`, the
connector calls `POST /api-accounts/aml-check` on the Satoshkin backend, which
uses BitOK data. Without a key, the result is clearly labelled mock data.

### Input

| Field | Type | Required | Notes |
|---|---|---|---|
| `address` | string | yes | Wallet address, validated against the per-chain format before a backend request |
| `chain` | enum | yes | `BTC`, `ETH`, `TRON`, `USDT-ERC20`, or `USDT-TRC20` |

### Real result

One MCP text content item contains the JSON response. This is an illustrative
response under the corrected backend report contract v2, not a deployment receipt:

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

`risk_score` is a finite number from 0 to 100. A valid zero is distinct from a
missing or invalid score. `risk_level` is `low`, `medium` or `high`; `tags` are
risk indicators supplied by the backend. `checked_at` is the assessment time,
not a wallet activity date.

In v2, `first_activity` and `last_activity` are `null`; both volume fields are
the string `"unavailable"`. Do not turn these values into zero, or summarize
risk-event dates and amounts as full-wallet history or directional volume.
Unavailable optional history does not invalidate a valid core assessment.
Preserve the returned `limitations` when explaining the result.

`report_schema_version` and `limitations` are additive metadata. Valid legacy
responses remain accepted without them during rollout; legacy activity and
volume fields are not evidence of full-wallet history. Additional backend fields
pass through unchanged. The published 0.2.0 parser accepts the v2 nullable dates
and string volume fields. The current source also rejects scores outside 0–100.

Results are informational risk indicators, not legal or compliance advice.

### Charges and retries

A successful fresh check costs **USD 0.55**, including the first check. A response
with backend-confirmed `cache_hit: true` is free. The current 60-second cache does
not guarantee that a repeated request will hit; use the actual response and
billing history to establish the charge. Rate-limit and balance metadata may be
included by the backend.

Under the corrected backend contract, missing, malformed, non-finite or
out-of-range core risk and incomplete provider checks return HTTP 502 with
`bitok_upstream_error` before a successful-check debit. The connector turns this
into `isError: true`, never a successful zero-risk verdict. Client-side validation
cannot reverse or prove the absence of a server-side charge.

The connector makes one backend request per tool invocation and does not
automatically retry. After timeout, connection loss or a malformed response,
completion and charge status may be unknown. Check
[billing history](https://satoshkin.com/aml-kyt/billing) or contact
[support](https://t.me/satoshkin_support) before retrying; a new request may be charged.

### Errors

Failures return structured MCP `isError: true` results:

| `error` code | Meaning |
|---|---|
| `unauthorized` | Missing, invalid or revoked API key |
| `insufficient_balance` | Balance below the per-check requirement; may include `current_balance_usd` and `required_usd` |
| `rate_limited` | Per-key limit exceeded; may include `retry_after` seconds |
| `validation_error` | Backend rejected the address or chain |
| `bitok_upstream_error` | Provider failure, invalid core risk or incomplete assessment |
| `bitok_timeout` | Request timed out; completion and charge status require verification before retry |
| `upstream_unreachable` | Network failure reaching the backend; completion may be unknown |
| `invalid_response` | Non-JSON or malformed successful response, including an invalid score |
| `invalid_api_key` | Key contains whitespace or control characters |
| `internal_error` | Unexpected connector failure |
| `http_<status>` | Fallback when the backend error body has no `error` field |

`http_status` is included when the failure carries an HTTP status. The connector
also preserves backend error details. An error result is not a risk assessment.

### Mock result

```json
{
  "address": "TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH",
  "chain": "TRON",
  "riskScore": "unknown",
  "status": "mock",
  "provider": "mock-bitok",
  "checkedAt": "2026-10-23T12:00:00.000Z",
  "message": "This is a mock response (no SATOSHKIN_API_KEY configured). ..."
}
```

Mock mode makes no provider call, charges no balance and provides no real risk verdict.
