import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import walletReducer, {
  clearError,
  clearWalletState,
} from "@/store/walletSlice";
import transactionReducer, {
  clearFilters,
  setPagination,
  clearError as clearTxError,
} from "@/store/transactionSlice";

const makeWalletStore = () =>
  configureStore({ reducer: { wallet: walletReducer } });
const makeTxStore = () =>
  configureStore({ reducer: { transactions: transactionReducer } });

describe("walletSlice", () => {
  it("initializes with empty accounts", () => {
    const store = makeWalletStore();
    expect(store.getState().wallet.accounts).toEqual([]);
    expect(store.getState().wallet.currentAccount).toBeNull();
    expect(store.getState().wallet.error).toBeNull();
  });

  it("clearError sets error to null", () => {
    const store = makeWalletStore();
    store.dispatch(clearError());
    expect(store.getState().wallet.error).toBeNull();
  });

  it("clearWalletState resets entire wallet state", () => {
    const store = makeWalletStore();
    store.dispatch(clearWalletState());
    const s = store.getState().wallet;
    expect(s.accounts).toEqual([]);
    expect(s.currentAccount).toBeNull();
    expect(s.cards).toEqual([]);
  });
});

describe("transactionSlice", () => {
  it("initializes with correct defaults", () => {
    const store = makeTxStore();
    const s = store.getState().transactions;
    expect(s.transactions).toEqual([]);
    expect(s.isLoading).toBe(false);
    expect(s.pagination.page).toBe(1);
  });

  it("setPagination updates page", () => {
    const store = makeTxStore();
    store.dispatch(setPagination({ page: 3 }));
    expect(store.getState().transactions.pagination.page).toBe(3);
  });

  it("setPagination updates limit", () => {
    const store = makeTxStore();
    store.dispatch(setPagination({ limit: 50 }));
    expect(store.getState().transactions.pagination.limit).toBe(50);
  });

  it("clearFilters resets filters to empty object", () => {
    const store = makeTxStore();
    store.dispatch(clearFilters());
    expect(store.getState().transactions.filters).toEqual({});
  });

  it("clearError sets error to null", () => {
    const store = makeTxStore();
    store.dispatch(clearTxError());
    expect(store.getState().transactions.error).toBeNull();
  });
});
