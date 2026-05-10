import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { AmlProvider, CheckWalletAmlInput, CheckWalletAmlResult } from "../types.js";

export const checkWalletAmlInputSchema = z.object({
  address: z.string().trim().min(8, "Wallet address must contain at least 8 characters."),
  network: z
    .enum(["bitcoin", "ethereum", "tron", "ton", "solana", "other"])
    .default("other")
    .describe("Blockchain network for the wallet address."),
  asset: z.string().trim().min(1).optional().describe("Optional asset symbol, for example USDT."),
  amount: z.number().nonnegative().optional().describe("Optional transaction amount for KYT context."),
  counterparty: z.string().trim().min(1).optional().describe("Optional counterparty label or ID.")
});

export async function checkWalletAml(
  provider: AmlProvider,
  input: CheckWalletAmlInput
): Promise<CheckWalletAmlResult> {
  return provider.checkWallet(input);
}

export function registerCheckWalletAmlTool(server: McpServer, provider: AmlProvider): void {
  server.registerTool(
    "check_wallet_aml",
    {
      title: "Check Wallet AML",
      description:
        "Runs a mock AML/KYT wallet risk check. This scaffold does not call BitOK or any real provider.",
      inputSchema: checkWalletAmlInputSchema
    },
    async (input) => {
      const result = await checkWalletAml(provider, input);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );
}
