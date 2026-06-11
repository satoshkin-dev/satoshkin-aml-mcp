import type { SatoshkinConfig } from "../config.js";
import {
  AmlCheckError,
  type AmlProvider,
  type CheckWalletAmlInput,
  type CheckWalletAmlSuccess
} from "../types.js";

/**
 * The Satoshkin backend mounts the endpoint under /api-accounts/ — bare /api
 * is routed to a different upstream by the production reverse proxy.
 */
const ENDPOINT_PATH = "/api-accounts/aml-check";

interface BackendErrorBody {
  error?: string;
  message?: string;
  retry_after?: number;
  current_balance_usd?: string;
  required_usd?: string;
  [key: string]: unknown;
}

export class SatoshkinBackendProvider implements AmlProvider {
  constructor(private readonly config: SatoshkinConfig) {
    if (!config.apiKey) {
      throw new AmlCheckError(
        "unauthorized",
        "SATOSHKIN_API_KEY is required for real AML checks."
      );
    }
  }

  async checkWallet(input: CheckWalletAmlInput): Promise<CheckWalletAmlSuccess> {
    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}${ENDPOINT_PATH}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({ address: input.address, chain: input.chain }),
        signal: AbortSignal.timeout(this.config.timeoutMs)
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      const isTimeout = error instanceof Error && error.name === "TimeoutError";
      throw new AmlCheckError(
        isTimeout ? "bitok_timeout" : "upstream_unreachable",
        isTimeout
          ? `AML check timed out after ${this.config.timeoutMs}ms. The screening may take longer for new addresses — retry in a minute.`
          : `Could not reach the Satoshkin AML backend: ${reason}`
      );
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      throw new AmlCheckError(
        "invalid_response",
        `Satoshkin AML backend returned non-JSON response (HTTP ${response.status}).`,
        response.status
      );
    }

    if (!response.ok) {
      const errorBody = (body ?? {}) as BackendErrorBody;
      throw new AmlCheckError(
        errorBody.error ?? `http_${response.status}`,
        errorBody.message ?? `Satoshkin AML backend error (HTTP ${response.status}).`,
        response.status,
        errorBody
      );
    }

    return body as CheckWalletAmlSuccess;
  }
}
