# Tools

## `check_wallet_aml`

Runs a deterministic mock AML/KYT wallet check.

This is scaffold behavior only. The tool does not call BitOK or any other AML provider.

### Input

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `address` | string | yes | Wallet address. Minimum length: 8 characters. |
| `network` | enum | no | `bitcoin`, `ethereum`, `tron`, `ton`, `solana`, or `other`. Defaults to `other`. |
| `asset` | string | no | Optional asset symbol, for example `USDT`. |
| `amount` | number | no | Optional non-negative transaction amount. |
| `counterparty` | string | no | Optional counterparty label or ID. |

### Output

The tool returns one MCP text content item containing pretty-printed JSON:

```json
{
  "address": "TMockWalletAddress123",
  "network": "tron",
  "riskScore": 36,
  "riskLevel": "low",
  "decision": "allow",
  "provider": "mock-bitok",
  "checkedAt": "2026-05-10T00:00:00.000Z",
  "signals": [
    {
      "category": "mock_score",
      "severity": "low",
      "description": "Deterministic mock score for local scaffold testing: 36/100."
    }
  ],
  "notes": [
    "Mock AML/KYT result only.",
    "BitOK API integration is intentionally not implemented in this scaffold."
  ]
}
```

### Mock Rules

- Base score is a deterministic checksum of the address.
- Score `0-39`: `low`, decision `allow`.
- Score `40-74`: `medium`, decision `review`.
- Score `75-100`: `high`, decision `block`.
- Addresses containing `sanction` force score `95` and `high` risk.
- Amounts greater than or equal to `10000` add a mock `large_amount` signal.
