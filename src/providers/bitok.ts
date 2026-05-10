import type { AmlProvider, CheckWalletAmlInput, CheckWalletAmlResult } from "../types.js";

function normalizeAddress(address: string): string {
  return address.trim();
}

export class BitOkProviderPlaceholder implements AmlProvider {
  async checkWallet(input: CheckWalletAmlInput): Promise<CheckWalletAmlResult> {
    return {
      address: normalizeAddress(input.address),
      chain: input.chain,
      riskScore: "unknown",
      status: "mock",
      provider: "mock-bitok",
      checkedAt: new Date().toISOString(),
      message:
        "This is a mock response. Real AML screening via BitOK integration will be available in v0.2."
    };
  }
}
