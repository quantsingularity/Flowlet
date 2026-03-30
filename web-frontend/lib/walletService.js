// Wallet Service for Flowlet web-frontend
import { api } from "./api";

// Wallet Service Class
class WalletService {
  /**
   * Get all user accounts
   */
  async getAccounts() {
    return await api.get("/api/v1/accounts");
  }
  /**
   * Get specific account by ID
   */
  async getAccount(accountId) {
    return await api.get(`/api/v1/accounts/${accountId}`);
  }
  /**
   * Create new account
   */
  async createAccount(accountData) {
    return await api.post("/api/v1/accounts", accountData);
  }
  /**
   * Get account balance
   */
  async getAccountBalance(accountId) {
    return await api.get(`/api/v1/accounts/${accountId}/balance`);
  }
  /**
   * Deposit funds to account
   */
  async depositFunds(depositData) {
    return await api.post(
      `/api/v1/accounts/${depositData.account_id}/deposit`,
      depositData,
    );
  }
  /**
   * Withdraw funds from account
   */
  async withdrawFunds(withdrawalData) {
    return await api.post(
      `/api/v1/accounts/${withdrawalData.account_id}/withdraw`,
      withdrawalData,
    );
  }
  /**
   * Transfer funds between accounts
   */
  async transferFunds(transferData) {
    return await api.post("/api/v1/transfers", transferData);
  }
  /**
   * Get transaction history
   */
  async getTransactions(accountId, filters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = `/api/v1/accounts/${accountId}/transactions${queryString ? `?${queryString}` : ""}`;
    return await api.get(url);
  }
  /**
   * Get specific transaction
   */
  async getTransaction(transactionId) {
    return await api.get(`/api/v1/transactions/${transactionId}`);
  }
  /**
   * Cancel pending transaction
   */
  async cancelTransaction(transactionId) {
    await api.post(`/api/v1/transactions/${transactionId}/cancel`);
  }
  /**
   * Get all user cards
   */
  async getCards() {
    return await api.get("/api/v1/cards");
  }
  /**
   * Get specific card
   */
  async getCard(cardId) {
    return await api.get(`/api/v1/cards/${cardId}`);
  }
  /**
   * Issue new card
   */
  async issueCard(cardData) {
    return await api.post("/api/v1/cards", cardData);
  }
  /**
   * Activate card
   */
  async activateCard(cardId, activationCode) {
    await api.post(`/api/v1/cards/${cardId}/activate`, {
      activation_code: activationCode,
    });
  }
  /**
   * Block/Unblock card
   */
  async toggleCardStatus(cardId, action) {
    await api.post(`/api/v1/cards/${cardId}/${action}`);
  }
  /**
   * Update card limits
   */
  async updateCardLimits(cardId, limits) {
    return await api.put(`/api/v1/cards/${cardId}/limits`, limits);
  }
  /**
   * Get card transactions
   */
  async getCardTransactions(cardId, filters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = `/api/v1/cards/${cardId}/transactions${queryString ? `?${queryString}` : ""}`;
    return await api.get(url);
  }
  /**
   * Request card PIN change
   */
  async changeCardPin(cardId, currentPin, newPin) {
    await api.post(`/api/v1/cards/${cardId}/change-pin`, {
      current_pin: currentPin,
      new_pin: newPin,
    });
  }
  /**
   * Get spending analytics
   */
  async getSpendingAnalytics(accountId, period) {
    const params = new URLSearchParams();
    if (accountId) params.append("account_id", accountId);
    if (period) params.append("period", period);
    const queryString = params.toString();
    const url = `/api/v1/analytics/spending${queryString ? `?${queryString}` : ""}`;
    return await api.get(url);
  }
  /**
   * Get account summary
   */
  async getAccountSummary() {
    return await api.get("/api/v1/dashboard/summary");
  }
  /**
   * Search transactions
   */
  async searchTransactions(query, filters) {
    const params = new URLSearchParams({ search: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "search") {
          params.append(key, value.toString());
        }
      });
    }
    return await api.get(`/api/v1/transactions/search?${params.toString()}`);
  }
  /**
   * Export transactions
   */
  async exportTransactions(accountId, format, filters) {
    const params = new URLSearchParams({ format });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(
      `/api/v1/accounts/${accountId}/transactions/export?${params.toString()}`,
      { responseType: "blob" },
    );
    return response;
  }
}
// Export singleton instance
export const walletService = new WalletService();
export default walletService;
