import { AmlCheckError } from "./types.js";

export interface SatoshkinConfig {
  /** Base URL of the Satoshkin backend, no trailing slash. */
  baseUrl: string;
  /** API key (sk_live_* / sk_test_*). Null = mock mode. */
  apiKey: string | null;
  /** Request timeout. The backend may poll BitOK for several seconds. */
  timeoutMs: number;
}

const DEFAULT_BASE_URL = "https://satoshkin.com";
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * API keys travel in an HTTP Authorization header. A key carrying whitespace
 * or control characters (a common copy-paste artifact from email/Telegram)
 * makes undici throw a TypeError that embeds the full header value — which
 * would otherwise leak the secret into the MCP client log. Fail fast here with
 * a message that never echoes the key.
 */
function assertHeaderSafeApiKey(apiKey: string): void {
  if (/[^\x21-\x7E]/.test(apiKey)) {
    throw new AmlCheckError(
      "invalid_api_key",
      "SATOSHKIN_API_KEY contains whitespace or control characters. Re-copy the key without line breaks."
    );
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): SatoshkinConfig {
  const baseUrl = (env.SATOSHKIN_API_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const apiKey = env.SATOSHKIN_API_KEY?.trim() || null;
  if (apiKey) {
    assertHeaderSafeApiKey(apiKey);
  }
  const parsedTimeout = Number(env.SATOSHKIN_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeoutMs =
    Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : DEFAULT_TIMEOUT_MS;

  return { baseUrl, apiKey, timeoutMs };
}
