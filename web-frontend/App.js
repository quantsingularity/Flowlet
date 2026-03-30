import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Provider } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
// Auth Components
import LoginScreen from "@/components/auth/LoginScreen";
import OnboardingFlow from "@/components/auth/OnboardingFlow";
// Route Guards
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import RegisterScreen from "@/components/auth/RegisterScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
// Layout Components
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import OfflineIndicator from "@/components/OfflineIndicator";
import AIFraudDetectionScreen from "@/components/pages/ai/AIFraudDetectionScreen";
import ChatbotScreen from "@/components/pages/ai/ChatbotScreen";
import FraudAlerts from "@/components/pages/ai/FraudAlerts";
// Analytics & AI
import AnalyticsScreen from "@/components/pages/analytics/AnalyticsScreen";
// Budgeting
import AdvancedBudgetingScreen from "@/components/pages/budgeting/AdvancedBudgetingScreen";
import CompliancePage from "@/components/pages/CompliancePage";
import CardDetails from "@/components/pages/cards/CardDetails";
// Card Components
import CardsScreen from "@/components/pages/cards/CardsScreen";
import IssueCard from "@/components/pages/cards/IssueCard";
import DeveloperPortalPage from "@/components/pages/DeveloperPortalPage";
// Public Pages
import HomePage from "@/components/pages/HomePage";
import PaymentsPage from "@/components/pages/PaymentsPage";
import EnhancedSecurityScreen from "@/components/pages/security/EnhancedSecurityScreen";
// Security & Settings
import SecurityScreen from "@/components/pages/security/SecurityScreen";
import SettingsScreen from "@/components/pages/settings/SettingsScreen";
import ReceiveMoney from "@/components/pages/transactions/ReceiveMoney";
import SendMoney from "@/components/pages/transactions/SendMoney";
import TransactionHistory from "@/components/pages/transactions/TransactionHistory";
import WalletScreen from "@/components/pages/wallet/WalletScreen";
// Page Components - Dashboard & Wallet
import Dashboard from "@/components/wallet/Dashboard";
import { useOnlineStatus, useResponsive } from "@/hooks";
// Hooks
import { useAuth } from "@/hooks/useAuth";
import { store } from "@/store";
import "./App.css";
function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { isMobile } = useResponsive();
  // Show loading screen during initial auth check
  if (isLoading) {
    return _jsx(LoadingScreen, {});
  }
  return _jsx(Provider, {
    store: store,
    children: _jsx(ErrorBoundary, {
      children: _jsx("div", {
        className: "min-h-screen bg-background text-foreground",
        children: _jsxs(Router, {
          children: [
            !isOnline && _jsx(OfflineIndicator, {}),
            _jsxs(Routes, {
              children: [
                _jsx(Route, {
                  path: "/login",
                  element: _jsx(PublicRoute, {
                    children: _jsx(LoginScreen, {}),
                  }),
                }),
                _jsx(Route, {
                  path: "/register",
                  element: _jsx(PublicRoute, {
                    children: _jsx(RegisterScreen, {}),
                  }),
                }),
                _jsx(Route, {
                  path: "/onboarding",
                  element: _jsx(PublicRoute, {
                    children: _jsx(OnboardingFlow, {}),
                  }),
                }),
                _jsx(Route, { path: "/home", element: _jsx(HomePage, {}) }),
                _jsx(Route, {
                  path: "/payments",
                  element: _jsx(PaymentsPage, {}),
                }),
                _jsx(Route, {
                  path: "/compliance",
                  element: _jsx(CompliancePage, {}),
                }),
                _jsx(Route, {
                  path: "/developer",
                  element: _jsx(DeveloperPortalPage, {}),
                }),
                _jsxs(Route, {
                  path: "/",
                  element: _jsx(ProtectedRoute, {
                    children: _jsx(Layout, { isMobile: isMobile }),
                  }),
                  children: [
                    _jsx(Route, {
                      index: true,
                      element: _jsx(Navigate, {
                        to: "/dashboard",
                        replace: true,
                      }),
                    }),
                    _jsx(Route, {
                      path: "dashboard",
                      element: _jsx(Dashboard, {}),
                    }),
                    _jsx(Route, {
                      path: "wallet",
                      element: _jsx(WalletScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "wallet/transactions",
                      element: _jsx(TransactionHistory, {}),
                    }),
                    _jsx(Route, {
                      path: "wallet/send",
                      element: _jsx(SendMoney, {}),
                    }),
                    _jsx(Route, {
                      path: "wallet/receive",
                      element: _jsx(ReceiveMoney, {}),
                    }),
                    _jsx(Route, {
                      path: "cards",
                      element: _jsx(CardsScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "cards/:cardId",
                      element: _jsx(CardDetails, {}),
                    }),
                    _jsx(Route, {
                      path: "cards/issue",
                      element: _jsx(IssueCard, {}),
                    }),
                    _jsx(Route, {
                      path: "analytics",
                      element: _jsx(AnalyticsScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "financial-planning",
                      element: _jsx(AdvancedBudgetingScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "budgeting",
                      element: _jsx(AdvancedBudgetingScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "chat",
                      element: _jsx(ChatbotScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "alerts",
                      element: _jsx(FraudAlerts, {}),
                    }),
                    _jsx(Route, {
                      path: "fraud-detection",
                      element: _jsx(AIFraudDetectionScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "security",
                      element: _jsx(SecurityScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "security/advanced",
                      element: _jsx(EnhancedSecurityScreen, {}),
                    }),
                    _jsx(Route, {
                      path: "settings",
                      element: _jsx(SettingsScreen, {}),
                    }),
                  ],
                }),
                _jsx(Route, {
                  path: "*",
                  element: isAuthenticated
                    ? _jsx(Navigate, { to: "/dashboard", replace: true })
                    : _jsx(Navigate, { to: "/home", replace: true }),
                }),
              ],
            }),
            _jsx(Toaster, {
              position: "top-right",
              toastOptions: {
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              },
            }),
          ],
        }),
      }),
    }),
  });
}
export default App;
