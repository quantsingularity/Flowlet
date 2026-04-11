import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Dashboard from "@/src/components/features/dashboard/Dashboard";
import authReducer from "@/src/store/authSlice";
import uiReducer from "@/src/store/uiSlice";

vi.mock("@/src/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { firstName: "Demo", lastName: "User", email: "demo@flowlet.com" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/src/services/walletService", () => ({
  fetchWalletData: vi.fn().mockResolvedValue({
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
        description: "Coffee Shop",
        amount: -4.5,
        date: "2025-01-14",
        category: "Food",
      },
      {
        id: 2,
        description: "Salary",
        amount: 4200,
        date: "2025-01-13",
        category: "Income",
      },
    ],
  }),
}));

const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
    preloadedState: {
      auth: {
        user: {
          id: "1",
          firstName: "Demo",
          lastName: "User",
          email: "demo@flowlet.com",
        },
        isAuthenticated: true,
        isLoading: false,
        token: null,
        error: null,
      },
    },
  });

const renderDashboard = () =>
  render(
    <Provider store={createTestStore()}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </Provider>,
  );

describe("Dashboard", () => {
  it("shows loading state initially", () => {
    renderDashboard();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders welcome message with user name", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Demo/)).toBeInTheDocument();
    });
  });

  it("renders stat cards after loading", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Total Balance")).toBeInTheDocument();
      expect(screen.getByText("Monthly Income")).toBeInTheDocument();
    });
  });

  it("renders transactions after loading", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.getByText("Salary")).toBeInTheDocument();
    });
  });

  it("shows quick actions panel", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Send Money")).toBeInTheDocument();
    });
  });
});
