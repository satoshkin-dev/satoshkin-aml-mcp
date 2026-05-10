import type {
  AmlProvider,
  BlockchainNetwork,
  CheckWalletAmlInput,
  CheckWalletAmlResult,
  RiskLevel,
  RiskSignal
} from "../types.js";

const DEFAULT_NETWORK: BlockchainNetwork = "other";

function normalizeAddress(address: string): string {
  return address.trim();
}

function stableAddressScore(address: string): number {
  const normalized = normalizeAddress(address).toLowerCase();
  const sum = [...normalized].reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum % 101;
}

function riskLevel(score: number): RiskLevel {
  if (score >= 75) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function decision(level: RiskLevel): CheckWalletAmlResult["decision"] {
  if (level === "high") return "block";
  if (level === "medium") return "review";
  return "allow";
}

function buildSignals(input: CheckWalletAmlInput, score: number, level: RiskLevel): RiskSignal[] {
  const signals: RiskSignal[] = [
    {
      category: "mock_score",
      severity: level,
      description: `Deterministic mock score for local scaffold testing: ${score}/100.`
    }
  ];

  if (input.amount !== undefined && input.amount >= 10000) {
    signals.push({
      category: "large_amount",
      severity: "medium",
      description: "Amount is above the mock large-transfer threshold."
    });
  }

  if (normalizeAddress(input.address).toLowerCase().includes("sanction")) {
    signals.push({
      category: "sanctions_keyword",
      severity: "high",
      description: "Address contains a mock sanctions keyword."
    });
  }

  return signals;
}

export class BitOkProviderPlaceholder implements AmlProvider {
  async checkWallet(input: CheckWalletAmlInput): Promise<CheckWalletAmlResult> {
    const address = normalizeAddress(input.address);
    const keywordOverride = address.toLowerCase().includes("sanction") ? 95 : undefined;
    const score = keywordOverride ?? stableAddressScore(address);
    const level = riskLevel(score);

    return {
      address,
      network: input.network ?? DEFAULT_NETWORK,
      riskScore: score,
      riskLevel: level,
      decision: decision(level),
      provider: "mock-bitok",
      checkedAt: new Date().toISOString(),
      signals: buildSignals(input, score, level),
      notes: [
        "Mock AML/KYT result only.",
        "BitOK API integration is intentionally not implemented in this scaffold."
      ]
    };
  }
}
