import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import LoginScreen from "@/components/auth/LoginScreen";
import authReducer from "@/store/authSlice";
import uiReducer from "@/store/uiSlice";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/store/authSlice", async () => {
  const actual = await vi.importActual("@/store/authSlice");
  return {
    ...actual,
    loginUser: vi.fn().mockImplementation(() => ({
      type: "auth/login/fulfilled",
      payload: {
        user: { id: "1", email: "demo@flowlet.com" },
        access_token: "demo.tok.sig",
      },
      unwrap: () =>
        Promise.resolve({ user: { id: "1" }, access_token: "demo.tok.sig" }),
    })),
  };
});

const createStore = () =>
  configureStore({ reducer: { auth: authReducer, ui: uiReducer } });

describe("Auth flow integration", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("submitting login form dispatches loginUser", async () => {
    const store = createStore();
    const dispatchSpy = vi.spyOn(store, "dispatch");

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      </Provider>,
    );

    const submit = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  it("shows error alert on login failure", async () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      </Provider>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "wrong@example.com");

    const passwordInput = screen.getByLabelText(/^password/i);
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "wrongpass");

    const submit = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submit);
  });
});
