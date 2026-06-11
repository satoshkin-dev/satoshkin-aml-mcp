import { afterEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { createProvider } from "../src/index.js";
import { BitOkProviderPlaceholder } from "../src/providers/bitok.js";
import { SatoshkinBackendProvider } from "../src/providers/satoshkin.js";
import {
  checkWalletAml,
  checkWalletAmlInputSchema,
  runCheckWalletAmlTool
} from "../src/tools/check_wallet_aml.js";
import { AmlCheckError, type CheckWalletAmlSuccess } from "../src/types.js";

const BTC_ADDRESS = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
const BTC_BECH32 = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq";
const ETH_ADDRESS = "0x52908400098527886E0F7030069857D2E4169EE7";
const ETH_LOWER = "0x52908400098527886e0f7030069857d2e4169ee7";
const TRON_ADDRESS = "TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH";

const SUCCESS_BODY: CheckWalletAmlSuccess = {
  address: BTC_ADDRESS,
  chain: "BTC",
  checked_at: "2026-06-10T00:00:00.000Z",
  risk_score: 17,
  risk_level: "low",
  tags: ["exchange"],
  first_activity: "2021-01-01",
  last_activity: "2026-06-01",
  total_volume_in_usd: "1000.00",
  total_volume_out_usd: "900.00",
  source: "bitok",
  cache_hit: false,
  rate_limit: { remaining: 999, resets_at: "2026-06-10T01:00:00.000Z" },
  balance: { charged_usd: "0.55", after_usd: "9.45" }
};

function makeConfig(overrides: Partial<ReturnType<typeof loadConfig>> = {}) {
  return {
    baseUrl: "https://satoshkin.test",
    apiKey: "sk_test_abc123",
    timeoutMs: 5_000,
    ...overrides
  };
}

function fetchResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("config", () => {
  it("defaults to satoshkin.com with mock mode when no key is set", () => {
    const config = loadConfig({} as NodeJS.ProcessEnv);
    expect(config.baseUrl).toBe("https://satoshkin.com");
    expect(config.apiKey).toBeNull();
    expect(config.timeoutMs).toBe(30_000);
  });

  it("strips trailing slashes and reads the key", () => {
    const config = loadConfig({
      SATOSHKIN_API_BASE_URL: "https://staging.example.com//",
      SATOSHKIN_API_KEY: " sk_live_x ",
      SATOSHKIN_TIMEOUT_MS: "1000"
    } as unknown as NodeJS.ProcessEnv);
    expect(config.baseUrl).toBe("https://staging.example.com");
    expect(config.apiKey).toBe("sk_live_x");
    expect(config.timeoutMs).toBe(1000);
  });

  it("falls back to defaults on empty / invalid env values", () => {
    const config = loadConfig({
      SATOSHKIN_API_BASE_URL: "   ",
      SATOSHKIN_TIMEOUT_MS: "abc"
    } as unknown as NodeJS.ProcessEnv);
    expect(config.baseUrl).toBe("https://satoshkin.com");
    expect(config.timeoutMs).toBe(30_000);
    expect(loadConfig({ SATOSHKIN_TIMEOUT_MS: "-5" } as unknown as NodeJS.ProcessEnv).timeoutMs).toBe(
      30_000
    );
  });

  it("rejects a key with whitespace/control chars without echoing it", () => {
    let thrown: AmlCheckError | null = null;
    try {
      loadConfig({ SATOSHKIN_API_KEY: "sk_live_AAA\nBBB" } as unknown as NodeJS.ProcessEnv);
    } catch (error) {
      thrown = error as AmlCheckError;
    }
    expect(thrown).toBeInstanceOf(AmlCheckError);
    expect(thrown?.code).toBe("invalid_api_key");
    expect(thrown?.message).not.toContain("BBB");
  });
});

describe("createProvider", () => {
  it("selects the backend provider when a key is set", () => {
    expect(createProvider(makeConfig())).toBeInstanceOf(SatoshkinBackendProvider);
  });

  it("selects the mock provider and warns on stderr when no key is set", () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const provider = createProvider(makeConfig({ apiKey: null }));
    expect(provider).toBeInstanceOf(BitOkProviderPlaceholder);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("MOCK mode"));
    warn.mockRestore();
  });
});

