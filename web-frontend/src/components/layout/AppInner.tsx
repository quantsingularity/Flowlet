import type React from "react";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";

import LoginScreen from "@/src/components/auth/LoginScreen";
import RegisterScreen from "@/src/components/auth/RegisterScreen";
import OnboardingFlow from "@/src/components/auth/OnboardingFlow";
import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import PublicRoute from "@/src/components/auth/PublicRoute";
import Layout from "@/src/components/layout/Layout";
import LoadingScreen from "@/src/components/layout/LoadingScreen";
import OfflineIndicator from "@/src/components/layout/OfflineIndicator";
import ForgotPasswordScreen from "@/src/components/pages/public/ForgotPasswordScreen";
import HomePage from "@/src/components/pages/public/HomePage";
import PaymentsPage from "@/src/components/pages/public/PaymentsPage";
import CompliancePage from "@/src/components/pages/public/CompliancePage";
import DeveloperPortalPage from "@/src/components/pages/public/DeveloperPortalPage";

import Dashboard from "@/src/components/features/dashboard/Dashboard";
import WalletScreen from "@/src/components/features/wallet/WalletScreen";
import CardsScreen from "@/src/components/features/cards/CardsScreen";
import CardDetails from "@/src/components/features/cards/CardDetails";
import IssueCard from "@/src/components/features/cards/IssueCard";
import TransactionHistory from "@/src/components/features/transactions/TransactionHistory";
import SendMoney from "@/src/components/features/transactions/SendMoney";
import ReceiveMoney from "@/src/components/features/transactions/ReceiveMoney";
import AnalyticsScreen from "@/src/components/features/analytics/AnalyticsScreen";
import BudgetingScreen from "@/src/components/features/budgeting/BudgetingScreen";
import ChatbotScreen from "@/src/components/features/ai/ChatbotScreen";
import FraudAlerts from "@/src/components/features/ai/FraudAlerts";
import AIFraudDetectionScreen from "@/src/components/features/ai/AIFraudDetectionScreen";
import SecurityScreen from "@/src/components/features/security/SecurityScreen";
import EnhancedSecurityScreen from "@/src/components/features/security/EnhancedSecurityScreen";
import SettingsScreen from "@/src/components/features/settings/SettingsScreen";

import { useOnlineStatus, useResponsive } from "@/src/hooks";
import { useAuth } from "@/src/hooks/useAuth";
import { useAppSelector } from "@/src/hooks/redux";

const AppInner: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { isMobile } = useResponsive();
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (theme !== "system") return;
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("flowlet_theme", theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        {!isOnline && <OfflineIndicator />}

        <Routes>
          {/* Public marketing pages */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/developer" element={<DeveloperPortalPage />} />

          {/* Auth routes — redirect to dashboard if already logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginScreen />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterScreen />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <PublicRoute>
                <OnboardingFlow />
              </PublicRoute>
            }
          />
          {/* BUG FIX: /forgot-password was linked in LoginScreen but had no route */}
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordScreen />
              </PublicRoute>
            }
          />

          {/* Protected app routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout isMobile={isMobile} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="wallet" element={<WalletScreen />} />
            <Route
              path="wallet/transactions"
              element={<TransactionHistory />}
            />
            <Route path="wallet/send" element={<SendMoney />} />
            <Route path="wallet/receive" element={<ReceiveMoney />} />

            {/* Specific card routes must come before parameterised :cardId */}
            <Route path="cards" element={<CardsScreen />} />
            <Route path="cards/issue" element={<IssueCard />} />
            <Route path="cards/:cardId" element={<CardDetails />} />

            <Route path="analytics" element={<AnalyticsScreen />} />
            <Route path="financial-planning" element={<BudgetingScreen />} />
            <Route path="budgeting" element={<BudgetingScreen />} />

            <Route path="chat" element={<ChatbotScreen />} />
            <Route path="alerts" element={<FraudAlerts />} />
            <Route
              path="fraud-detection"
              element={<AIFraudDetectionScreen />}
            />

            <Route path="security" element={<SecurityScreen />} />
            <Route
              path="security/advanced"
              element={<EnhancedSecurityScreen />}
            />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>

          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            }
          />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              fontSize: "13px",
            },
          }}
        />
      </Router>
    </div>
  );
};

export default AppInner;
