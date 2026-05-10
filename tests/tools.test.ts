import { describe, expect, it } from "vitest";
import { BitOkProviderPlaceholder } from "../src/providers/bitok.js";
import { checkWalletAml, checkWalletAmlInputSchema } from "../src/tools/check_wallet_aml.js";

describe("check_wallet_aml", () => {
  it("returns a deterministic mock AML result", async () => {
    const provider = new BitOkProviderPlaceholder();
    const input = checkWalletAmlInputSchema.parse({
      address: "TMockWalletAddress123",
      network: "tron",
      asset: "USDT",
      amount: 250
    });

    const first = await checkWalletAml(provider, input);
    const second = await checkWalletAml(provider, input);

    expect(first.riskScore).toBe(second.riskScore);
    expect(first.address).toBe("TMockWalletAddress123");
    expect(first.network).toBe("tron");
    expect(first.provider).toBe("mock-bitok");
    expect(first.notes).toContain("BitOK API integration is intentionally not implemented in this scaffold.");
  });

  it("marks mock sanctions keyword addresses as high risk", async () => {
    const provider = new BitOkProviderPlaceholder();
    const result = await checkWalletAml(provider, {
      address: "0xsanctioned000000000000000000000000000000",
      network: "ethereum"
    });

    expect(result.riskScore).toBe(95);
    expect(result.riskLevel).toBe("high");
    expect(result.decision).toBe("block");
    expect(result.signals.some((signal) => signal.category === "sanctions_keyword")).toBe(true);
  });

  it("validates minimum wallet address length", () => {
    expect(() => checkWalletAmlInputSchema.parse({ address: "short" })).toThrow();
  });
});
