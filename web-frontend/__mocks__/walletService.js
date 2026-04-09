import { vi } from "vitest";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";

const mockWalletData = {
  quickStats: [
    {
      title: "Total Balance",
      value: "$100.00",
      change: "+1.0%",
      trend: "up",
      icon: Wallet,
    },
    {
      title: "Monthly Income",
      value: "$4,200.00",
      change: "+8.1%",
      trend: "up",
      icon: ArrowDownRight,
    },
    {
      title: "Monthly Expenses",
      value: "$2,850.30",
      change: "-3.2%",
      trend: "down",
      icon: ArrowUpRight,
    },
    {
      title: "Savings Rate",
      value: "32.1%",
      change: "+5.4%",
      trend: "up",
      icon: TrendingUp,
    },
  ],
  recentTransactions: [
    {
      id: 1,
      description: "Grocery Store",
      amount: -85.32,
      date: "2024-01-15",
      category: "Food",
    },
    {
      id: 2,
      description: "Salary Deposit",
      amount: 4200.0,
      date: "2024-01-15",
      category: "Income",
    },
    {
      id: 3,
      description: "Electric Bill",
      amount: -120.45,
      date: "2024-01-14",
      category: "Utilities",
    },
    {
      id: 4,
      description: "Coffee Shop",
      amount: -12.5,
      date: "2024-01-14",
      category: "Food",
    },
    {
      id: 5,
      description: "Gas Station",
      amount: -65.0,
      date: "2024-01-13",
      category: "Transport",
    },
  ],
};

export const fetchWalletData = vi.fn(() => Promise.resolve(mockWalletData));
