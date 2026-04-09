import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAuth } from "@/hooks/useAuth";
import authReducer from "@/store/authSlice";

vi.mock("@/lib/authService", () => ({
  authService: {
    isAuthenticated: vi.fn(() => false),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUserFromStorage: vi.fn(() => null),
  },
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  TokenManager: {
    getAccessToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    clearTokens: vi.fn(),
    isTokenExpired: vi.fn(() => true),
    getUser: vi.fn(() => null),
  },
}));

const mockUser = {
  id: "1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  fullName: "Test User",
  role: "customer" as const,
  permissions: [],
  isEmailVerified: true,
  isPhoneVerified: false,
  kycStatus: "verified" as const,
  mfaEnabled: false,
  status: "active" as const,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

const createTestStore = (initialState = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  });

const makeWrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial unauthenticated state", async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns authenticated state when user is logged in", async () => {
    const store = createTestStore({
      user: mockUser,
      token: "test-token",
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe("test-token");
  });

  it("exposes refreshAuthToken function", async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refreshAuthToken).toBe("function");
  });

  it("returns loading true before initialization completes", () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(store),
    });

    // On first render, initialized is false → isLoading should be true
    expect(result.current.isLoading).toBe(true);
  });
});
