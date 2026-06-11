import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import {
  AmlCheckError,
  type AmlProvider,
  type CheckWalletAmlInput,
  type CheckWalletAmlResult,
  type SupportedChain
} from "../types.js";

/**
 * Per-chain address formats, mirroring the backend's validation. Validating
 * client-side keeps malformed input from consuming backend quota or money.
 */
const ADDRESS_PATTERNS: Record<SupportedChain, RegExp> = {
  BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  TRON: /^T[a-zA-HJ-NP-Z0-9]{33}$/,
  "USDT-ERC20": /^0x[a-fA-F0-9]{40}$/,
  "USDT-TRC20": /^T[a-zA-HJ-NP-Z0-9]{33}$/
};

export const checkWalletAmlInputSchema = z
  .object({
    address: z.string().trim().min(8, "Wallet address must contain at least 8 characters."),
    chain: z
      .enum(["BTC", "ETH", "TRON", "USDT-ERC20", "USDT-TRC20"])
      .describe("Blockchain or token network for the wallet address.")
  })
  .superRefine((value, ctx) => {
    const pattern = ADDRESS_PATTERNS[value.chain as SupportedChain];
    if (pattern && !pattern.test(value.address)) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: `"${value.address}" is not a valid ${value.chain} address.`
      });
    }
  });

export async function checkWalletAml(
  provider: AmlProvider,
  input: CheckWalletAmlInput
): Promise<CheckWalletAmlResult> {
  return provider.checkWallet(input);
}

interface ToolTextResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/**
 * Runs the check and maps failures to structured isError results so the AI
 * client gets an actionable error payload instead of a raw exception.
 */
export async function runCheckWalletAmlTool(
  provider: AmlProvider,
  input: CheckWalletAmlInput
): Promise<ToolTextResult> {
  try {
    const result = await checkWalletAml(provider, input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  } catch (error) {
    const payload =
      error instanceof AmlCheckError
        ? {
            error: error.code,
            message: error.message,
            http_status: error.httpStatus,
            ...(error.details ?? {})
          }
        : {
            error: "internal_error",
            message: error instanceof Error ? error.message : String(error)
          };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      isError: true
    };
  }
}

export function registerCheckWalletAmlTool(server: McpServer, provider: AmlProvider): void {
  server.registerTool(
    "check_wallet_aml",
    {
      title: "Check Wallet AML",
      description:
        "Check a crypto wallet address for AML/KYT risk: risk score 0-100, risk level, " +
        "source-of-funds tags, activity dates and volumes (BitOK data via the Satoshkin " +
        "backend). Without SATOSHKIN_API_KEY the tool runs in clearly-labeled mock mode.",
      inputSchema: checkWalletAmlInputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async (input) => runCheckWalletAmlTool(provider, input)
  );
}
