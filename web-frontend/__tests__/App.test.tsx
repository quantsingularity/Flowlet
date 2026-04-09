import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "@/App";
import { render, screen } from "@/test/utils";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks";

vi.mock("@/components/LoadingScreen", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("@/components/OfflineIndicator", () => ({
  default: () => <div data-testid="offline-indicator">Offline</div>,
}));

vi.mock("@/components/auth/LoginScreen", () => ({
  default: () => <div>Login Screen</div>,
}));

vi.mock("@/components/auth/RegisterScreen", () => ({
  default: () => <div>Register Screen</div>,
}));

vi.mock("@/components/auth/OnboardingFlow", () => ({
  default: () => <div>Onboarding</div>,
}));

vi.mock("@/components/auth/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/auth/PublicRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/Layout", () => ({
  default: () => <div>Layout</div>,
}));

vi.mock("@/components/wallet/Dashboard", () => ({
  default: () => <div>Dashboard</div>,
}));

vi.mock("@/components/pages/HomePage", () => ({
  default: () => <div>Home Page</div>,
}));

vi.mock("@/components/pages/PaymentsPage", () => ({
  default: () => <div>Payments Page</div>,
}));

vi.mock("@/components/pages/CompliancePage", () => ({
  default: () => <div>Compliance Page</div>,
}));

vi.mock("@/components/pages/DeveloperPortalPage", () => ({
  default: () => <div>Developer Page</div>,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks", () => ({
  useOnlineStatus: vi.fn(() => true),
  useResponsive: vi.fn(() => ({ isMobile: false })),
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: any) => any) =>
    selector({ ui: { theme: "system" } }),
}));

describe("App Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      refreshAuthToken: vi.fn(),
    });
    vi.mocked(useOnlineStatus).mockReturnValue(true);
  });

  it("shows loading screen when auth is loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      refreshAuthToken: vi.fn(),
    });

    render(<App />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders without crashing for unauthenticated user", () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it("shows offline indicator when offline", () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      refreshAuthToken: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("offline-indicator")).toBeInTheDocument();
  });

  it("handles error boundary on render crash", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(useAuth).mockImplementation(() => {
      throw new Error("Test error");
    });

    render(<App />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
