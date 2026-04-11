import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WalletScreen from "@/components/features/wallet/WalletScreen";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

const renderWallet = (props = {}) =>
  render(
    <MemoryRouter>
      <WalletScreen {...props} />
    </MemoryRouter>,
  );

describe("WalletScreen", () => {
  it("renders account balance", () => {
    renderWallet({ balance: 9999.99 });
    expect(screen.getByText(/9,999\.99/)).toBeInTheDocument();
  });

  it("renders default balance when none provided", () => {
    renderWallet();
    expect(screen.getByText(/12,345\.67/)).toBeInTheDocument();
  });

  it("toggles balance visibility", () => {
    renderWallet();
    const toggleBtn = screen.getByRole("button", { name: /toggle balance/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByText("••••••")).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    expect(screen.queryByText("••••••")).not.toBeInTheDocument();
  });

  it("shows Send and Receive buttons", () => {
    renderWallet();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /receive/i }),
    ).toBeInTheDocument();
  });

  it("renders recent transactions", () => {
    renderWallet();
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
  });

  it("renders custom transactions", () => {
    renderWallet({
      recentTransactions: [
        {
          id: "x1",
          description: "Custom TX",
          amount: 100,
          type: "credit",
          date: "2025-06-01",
        },
      ],
    });
    expect(screen.getByText("Custom TX")).toBeInTheDocument();
  });

  it("shows pending badge for pending transactions", () => {
    renderWallet({
      recentTransactions: [
        {
          id: "p1",
          description: "Pending TX",
          amount: -20,
          type: "debit",
          date: "2025-06-01",
          status: "pending",
        },
      ],
    });
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
