import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "@/components/wallet/Dashboard";
import { mockUser, render, screen, waitFor } from "@/test/utils";

vi.mock("@/services/walletService", () => ({
  fetchWalletData: vi.fn(() =>
    Promise.resolve({
      quickStats: [
        {
          title: "Total Balance",
          value: "$100.00",
          change: "+1.0%",
          trend: "up",
          icon: () => null,
        },
        {
          title: "Monthly Income",
          value: "$4,200.00",
          change: "+8.1%",
          trend: "up",
          icon: () => null,
        },
        {
          title: "Monthly Expenses",
          value: "$2,850.30",
          change: "-3.2%",
          trend: "down",
          icon: () => null,
        },
        {
          title: "Savings Rate",
          value: "32.1%",
          change: "+5.4%",
          trend: "up",
          icon: () => null,
        },
      ],
      recentTransactions: [
        {
          id: 1,
          description: "Grocery Store",
          amount: -85.32,
          date: "2024-01-15",
          category: "Food",
        },
        {
          id: 2,
          description: "Salary Deposit",
          amount: 4200.0,
          date: "2024-01-15",
          category: "Income",
        },
      ],
    }),
  ),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
  }),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    const { fetchWalletData } = await import("@/services/walletService");
    vi.mocked(fetchWalletData).mockReturnValueOnce(new Promise(() => {}));

    render(<Dashboard />);

    expect(screen.getByText(/loading dashboard data/i)).toBeInTheDocument();
  });

  it("renders welcome message with user first name", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/welcome back, Test!/i)).toBeInTheDocument();
    });
  });

  it("displays quick stats after loading", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total Balance")).toBeInTheDocument();
      expect(screen.getByText("Monthly Income")).toBeInTheDocument();
      expect(screen.getByText("Monthly Expenses")).toBeInTheDocument();
      expect(screen.getByText("Savings Rate")).toBeInTheDocument();
    });
  });

  it("shows recent transactions after loading", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
      expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
    });
  });

  it("shows quick actions section", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    });
  });

  it("shows error state when fetch fails", async () => {
    const { fetchWalletData } = await import("@/services/walletService");
    vi.mocked(fetchWalletData).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
    });
  });
});
