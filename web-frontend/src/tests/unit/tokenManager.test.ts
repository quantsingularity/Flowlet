import { describe, it, expect, beforeEach } from "vitest";
import { TokenManager } from "@/src/lib/api/client";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("TokenManager", () => {
  beforeEach(() => localStorageMock.clear());

  it("stores and retrieves access token", () => {
    TokenManager.setAccessToken("test-token");
    expect(TokenManager.getAccessToken()).toBe("test-token");
  });

  it("stores and retrieves refresh token", () => {
    TokenManager.setRefreshToken("refresh-token");
    expect(TokenManager.getRefreshToken()).toBe("refresh-token");
  });

  it("stores and retrieves user data", () => {
    const user = { id: "1", email: "test@example.com" };
    TokenManager.setUser(user);
    expect(TokenManager.getUser()).toMatchObject({ id: "1", email: "test@example.com" });
  });

  it("strips password from stored user", () => {
    TokenManager.setUser({ id: "1", email: "x@x.com", password: "secret" });
    expect(TokenManager.getUser() as Record<string, unknown>).not.toHaveProperty("password");
  });

  it("clears all tokens", () => {
    TokenManager.setAccessToken("a");
    TokenManager.setRefreshToken("b");
    TokenManager.setUser({ id: "1" });
    TokenManager.clearTokens();
    expect(TokenManager.getAccessToken()).toBeNull();
    expect(TokenManager.getRefreshToken()).toBeNull();
    expect(TokenManager.getUser()).toBeNull();
  });

  it("demo tokens are never expired", () => {
    expect(TokenManager.isTokenExpired("demo.abc.sig")).toBe(false);
  });

  it("malformed token is considered expired", () => {
    expect(TokenManager.isTokenExpired("bad-token")).toBe(true);
  });

  it("expired JWT is detected as expired", () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
    expect(TokenManager.isTokenExpired(`h.${payload}.s`)).toBe(true);
  });

  it("future JWT is not expired", () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    expect(TokenManager.isTokenExpired(`h.${payload}.s`)).toBe(false);
  });
});
