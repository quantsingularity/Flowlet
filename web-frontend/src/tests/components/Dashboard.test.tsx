import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Dashboard from "@/components/features/dashboard/Dashboard";
import authReducer from "@/store/authSlice";
import walletReducer from "@/store/walletSlice";
import uiReducer from "@/store/uiSlice";

vi.mock("@/lib/api/walletService", () => ({
  walletService: {
    getAccounts: vi.fn().mockResolvedValue([]),
    getCards: vi.fn().mockResolvedValue([]),
    getAccountSummary: vi.fn().mockResolvedValue({
      total_balance: 12345.67,
      total_accounts: 1,
      total_cards: 1,
      recent_transactions: [],
      monthly_spending: 2850,
      monthly_income: 4200,
    }),
    getTransactions: vi
      .fn()
      .mockResolvedValue({ data: [], total: 0, page: 1, per_page: 10 }),
  },
}));

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer, wallet: walletReducer, ui: uiReducer },
    preloadedState: {
      auth: {
        user: {
          id: "1",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
        } as any,
        isAuthenticated: true,
        isLoading: false,
        token: "test-token",
        error: null,
      },
      wallet: {
        accounts: [],
        currentAccount: null,
        transactions: [],
        cards: [],
        currentCard: null,
        dashboardSummary: null,
        analytics: null,
        isLoading: false,
        error: null,
      },
    },
  });

describe("Dashboard", () => {
  it("renders greeting", () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>,
    );
    expect(
      screen.getByText(/Good (morning|afternoon|evening), Test/i),
    ).toBeTruthy();
  });
});
