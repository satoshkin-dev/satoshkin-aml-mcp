import { describe, expect, it } from "vitest";
import { BitOkProviderPlaceholder } from "../src/providers/bitok.js";
import { checkWalletAml, checkWalletAmlInputSchema } from "../src/tools/check_wallet_aml.js";

describe("check_wallet_aml", () => {
  it("returns the expected mock AML result structure", async () => {
    const provider = new BitOkProviderPlaceholder();
    const input = checkWalletAmlInputSchema.parse({
      address: "TMockWalletAddress123",
      chain: "BTC"
    });

    const result = await checkWalletAml(provider, input);

    expect(result.address).toBe("TMockWalletAddress123");
    expect(result.chain).toBe("BTC");
    expect(result.riskScore).toBe("unknown");
    expect(result.status).toBe("mock");
    expect(result.provider).toBe("mock-bitok");
    expect(result.message).toContain("Real AML screening via BitOK integration");
  });

  it("validates minimum wallet address length", () => {
    expect(() => checkWalletAmlInputSchema.parse({ address: "short", chain: "BTC" })).toThrow();
  });

  it("requires a supported chain", () => {
    expect(() => checkWalletAmlInputSchema.parse({ address: "TMockWalletAddress123" })).toThrow();
  });
});
