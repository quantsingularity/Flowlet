// Public API barrel — re-exports for library consumers
// Components
export { default as Dashboard } from "./components/features/dashboard/Dashboard";
export { default as TransactionList } from "./components/features/dashboard/TransactionList";
export { default as WalletScreen } from "./components/features/wallet/WalletScreen";
export { default as CardsScreen } from "./components/features/cards/CardsScreen";
export { default as TransactionHistory } from "./components/features/transactions/TransactionHistory";
export { default as SendMoney } from "./components/features/transactions/SendMoney";
export { default as ReceiveMoney } from "./components/features/transactions/ReceiveMoney";
export { default as AnalyticsScreen } from "./components/features/analytics/AnalyticsScreen";
export { default as BudgetingScreen } from "./components/features/budgeting/BudgetingScreen";
export { default as SecurityScreen } from "./components/features/security/SecurityScreen";
export { default as SettingsScreen } from "./components/features/settings/SettingsScreen";
export { default as ChatbotScreen } from "./components/features/ai/ChatbotScreen";
export { default as FraudAlerts } from "./components/features/ai/FraudAlerts";
export { default as LoginScreen } from "./components/auth/LoginScreen";
export { default as RegisterScreen } from "./components/auth/RegisterScreen";

// Hooks
export { useAuth } from "./hooks/useAuth";
export { useAppDispatch, useAppSelector } from "./hooks/redux";
export {
  useResponsive,
  useOnlineStatus,
  useDebounce,
  useLocalStorage,
} from "./hooks/useResponsive";

// Store
export { store } from "./store";
export type { RootState, AppDispatch } from "./store";
export { loginUser, logoutUser, registerUser } from "./store/authSlice";
export { setTheme, toggleSidebar, addNotification } from "./store/uiSlice";

// Types
export type { User, LoginCredentials, RegisterData, AuthState } from "./types";
export type {
  QuickStat,
  Transaction,
  WalletData,
  DashboardState,
} from "./types/wallet";

// Utils
export {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "./lib/utils/utils";
