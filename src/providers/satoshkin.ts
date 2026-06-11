import { z } from "zod/v4";
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

/** Reject absurdly large bodies before buffering them into memory. */
const MAX_RESPONSE_BYTES = 1_000_000;

/**
 * Minimal shape check on the 200 body. A misconfigured base URL or a proxy
 * error page can return HTTP 200 with `{}`, `null`, or a string — without this
 * guard those would be handed to the LLM as a real screening verdict. Unknown
 * keys pass through so the client still sees any extra backend fields.
 */
const successSchema = z
  .object({
    address: z.string(),
    chain: z.string(),
    checked_at: z.string(),
    risk_score: z.number(),
    risk_level: z.enum(["low", "medium", "high"]),
    tags: z.array(z.string()),
    first_activity: z.string().nullable(),
    last_activity: z.string().nullable(),
    total_volume_in_usd: z.string(),
    total_volume_out_usd: z.string(),
    source: z.literal("bitok"),
    cache_hit: z.boolean()
  })
  .passthrough();

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

  /** Strip the secret from any text built out of a caught error. */
  private redact(text: string): string {
    return this.config.apiKey ? text.split(this.config.apiKey).join("[redacted]") : text;
  }

  private isAbort(error: unknown): boolean {
    return (
      error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
    );
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
      if (this.isAbort(error)) {
        throw new AmlCheckError(
          "bitok_timeout",
          `AML check timed out after ${this.config.timeoutMs}ms. Screening can take longer for new addresses — retry in a minute.`
        );
      }
      const reason = error instanceof Error ? error.message : String(error);
      const cause =
        error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
      throw new AmlCheckError(
        "upstream_unreachable",
        this.redact(`Could not reach the Satoshkin AML backend: ${reason}${cause}`)
      );
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
      throw new AmlCheckError(
        "invalid_response",
        `Satoshkin AML backend returned an oversized response (${contentLength} bytes).`,
        response.status
      );
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch (error) {
      if (this.isAbort(error)) {
        throw new AmlCheckError(
          "bitok_timeout",
          `AML check timed out after ${this.config.timeoutMs}ms while reading the response — retry in a minute.`
        );
      }
      throw new AmlCheckError(
        "invalid_response",
        `Satoshkin AML backend returned a non-JSON response (HTTP ${response.status}).`,
        response.status
      );
    }

    if (!response.ok) {
      const errorBody = (body ?? {}) as BackendErrorBody;
      throw new AmlCheckError(
        errorBody.error ?? `http_${response.status}`,
        this.redact(errorBody.message ?? `Satoshkin AML backend error (HTTP ${response.status}).`),
        response.status,
        errorBody
      );
    }

    const parsed = successSchema.safeParse(body);
    if (!parsed.success) {
      throw new AmlCheckError(
        "invalid_response",
        "Satoshkin AML backend returned an unexpected 200 payload (missing or malformed fields).",
        response.status
      );
    }

    return parsed.data as unknown as CheckWalletAmlSuccess;
  }
}
