import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "@/components/wallet/Dashboard";
import { mockUser, render, screen, waitFor } from "@/test/utils";

vi.mock("@/services/walletService", () => ({
  fetchWalletData: vi.fn(() =>
    Promise.resolve({
      quickStats: [
        {
          title: "Total Balance",
          value: "$12,345.67",
          change: "+2.5%",
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
        {
          id: 3,
          description: "Electric Bill",
          amount: -120.45,
          date: "2024-01-14",
          category: "Utilities",
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

  it("renders welcome message with user name after loading", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Welcome back, Test!")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Here's what's happening with your finances today."),
    ).toBeInTheDocument();
  });

  it("displays quick stats cards after loading", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total Balance")).toBeInTheDocument();
      expect(screen.getByText("Monthly Income")).toBeInTheDocument();
      expect(screen.getByText("Monthly Expenses")).toBeInTheDocument();
      expect(screen.getByText("Savings Rate")).toBeInTheDocument();
    });
  });

  it("shows quick action buttons after loading", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add transaction/i }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: /send money/i })[0],
      ).toBeInTheDocument();
    });
  });

  it("displays recent transactions after loading", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
      expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
    });
  });

  it("shows quick actions card", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(
        screen.getByText("Common tasks and shortcuts"),
      ).toBeInTheDocument();
    });
  });

  it("displays transaction amounts with correct sign formatting", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("+$4200.00")).toBeInTheDocument();
    });
  });

  it("displays percentage changes for stats", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("+2.5% from last month")).toBeInTheDocument();
      expect(screen.getByText("+8.1% from last month")).toBeInTheDocument();
      expect(screen.getByText("-3.2% from last month")).toBeInTheDocument();
    });
  });

  it("shows view all transactions button", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /view all transactions/i }),
      ).toBeInTheDocument();
    });
  });
});
