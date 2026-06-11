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

export function loadConfig(env: NodeJS.ProcessEnv = process.env): SatoshkinConfig {
  const baseUrl = (env.SATOSHKIN_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const apiKey = env.SATOSHKIN_API_KEY?.trim() || null;
  const parsedTimeout = Number(env.SATOSHKIN_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeoutMs =
    Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : DEFAULT_TIMEOUT_MS;

  return { baseUrl, apiKey, timeoutMs };
}
