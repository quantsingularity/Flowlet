import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TransactionHistory from "@/components/features/transactions/TransactionHistory";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderTH = () =>
  render(
    <MemoryRouter>
      <TransactionHistory />
    </MemoryRouter>,
  );

describe("TransactionHistory", () => {
  it("renders page heading", () => {
    renderTH();
    expect(screen.getByText(/transaction history/i)).toBeInTheDocument();
  });

  it("renders search input", () => {
    renderTH();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("renders transactions in the list", () => {
    renderTH();
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
  });

  it("filters transactions by search term", () => {
    renderTH();
    const search = screen.getByPlaceholderText(/search/i);
    fireEvent.change(search, { target: { value: "Coffee" } });
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    expect(screen.queryByText("Salary Deposit")).not.toBeInTheDocument();
  });

  it("shows Export CSV button", () => {
    renderTH();
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });
});
