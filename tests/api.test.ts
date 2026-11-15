import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest } from "@/lib/api";

describe("apiRequest error handling", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("turns a 401 response into a typed ApiError", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Please sign in." } }), {
      status: 401, headers: { "Content-Type": "application/json" }
    }));
    await expect(apiRequest("/api/me")).rejects.toMatchObject({
      name: "ApiError", status: 401, code: "UNAUTHORIZED", message: "Please sign in."
    });
  });

  it("normalizes a server error when the response body is not JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("not json", { status: 500 }));
    await expect(apiRequest("/api/fact")).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest("/api/fact")).rejects.toMatchObject({
      status: 500, code: "UNKNOWN_ERROR", message: "Something went wrong. Please try again."
    });
  });
});
