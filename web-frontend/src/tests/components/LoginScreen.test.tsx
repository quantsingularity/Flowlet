import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import LoginScreen from "@/src/components/auth/LoginScreen";
import authReducer from "@/src/store/authSlice";
import uiReducer from "@/src/store/uiSlice";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

const createStore = () =>
  configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  });

const renderLogin = () =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>
    </Provider>,
  );

describe("LoginScreen", () => {
  it("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders demo credentials", () => {
    renderLogin();
    expect(screen.getByText("demo@flowlet.com")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: "" });
    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("shows validation error for invalid email", async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "not-an-email");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it("has a link to register page", () => {
    renderLogin();
    const registerLink = screen.getByRole("link", { name: /create account/i });
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("has a link to forgot password page", () => {
    renderLogin();
    const forgotLink = screen.getByRole("link", { name: /forgot password/i });
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });
});
