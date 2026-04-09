import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError, TokenManager } from "@/lib/api";

describe("ApiError", () => {
  it("creates error with correct properties", () => {
    const error = new ApiError(
      "Not found",
      404,
      { detail: "Resource missing" },
      "req-123",
    );

    expect(error.message).toBe("Not found");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({ detail: "Resource missing" });
    expect(error.requestId).toBe("req-123");
    expect(error.name).toBe("ApiError");
    expect(error.timestamp).toBeTruthy();
  });

  it("serializes to JSON correctly", () => {
    const error = new ApiError("Unauthorized", 401);
    const json = error.toJSON();

    expect(json.name).toBe("ApiError");
    expect(json.message).toBe("Unauthorized");
    expect(json.status).toBe(401);
  });

  it("is instanceof Error", () => {
    const error = new ApiError("Test", 500);
    expect(error instanceof Error).toBe(true);
    expect(error instanceof ApiError).toBe(true);
  });
});

describe("TokenManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves access token", () => {
    TokenManager.setAccessToken("test-access-token");
    expect(TokenManager.getAccessToken()).toBe("test-access-token");
  });

  it("stores and retrieves refresh token", () => {
    TokenManager.setRefreshToken("test-refresh-token");
    expect(TokenManager.getRefreshToken()).toBe("test-refresh-token");
  });

  it("returns null when no token stored", () => {
    expect(TokenManager.getAccessToken()).toBeNull();
    expect(TokenManager.getRefreshToken()).toBeNull();
  });

  it("clears all tokens", () => {
    TokenManager.setAccessToken("access");
    TokenManager.setRefreshToken("refresh");
    TokenManager.clearTokens();

    expect(TokenManager.getAccessToken()).toBeNull();
    expect(TokenManager.getRefreshToken()).toBeNull();
  });

  it("detects expired token", () => {
    // Create a JWT-like token with past expiry
    const payload = { exp: Math.floor(Date.now() / 1000) - 3600 };
    const encodedPayload = btoa(JSON.stringify(payload));
    const expiredToken = `header.${encodedPayload}.signature`;

    expect(TokenManager.isTokenExpired(expiredToken)).toBe(true);
  });

  it("detects valid token", () => {
    // Create a JWT-like token with future expiry
    const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
    const encodedPayload = btoa(JSON.stringify(payload));
    const validToken = `header.${encodedPayload}.signature`;

    expect(TokenManager.isTokenExpired(validToken)).toBe(false);
  });

  it("treats malformed token as expired", () => {
    expect(TokenManager.isTokenExpired("not-a-jwt")).toBe(true);
    expect(TokenManager.isTokenExpired("")).toBe(true);
  });
});
