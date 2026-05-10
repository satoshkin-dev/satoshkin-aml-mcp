export type SupportedChain = "BTC" | "ETH" | "TRON" | "USDT-ERC20" | "USDT-TRC20";

export interface CheckWalletAmlInput {
  address: string;
  chain: SupportedChain;
}

export interface CheckWalletAmlResult {
  address: string;
  chain: SupportedChain;
  riskScore: "unknown";
  status: "mock";
  provider: "mock-bitok";
  checkedAt: string;
  message: string;
}

export interface AmlProvider {
  checkWallet(input: CheckWalletAmlInput): Promise<CheckWalletAmlResult>;
}
