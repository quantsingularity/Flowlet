import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, beforeEach } from "vitest";
import walletReducer, {
  fetchAccounts,
  fetchAccountDetails,
  fetchTransactions,
  fetchCards,
  fetchDashboardSummary,
} from "@/store/walletSlice";

vi.mock("@/lib/walletService", () => ({
  walletService: {
    getAccounts: vi.fn(),
    getAccount: vi.fn(),
    getTransactions: vi.fn(),
    getCards: vi.fn(),
    getAccountSummary: vi.fn(),
    createAccount: vi.fn(),
    depositFunds: vi.fn(),
    withdrawFunds: vi.fn(),
    transferFunds: vi.fn(),
    issueCard: vi.fn(),
    activateCard: vi.fn(),
    toggleCardStatus: vi.fn(),
    getCard: vi.fn(),
    getSpendingAnalytics: vi.fn(),
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
}));

const mockAccount = {
  id: "acc-1",
  userId: "user-1",
  type: "checking" as const,
  status: "active" as const,
  balance: 1000,
  currency: "USD" as const,
  accountNumber: "****1234",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

const mockTransaction = {
  id: "tx-1",
  walletId: "acc-1",
  type: "deposit" as const,
  amount: 100,
  currency: "USD" as const,
  description: "Test deposit",
  category: "income" as const,
  status: "completed" as const,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

const mockCard = {
  id: "card-1",
  accountId: "acc-1",
  type: "virtual" as const,
  brand: "visa" as const,
  status: "active" as const,
  last4: "4242",
  expiryMonth: 12,
  expiryYear: 2026,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

const createTestStore = () =>
  configureStore({ reducer: { wallet: walletReducer } });

describe("walletSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has correct initial state", () => {
    const store = createTestStore();
    const state = store.getState().wallet;

    expect(state.accounts).toEqual([]);
    expect(state.transactions).toEqual([]);
    expect(state.cards).toEqual([]);
    expect(state.currentAccount).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe("fetchAccounts thunk", () => {
    it("sets loading on pending", () => {
      const store = createTestStore();
      store.dispatch(fetchAccounts.pending("", undefined));
      expect(store.getState().wallet.isLoading).toBe(true);
    });

    it("sets accounts on fulfilled", async () => {
      const { walletService } = await import("@/lib/walletService");
      vi.mocked(walletService.getAccounts).mockResolvedValue([mockAccount]);

      const store = createTestStore();
      await store.dispatch(fetchAccounts());

      const state = store.getState().wallet;
      expect(state.isLoading).toBe(false);
      expect(state.accounts).toHaveLength(1);
      expect(state.accounts[0].id).toBe("acc-1");
    });

    it("sets error on rejected", async () => {
      const { walletService } = await import("@/lib/walletService");
      vi.mocked(walletService.getAccounts).mockRejectedValue(
        new Error("Network error"),
      );

      const store = createTestStore();
      await store.dispatch(fetchAccounts());

      const state = store.getState().wallet;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Network error");
    });
  });

  describe("fetchAccountDetails thunk", () => {
    it("sets currentAccount on fulfilled", async () => {
      const { walletService } = await import("@/lib/walletService");
      vi.mocked(walletService.getAccount).mockResolvedValue(mockAccount);

      const store = createTestStore();
      await store.dispatch(fetchAccountDetails("acc-1"));

      expect(store.getState().wallet.currentAccount).toEqual(mockAccount);
    });
  });

  describe("fetchCards thunk", () => {
    it("sets cards on fulfilled", async () => {
      const { walletService } = await import("@/lib/walletService");
      vi.mocked(walletService.getCards).mockResolvedValue([mockCard]);

      const store = createTestStore();
      await store.dispatch(fetchCards());

      expect(store.getState().wallet.cards).toHaveLength(1);
      expect(store.getState().wallet.cards[0].id).toBe("card-1");
    });
  });

  describe("fetchDashboardSummary thunk", () => {
    it("sets dashboardSummary on fulfilled", async () => {
      const { walletService } = await import("@/lib/walletService");
      const mockSummary = {
        total_balance: 5000,
        total_accounts: 2,
        total_cards: 1,
        recent_transactions: [mockTransaction],
        monthly_spending: 1200,
        monthly_income: 4200,
      };
      vi.mocked(walletService.getAccountSummary).mockResolvedValue(mockSummary);

      const store = createTestStore();
      await store.dispatch(fetchDashboardSummary());

      expect(store.getState().wallet.dashboardSummary).toEqual(mockSummary);
    });
  });
});
