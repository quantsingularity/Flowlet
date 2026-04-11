import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SendMoney from "@/components/features/transactions/SendMoney";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

const renderSend = () =>
  render(
    <MemoryRouter>
      <SendMoney availableBalance={1000} />
    </MemoryRouter>,
  );

describe("SendMoney", () => {
  it("renders form fields", () => {
    renderSend();
    expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  it("shows available balance", () => {
    renderSend();
    expect(screen.getByText(/1,000\.00/)).toBeInTheDocument();
  });

  it("shows validation error for empty recipient", async () => {
    renderSend();
    const submitBtn = screen.getByRole("button", { name: /continue|review/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText(/recipient is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for amount too small", async () => {
    const user = userEvent.setup();
    renderSend();
    await user.type(screen.getByLabelText(/amount/i), "0");
    fireEvent.click(screen.getByRole("button", { name: /continue|review/i }));
    await waitFor(() => {
      expect(screen.getByText(/greater than/i)).toBeInTheDocument();
    });
  });

  it("shows confirmation step with valid data", async () => {
    const user = userEvent.setup();
    renderSend();
    await user.type(screen.getByLabelText(/recipient/i), "alice@example.com");
    await user.type(screen.getByLabelText(/amount/i), "50");
    fireEvent.click(screen.getByRole("button", { name: /continue|review/i }));
    await waitFor(() => {
      expect(screen.getByText(/confirm/i)).toBeInTheDocument();
    });
  });
});
