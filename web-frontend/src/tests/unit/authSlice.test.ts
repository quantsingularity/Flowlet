import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  clearError,
  updateUser,
  setLoading,
} from "@/store/authSlice";

const makeStore = (preloaded = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: preloaded },
  });

describe("authSlice", () => {
  it("initializes with correct default state", () => {
    const store = makeStore();
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("clearError resets error to null", () => {
    const store = makeStore({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: "Something failed",
    });
    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });

  it("setLoading updates isLoading", () => {
    const store = makeStore({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    store.dispatch(setLoading(true));
    expect(store.getState().auth.isLoading).toBe(true);
    store.dispatch(setLoading(false));
    expect(store.getState().auth.isLoading).toBe(false);
  });

  it("updateUser merges partial user data", () => {
    const initialUser = {
      id: "1",
      email: "old@test.com",
      firstName: "Old",
      lastName: "Name",
      fullName: "Old Name",
      role: "customer" as const,
      permissions: [],
      isEmailVerified: true,
      isPhoneVerified: false,
      kycStatus: "completed" as const,
      mfaEnabled: false,
      status: "active" as const,
      createdAt: "",
      updatedAt: "",
    };
    const store = makeStore({
      user: initialUser,
      token: "tok",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    store.dispatch(updateUser({ firstName: "New", email: "new@test.com" }));
    const user = store.getState().auth.user;
    expect(user?.firstName).toBe("New");
    expect(user?.email).toBe("new@test.com");
    expect(user?.lastName).toBe("Name"); // unchanged
  });

  it("updateUser is no-op when user is null", () => {
    const store = makeStore({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    store.dispatch(updateUser({ firstName: "Test" }));
    expect(store.getState().auth.user).toBeNull();
  });
});
