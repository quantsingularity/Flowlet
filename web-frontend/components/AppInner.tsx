import type React from "react";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import LoginScreen from "@/components/auth/LoginScreen";
import OnboardingFlow from "@/components/auth/OnboardingFlow";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import RegisterScreen from "@/components/auth/RegisterScreen";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import OfflineIndicator from "@/components/OfflineIndicator";
import AIFraudDetectionScreen from "@/components/pages/ai/AIFraudDetectionScreen";
import ChatbotScreen from "@/components/pages/ai/ChatbotScreen";
import FraudAlerts from "@/components/pages/ai/FraudAlerts";
import AnalyticsScreen from "@/components/pages/analytics/AnalyticsScreen";
import AdvancedBudgetingScreen from "@/components/pages/budgeting/AdvancedBudgetingScreen";
import CompliancePage from "@/components/pages/CompliancePage";
import CardDetails from "@/components/pages/cards/CardDetails";
import CardsScreen from "@/components/pages/cards/CardsScreen";
import IssueCard from "@/components/pages/cards/IssueCard";
import DeveloperPortalPage from "@/components/pages/DeveloperPortalPage";
import HomePage from "@/components/pages/HomePage";
import PaymentsPage from "@/components/pages/PaymentsPage";
import EnhancedSecurityScreen from "@/components/pages/security/EnhancedSecurityScreen";
import SecurityScreen from "@/components/pages/security/SecurityScreen";
import SettingsScreen from "@/components/pages/settings/SettingsScreen";
import ReceiveMoney from "@/components/pages/transactions/ReceiveMoney";
import SendMoney from "@/components/pages/transactions/SendMoney";
import TransactionHistory from "@/components/pages/transactions/TransactionHistory";
import WalletScreen from "@/components/pages/wallet/WalletScreen";
import Dashboard from "@/components/wallet/Dashboard";
import { useOnlineStatus, useResponsive } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/hooks/redux";

const AppInner: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { isMobile } = useResponsive();
  const theme = useAppSelector((state) => state.ui.theme);

  // Apply theme class to document root whenever Redux theme state changes
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

  // Persist theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("flowlet_theme", theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        {!isOnline && <OfflineIndicator />}

        <Routes>
          {/* Public Routes */}
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

          {/* Public web pages */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/developer" element={<DeveloperPortalPage />} />

          {/* Protected Routes */}
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

            {/* Specific routes must come before parameterised :cardId */}
            <Route path="cards" element={<CardsScreen />} />
            <Route path="cards/issue" element={<IssueCard />} />
            <Route path="cards/:cardId" element={<CardDetails />} />

            <Route path="analytics" element={<AnalyticsScreen />} />
            <Route
              path="financial-planning"
              element={<AdvancedBudgetingScreen />}
            />
            <Route path="budgeting" element={<AdvancedBudgetingScreen />} />

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

          {/* Catch all */}
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
            },
          }}
        />
      </Router>
    </div>
  );
};

export default AppInner;
