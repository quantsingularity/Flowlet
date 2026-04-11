import type { LucideIcon } from "lucide-react";

export interface QuickStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface WalletData {
  quickStats: QuickStat[];
  recentTransactions: Transaction[];
}

export interface WalletSummaryProps {
  quickStats: QuickStat[];
}

export interface TransactionListProps {
  transactions: Transaction[];
}

export interface DashboardState {
  data: WalletData | null;
  isLoading: boolean;
  error: string | null;
}