describe("input schema", () => {
  it("accepts valid addresses per chain", () => {
    expect(() => checkWalletAmlInputSchema.parse({ address: BTC_ADDRESS, chain: "BTC" })).not.toThrow();
    expect(() => checkWalletAmlInputSchema.parse({ address: BTC_BECH32, chain: "BTC" })).not.toThrow();
    expect(() => checkWalletAmlInputSchema.parse({ address: ETH_ADDRESS, chain: "ETH" })).not.toThrow();
    expect(() => checkWalletAmlInputSchema.parse({ address: ETH_LOWER, chain: "ETH" })).not.toThrow();
    expect(() => checkWalletAmlInputSchema.parse({ address: TRON_ADDRESS, chain: "TRON" })).not.toThrow();
    expect(() =>
      checkWalletAmlInputSchema.parse({ address: ETH_ADDRESS, chain: "USDT-ERC20" })
    ).not.toThrow();
    expect(() =>
      checkWalletAmlInputSchema.parse({ address: TRON_ADDRESS, chain: "USDT-TRC20" })
    ).not.toThrow();
  });

  it("rejects an address that does not match the chain format", () => {
    expect(() =>
      checkWalletAmlInputSchema.parse({ address: "TMockWalletAddress123", chain: "BTC" })
    ).toThrow();
    expect(() => checkWalletAmlInputSchema.parse({ address: BTC_ADDRESS, chain: "ETH" })).toThrow();
  });

  it("validates minimum wallet address length", () => {
    expect(() => checkWalletAmlInputSchema.parse({ address: "short", chain: "BTC" })).toThrow();
  });

  it("requires a supported chain", () => {
    expect(() => checkWalletAmlInputSchema.parse({ address: BTC_ADDRESS })).toThrow();
  });
});

describe("mock provider", () => {
  it("returns a clearly-labeled mock result", async () => {
    const provider = new BitOkProviderPlaceholder();
    const result = await checkWalletAml(provider, { address: BTC_ADDRESS, chain: "BTC" });

    expect(result).toMatchObject({
      address: BTC_ADDRESS,
      chain: "BTC",
      riskScore: "unknown",
      status: "mock",
      provider: "mock-bitok"
    });
    expect((result as { message: string }).message).toContain("SATOSHKIN_API_KEY");
  });
});

