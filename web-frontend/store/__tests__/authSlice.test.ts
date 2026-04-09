import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, beforeEach } from "vitest";
import authReducer, {
  clearError,
  loginUser,
  logoutUser,
  updateUser,
  validateToken,
} from "@/store/authSlice";

// Mock the authService used by thunks
vi.mock("@/lib/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUserFromStorage: vi.fn(),
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
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    getRefreshToken: vi.fn(() => null),
    clearTokens: vi.fn(),
    isTokenExpired: vi.fn(() => true),
    getUser: vi.fn(() => null),
    setUser: vi.fn(),
  },
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
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
};

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

describe("authSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reducers", () => {
    it("should handle clearError", () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Some error",
      };

      const action = clearError();
      const newState = authReducer(initialState, action);

      expect(newState.error).toBeNull();
    });

    it("should handle updateUser", () => {
      const initialState = {
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const action = updateUser({ email: "updated@example.com" });
      const newState = authReducer(initialState, action);

      expect(newState.user?.email).toBe("updated@example.com");
      expect(newState.user?.firstName).toBe("Test");
    });

    it("should not update user when no user in state", () => {
      const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

      const action = updateUser({ email: "updated@example.com" });
      const newState = authReducer(initialState, action);

      expect(newState.user).toBeNull();
    });
  });

  describe("loginUser thunk", () => {
    it("should set loading on pending", () => {
      const store = createTestStore();
      store.dispatch(loginUser.pending("", { email: "", password: "" }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should set user and token on fulfilled", async () => {
      const { authService } = await import("@/lib/authService");
      const mockResponse = {
        user: mockUser,
        access_token: "test-token",
        refresh_token: "refresh-token",
        expires_in: 3600,
      };
      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      const store = createTestStore();
      await store.dispatch(
        loginUser({ email: "test@example.com", password: "password123" }),
      );

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("test-token");
    });

    it("should set error on rejected", async () => {
      const { authService } = await import("@/lib/authService");
      vi.mocked(authService.login).mockRejectedValue(
        new Error("Invalid credentials"),
      );

      const store = createTestStore();
      await store.dispatch(
        loginUser({ email: "test@example.com", password: "wrongpassword" }),
      );

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe("Invalid credentials");
    });
  });

  describe("logoutUser thunk", () => {
    it("should clear auth state on logout", async () => {
      const { authService } = await import("@/lib/authService");
      vi.mocked(authService.logout).mockResolvedValue();

      const store = createTestStore({
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
      });

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it("should clear auth state even if server logout fails", async () => {
      const { authService } = await import("@/lib/authService");
      vi.mocked(authService.logout).mockRejectedValue(
        new Error("Server error"),
      );

      const store = createTestStore({
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
      });

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe("validateToken thunk", () => {
    it("should set user on successful validation", async () => {
      const { authService } = await import("@/lib/authService");
      const { TokenManager } = await import("@/lib/api");
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(TokenManager.getAccessToken).mockReturnValue("real-token");

      const store = createTestStore();
      await store.dispatch(validateToken());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("real-token");
    });

    it("should reject when not authenticated", async () => {
      const { authService } = await import("@/lib/authService");
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);

      const store = createTestStore();
      await store.dispatch(validateToken());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
