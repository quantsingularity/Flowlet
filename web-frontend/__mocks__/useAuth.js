import { vi } from "vitest";

export const useAuth = vi.fn(() => ({
  user: {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    fullName: "Test User",
    role: "customer",
    permissions: [],
    isEmailVerified: true,
    isPhoneVerified: false,
    kycStatus: "verified",
    mfaEnabled: false,
    status: "active",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  token: "mock-token",
  isAuthenticated: true,
  isLoading: false,
  error: null,
  refreshAuthToken: vi.fn(() => Promise.resolve(true)),
}));
