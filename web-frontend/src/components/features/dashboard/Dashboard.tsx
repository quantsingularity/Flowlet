import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Loader2,
  Plus,
  Send,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/src/hooks/useAuth";
import { fetchWalletData } from "@/src/services/walletService";
import type { DashboardState } from "@/src/types/wallet";
import TransactionList from "./TransactionList";

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  color: string;
}> = ({ title, value, change, trend, icon: Icon, color }) => (
  <Card className="card-hover overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {change} vs last month
            </span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "Send Money", icon: Send, path: "/wallet/send", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Receive", icon: ArrowDownRight, path: "/wallet/receive", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Cards", icon: CreditCard, path: "/cards", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Add Funds", icon: Plus, path: "/wallet", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.firstName || user?.fullName?.split(" ")[0] || "there";

  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const walletData = await fetchWalletData();
        if (isMounted) setState({ data: walletData, isLoading: false, error: null });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load data";
        if (isMounted) setState({ data: null, isLoading: false, error: errorMessage });
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const { data, isLoading, error } = state;

  const iconMap: Record<string, React.ElementType> = {
    "Total Balance": Wallet,
    "Monthly Income": ArrowUpRight,
    "Monthly Expenses": ArrowDownRight,
    "Savings Rate": TrendingUp,
  };

  const colorMap: Record<string, string> = {
    "Total Balance": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "Monthly Income": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "Monthly Expenses": "bg-red-500/10 text-red-600 dark:text-red-400",
    "Savings Rate": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-destructive text-xl">!</span>
        </div>
        <div>
          <p className="font-semibold text-destructive">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getTimeOfDay()},{" "}
            <span className="gradient-text">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/wallet/receive")}>
            <ArrowDownRight className="h-4 w-4 mr-1.5" />
            Receive
          </Button>
          <Button size="sm" onClick={() => navigate("/wallet/send")}>
            <Send className="h-4 w-4 mr-1.5" />
            Send
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {data.quickStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={iconMap[stat.title] ?? Wallet}
            color={colorMap[stat.title] ?? "bg-primary/10 text-primary"}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionList transactions={data.recentTransactions} />
        </div>
        <div className="space-y-4">
          <QuickActions />
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Security Status</p>
                <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
                  Secure
                </Badge>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "2FA Authentication", status: true },
                  { label: "Last login", status: true, value: "Just now" },
                  { label: "Active sessions", status: true, value: "1 device" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={item.value ? "font-medium" : "text-emerald-600 dark:text-emerald-400 font-medium"}>
                      {item.value ?? "Enabled"}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4 text-xs"
                onClick={() => navigate("/security")}
              >
                View Security Settings
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default Dashboard;