describe("SatoshkinBackendProvider", () => {
  it("posts to /api-accounts/aml-check with a Bearer key and returns the payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(fetchResponse(200, SUCCESS_BODY));
    vi.stubGlobal("fetch", fetchMock);

    const provider = new SatoshkinBackendProvider(makeConfig());
    const result = await provider.checkWallet({ address: BTC_ADDRESS, chain: "BTC" });

    expect(result).toEqual(SUCCESS_BODY);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://satoshkin.test/api-accounts/aml-check");
    expect(init.headers.authorization).toBe("Bearer sk_test_abc123");
    expect(JSON.parse(init.body)).toEqual({ address: BTC_ADDRESS, chain: "BTC" });
  });

  it.each([
    [401, "unauthorized", { error: "unauthorized", message: "Invalid or expired API key." }],
    [
      402,
      "insufficient_balance",
      {
        error: "insufficient_balance",
        message: "Balance $0.10 < required $0.55 per check.",
        current_balance_usd: "0.10",
        required_usd: "0.55"
      }
    ],
    [
      429,
      "rate_limited",
      { error: "rate_limited", message: "Rate limit exceeded.", retry_after: 120 }
    ],
    [502, "bitok_upstream_error", { error: "bitok_upstream_error", message: "BitOK upstream error" }],
    [504, "bitok_timeout", { error: "bitok_timeout", message: "BitOK check timed out" }]
  ])("maps HTTP %s to AmlCheckError(%s)", async (status, code, body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(fetchResponse(status as number, body)));

    const provider = new SatoshkinBackendProvider(makeConfig());
    const failure = await provider
      .checkWallet({ address: BTC_ADDRESS, chain: "BTC" })
      .then(() => null)
      .catch((error: AmlCheckError) => error);

    expect(failure).toBeInstanceOf(AmlCheckError);
    expect(failure?.code).toBe(code);
    expect(failure?.httpStatus).toBe(status);
  });

  it("maps network failure to upstream_unreachable and appends the cause", async () => {
    const err = Object.assign(new TypeError("fetch failed"), { cause: new Error("ENOTFOUND") });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(err));

    const provider = new SatoshkinBackendProvider(makeConfig());
    const failure = await provider
      .checkWallet({ address: BTC_ADDRESS, chain: "BTC" })
      .then(() => null)
      .catch((e: AmlCheckError) => e);
    expect(failure?.code).toBe("upstream_unreachable");
    expect(failure?.message).toContain("ENOTFOUND");
  });

  it("maps a client-side timeout (TimeoutError) to bitok_timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"))
    );
    const provider = new SatoshkinBackendProvider(makeConfig());
    await expect(provider.checkWallet({ address: BTC_ADDRESS, chain: "BTC" })).rejects.toMatchObject({
      code: "bitok_timeout"
    });
  });

  it("never leaks the API key into an error message", async () => {
    const err = Object.assign(new TypeError('"Bearer sk_test_abc123" is an invalid header value'), {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(err));
    const provider = new SatoshkinBackendProvider(makeConfig());
    const failure = await provider
      .checkWallet({ address: BTC_ADDRESS, chain: "BTC" })
      .then(() => null)
      .catch((e: AmlCheckError) => e);
    expect(failure?.message).not.toContain("sk_test_abc123");
    expect(failure?.message).toContain("[redacted]");
  });

  it.each([
    ["empty object", {}],
    ["null", null],
    ["string", "maintenance"],
    ["missing risk_score", { ...SUCCESS_BODY, risk_score: undefined }],
    ["bad risk_level", { ...SUCCESS_BODY, risk_level: "extreme" }]
  ])("rejects a malformed 200 body (%s) as invalid_response", async (_label, body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(fetchResponse(200, body)));
    const provider = new SatoshkinBackendProvider(makeConfig());
    await expect(provider.checkWallet({ address: BTC_ADDRESS, chain: "BTC" })).rejects.toMatchObject({
      code: "invalid_response"
    });
  });

  it("maps a non-JSON 200 body to invalid_response", async () => {
    const bad = {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      }
    } as unknown as Response;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(bad));
    const provider = new SatoshkinBackendProvider(makeConfig());
    await expect(provider.checkWallet({ address: BTC_ADDRESS, chain: "BTC" })).rejects.toMatchObject({
      code: "invalid_response"
    });
  });

  it("requires an API key at construction", () => {
    expect(() => new SatoshkinBackendProvider(makeConfig({ apiKey: null }))).toThrow(AmlCheckError);
  });
});

describe("runCheckWalletAmlTool", () => {
  it("wraps success into a text content item", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(fetchResponse(200, SUCCESS_BODY)));
    const provider = new SatoshkinBackendProvider(makeConfig());

    const result = await runCheckWalletAmlTool(provider, { address: BTC_ADDRESS, chain: "BTC" });

    expect(result.isError).toBeUndefined();
    expect(JSON.parse(result.content[0].text)).toMatchObject({ risk_score: 17, risk_level: "low" });
  });

  it("returns structured isError payloads instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        fetchResponse(402, {
          error: "insufficient_balance",
          message: "Balance $0.00 < required $0.55 per check.",
          current_balance_usd: "0.00",
          required_usd: "0.55"
        })
      )
    );
    const provider = new SatoshkinBackendProvider(makeConfig());

    const result = await runCheckWalletAmlTool(provider, { address: BTC_ADDRESS, chain: "BTC" });

    expect(result.isError).toBe(true);
    const payload = JSON.parse(result.content[0].text);
    expect(payload.error).toBe("insufficient_balance");
    expect(payload.required_usd).toBe("0.55");
    expect(payload.http_status).toBe(402);
  });
});
