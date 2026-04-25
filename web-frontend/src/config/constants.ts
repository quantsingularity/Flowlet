export const APP_NAME = "Flowlet";
export const APP_VERSION = "2.0.0";

export const ROUTES = {
  HOME: "/home",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
  WALLET: "/wallet",
  WALLET_SEND: "/wallet/send",
  WALLET_RECEIVE: "/wallet/receive",
  WALLET_TRANSACTIONS: "/wallet/transactions",
  CARDS: "/cards",
  CARDS_ISSUE: "/cards/issue",
  ANALYTICS: "/analytics",
  BUDGETING: "/budgeting",
  CHAT: "/chat",
  ALERTS: "/alerts",
  FRAUD_DETECTION: "/fraud-detection",
  SECURITY: "/security",
  SECURITY_ADVANCED: "/security/advanced",
  WORKFLOWS: "/workflows",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  NOTIFICATIONS: "/notifications",
  FINANCIAL_PLANNING: "/financial-planning",
} as const;

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
] as const;

export const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Income",
  "Shopping",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Other",
] as const;

export const MAX_SEND_AMOUNT = 10_000;
export const FEE_RATE = 0.005; // 0.5%
export const MAX_FEE = 5; // $5

export const DEMO_EMAIL = "demo@flowlet.com";
export const DEMO_PASSWORD = "demo123";
