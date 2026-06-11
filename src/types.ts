export type SupportedChain = "BTC" | "ETH" | "TRON" | "USDT-ERC20" | "USDT-TRC20";

export interface CheckWalletAmlInput {
  address: string;
  chain: SupportedChain;
}

/** Real screening result returned by the Satoshkin backend (BitOK data). */
export interface CheckWalletAmlSuccess {
  address: string;
  chain: SupportedChain;
  checked_at: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  tags: string[];
  first_activity: string | null;
  last_activity: string | null;
  total_volume_in_usd: string;
  total_volume_out_usd: string;
  source: "bitok";
  cache_hit: boolean;
  rate_limit?: { remaining: number; resets_at: string };
  /** Billing info appended by the backend (charged_usd, after_usd, ...). */
  balance?: Record<string, unknown>;
}

/** Mock result used when SATOSHKIN_API_KEY is not configured. */
export interface CheckWalletAmlMock {
  address: string;
  chain: SupportedChain;
  riskScore: "unknown";
  status: "mock";
  provider: "mock-bitok";
  checkedAt: string;
  message: string;
}

export type CheckWalletAmlResult = CheckWalletAmlSuccess | CheckWalletAmlMock;

export interface AmlProvider {
  checkWallet(input: CheckWalletAmlInput): Promise<CheckWalletAmlResult>;
}

/** Machine-readable error codes surfaced to the MCP client. */
export type AmlCheckErrorCode =
  | "unauthorized"
  | "insufficient_balance"
  | "rate_limited"
  | "validation_error"
  | "bitok_upstream_error"
  | "bitok_timeout"
  | "upstream_unreachable"
  | "invalid_response"
  | string;

export class AmlCheckError extends Error {
  constructor(
    public readonly code: AmlCheckErrorCode,
    message: string,
    public readonly httpStatus?: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AmlCheckError";
  }
}
