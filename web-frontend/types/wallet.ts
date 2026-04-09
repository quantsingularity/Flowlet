import type { LucideIcon } from "lucide-react";

// --- Data Interfaces ---

/**
 * Interface for a single quick statistic displayed on the dashboard.
 */
export interface QuickStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

/**
 * Interface for a single financial transaction displayed on the dashboard.
 */
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

/**
 * Interface for the main wallet data fetched from the service.
 */
export interface WalletData {
  quickStats: QuickStat[];
  recentTransactions: Transaction[];
}

// --- Component Props Interfaces ---

export interface WalletSummaryProps {
  quickStats: QuickStat[];
}

export interface TransactionListProps {
  transactions: Transaction[];
}

// --- State Interfaces ---

export interface DashboardState {
  data: WalletData | null;
  isLoading: boolean;
  error: string | null;
}
