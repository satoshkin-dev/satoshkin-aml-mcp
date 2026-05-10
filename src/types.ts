export type RiskLevel = "low" | "medium" | "high";

export type BlockchainNetwork =
  | "bitcoin"
  | "ethereum"
  | "tron"
  | "ton"
  | "solana"
  | "other";

export interface CheckWalletAmlInput {
  address: string;
  network?: BlockchainNetwork;
  asset?: string;
  amount?: number;
  counterparty?: string;
}

export interface RiskSignal {
  category: string;
  severity: RiskLevel;
  description: string;
}

export interface CheckWalletAmlResult {
  address: string;
  network: BlockchainNetwork;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: "allow" | "review" | "block";
  provider: "mock-bitok";
  checkedAt: string;
  signals: RiskSignal[];
  notes: string[];
}

export interface AmlProvider {
  checkWallet(input: CheckWalletAmlInput): Promise<CheckWalletAmlResult>;
}
