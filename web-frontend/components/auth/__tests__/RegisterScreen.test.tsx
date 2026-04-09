import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterScreen from "@/components/auth/RegisterScreen";
import authReducer from "@/store/authSlice";
import uiReducer from "@/store/uiSlice";

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock("@/store/authSlice", () => ({
  registerUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

const createTestStore = () =>
  configureStore({ reducer: { auth: authReducer, ui: uiReducer } });

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>,
  );
};

describe("RegisterScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders registration form correctly", () => {
    renderWithProviders(<RegisterScreen />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("shows validation errors for empty form", async () => {
    renderWithProviders(<RegisterScreen />);

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/first name must be at least 2 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("shows password mismatch error", async () => {
    renderWithProviders(<RegisterScreen />);

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "DifferentPassword123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it("has a link to login page", () => {
    renderWithProviders(<RegisterScreen />);

    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("toggles password visibility", () => {
    renderWithProviders(<RegisterScreen />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButtons = screen.getAllByRole("button", { name: "" });
    fireEvent.click(toggleButtons[0]);

    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
