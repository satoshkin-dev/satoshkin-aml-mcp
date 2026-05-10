# Tools

## `check_wallet_aml`

Checks a crypto wallet address for AML/KYT risk.

v0.1.0 returns mock data only. It does not call BitOK or any other live AML provider.

### Input

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `address` | string | yes | Wallet address. Minimum length: 8 characters. |
| `chain` | enum | yes | `BTC`, `ETH`, `TRON`, `USDT-ERC20`, or `USDT-TRC20`. |

### Output

The tool returns one MCP text content item containing pretty-printed JSON:

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

### Planned Real Fields

v0.2+ should replace the mock response with real provider data:

- risk score `0-100`
- source-of-funds tags
- sanctions and mixer exposure
- first and last activity dates
- total volume in and out
- cluster and counterparty analysis
- decision: allow, review, or block
