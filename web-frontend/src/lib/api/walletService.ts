// Wallet service — wraps /api/v1/accounts/*, /api/v1/cards/*, /api/v1/analytics/*
import { apiFetch } from "./client";

// ---------------------------------------------------------------------------
// Exported types (consumed by walletSlice.ts)
// ---------------------------------------------------------------------------
export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_type: "checking" | "savings" | "business";
  currency: string;
  balance: number;
  available_balance: number;
  status: "active" | "inactive" | "frozen" | "closed";
  daily_limit: number;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  from_account_id?: string;
  to_account_id?: string;
  type:
    | "deposit"
    | "withdrawal"
    | "transfer"
    | "payment"
    | "refund"
    | "fee"
    | "reversal";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled" | "reversed";
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  account_id: string;
  card_number_masked: string;
  card_type: "debit" | "credit" | "prepaid";
  status: "active" | "inactive" | "blocked" | "expired" | "frozen";
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  daily_limit: number;
  monthly_limit: number;
  contactless_enabled: boolean;
  online_enabled: boolean;
  international_enabled: boolean;
  created_at: string;
}

export interface TransactionFilters {
  page?: number;
  per_page?: number;
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

interface AccountsResponse {
  accounts: Account[];
}

interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  per_page: number;
}

interface DashboardSummary {
  total_balance: number;
  total_accounts: number;
  total_cards: number;
  recent_transactions: Transaction[];
  monthly_spending: number;
  monthly_income: number;
}

interface SpendingAnalytics {
  total_spent: number;
  categories: Array<{ category: string; amount: number; percentage: number }>;
  trends: Array<{ date: string; amount: number }>;
}

// ---------------------------------------------------------------------------
// walletService
// ---------------------------------------------------------------------------
export const walletService = {
  // ----- Accounts -----------------------------------------------------------
  async getAccounts(): Promise<Account[]> {
    const data = await apiFetch<AccountsResponse>("/accounts/");
    return data.accounts ?? [];
  },

  async getAccount(accountId: string): Promise<Account> {
    return apiFetch<Account>(`/accounts/${accountId}`);
  },

  async createAccount(body: {
    account_type: "checking" | "savings" | "business";
    currency?: string;
  }): Promise<Account> {
    return apiFetch<Account>("/accounts/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // ----- Transactions -------------------------------------------------------
  async getTransactions(
    accountId: string,
    filters?: TransactionFilters,
  ): Promise<TransactionsResponse> {
    const params = filters
      ? "?" + new URLSearchParams(filters as Record<string, string>).toString()
      : "";
    return apiFetch<TransactionsResponse>(
      `/accounts/${accountId}/transactions${params}`,
    );
  },

  async depositFunds(body: {
    account_id: string;
    amount: number;
    description?: string;
  }): Promise<Transaction> {
    return apiFetch<Transaction>(`/accounts/${body.account_id}/deposit`, {
      method: "POST",
      body: JSON.stringify({
        amount: body.amount,
        description: body.description,
      }),
    });
  },

  async withdrawFunds(body: {
    account_id: string;
    amount: number;
    description?: string;
  }): Promise<Transaction> {
    return apiFetch<Transaction>(`/accounts/${body.account_id}/withdraw`, {
      method: "POST",
      body: JSON.stringify({
        amount: body.amount,
        description: body.description,
      }),
    });
  },

  async transferFunds(body: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    description?: string;
  }): Promise<Transaction> {
    return apiFetch<Transaction>(`/accounts/${body.from_account_id}/transfer`, {
      method: "POST",
      body: JSON.stringify({
        to_account_id: body.to_account_id,
        amount: body.amount,
        description: body.description,
      }),
    });
  },

  // ----- Cards --------------------------------------------------------------
  async getCards(): Promise<Card[]> {
    const data = await apiFetch<{ cards: Card[] }>("/cards/");
    return data.cards ?? [];
  },

  async getCard(cardId: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${cardId}`);
  },

  async issueCard(body: {
    account_id: string;
    card_type: "debit" | "credit" | "prepaid";
    daily_limit?: number;
    monthly_limit?: number;
  }): Promise<Card> {
    return apiFetch<Card>("/cards/issue", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async activateCard(cardId: string, _activationCode: string): Promise<void> {
    await apiFetch(`/cards/${cardId}/activate`, { method: "POST" });
  },

  async toggleCardStatus(
    cardId: string,
    action: "block" | "unblock",
  ): Promise<void> {
    const endpoint = action === "block" ? "freeze" : "unfreeze";
    await apiFetch(`/cards/${cardId}/${endpoint}`, { method: "POST" });
  },

  // ----- Dashboard & Analytics ----------------------------------------------
  async getAccountSummary(): Promise<DashboardSummary> {
    // Aggregate from accounts + cards endpoints when a dedicated summary
    // endpoint is not available
    try {
      return await apiFetch<DashboardSummary>("/analytics/summary");
    } catch {
      // Fallback: build summary from accounts list
      const accounts = await walletService.getAccounts();
      const cards = await walletService.getCards();
      const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
      return {
        total_balance: totalBalance,
        total_accounts: accounts.length,
        total_cards: cards.length,
        recent_transactions: [],
        monthly_spending: 0,
        monthly_income: 0,
      };
    }
  },

  async getSpendingAnalytics(
    _accountId?: string,
    period?: "week" | "month" | "quarter" | "year",
  ): Promise<SpendingAnalytics> {
    const params = period ? `?period=${period}` : "";
    try {
      return await apiFetch<SpendingAnalytics>(`/analytics/spending${params}`);
    } catch {
      return { total_spent: 0, categories: [], trends: [] };
    }
  },
};
