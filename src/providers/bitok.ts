import type { AmlProvider, CheckWalletAmlInput, CheckWalletAmlMock } from "../types.js";

function normalizeAddress(address: string): string {
  return address.trim();
}

/**
 * Mock provider used when SATOSHKIN_API_KEY is not configured. Responses are
 * deterministic and clearly labeled so they can never be mistaken for a real
 * screening verdict.
 */
export class BitOkProviderPlaceholder implements AmlProvider {
  async checkWallet(input: CheckWalletAmlInput): Promise<CheckWalletAmlMock> {
    return {
      address: normalizeAddress(input.address),
      chain: input.chain,
      riskScore: "unknown",
      status: "mock",
      provider: "mock-bitok",
      checkedAt: new Date().toISOString(),
      message:
        "This is a mock response (no SATOSHKIN_API_KEY configured). Set SATOSHKIN_API_KEY " +
        "to enable real BitOK-backed AML/KYT screening via the Satoshkin backend."
    };
  }
}
