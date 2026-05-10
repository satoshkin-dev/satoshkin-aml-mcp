import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { AmlProvider, CheckWalletAmlInput, CheckWalletAmlResult } from "../types.js";

export const checkWalletAmlInputSchema = z.object({
  address: z.string().trim().min(8, "Wallet address must contain at least 8 characters."),
  chain: z
    .enum(["BTC", "ETH", "TRON", "USDT-ERC20", "USDT-TRC20"])
    .describe("Blockchain or token network for the wallet address.")
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
        "Check crypto wallet address for AML/KYT risk score and source-of-funds analysis. Currently returns mock data; real BitOK integration is planned for v0.2.",
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
