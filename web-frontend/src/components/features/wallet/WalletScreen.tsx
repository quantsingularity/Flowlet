import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Send,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
  category?: string;
  status?: "completed" | "pending";
}

interface WalletScreenProps {
  balance?: number;
  recentTransactions?: Transaction[];
}

const WalletScreen: React.FC<WalletScreenProps> = ({
  balance = 12345.67,
  recentTransactions = [
    {
      id: "1",
      description: "Coffee Shop",
      amount: -4.5,
      type: "debit",
      date: "2025-01-14",
      category: "Food",
      status: "completed",
    },
    {
      id: "2",
      description: "Salary Deposit",
      amount: 4200.0,
      type: "credit",
      date: "2025-01-13",
      category: "Income",
      status: "completed",
    },
    {
      id: "3",
      description: "Online Purchase",
      amount: -75.0,
      type: "debit",
      date: "2025-01-12",
      category: "Shopping",
      status: "completed",
    },
    {
      id: "4",
      description: "Gas Station",
      amount: -45.2,
      type: "debit",
      date: "2025-01-11",
      category: "Transport",
      status: "pending",
    },
  ],
}) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const navigate = useNavigate();

  const accountNumber = "FL-4821-9034-7621";

  const copyAccountNumber = () => {
    navigator.clipboard
      .writeText(accountNumber)
      .then(() => {
        toast.success("Account number copied");
      })
      .catch(() => {
        toast.error("Could not copy to clipboard");
      });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your funds and transactions
        </p>
      </div>

      {/* Balance card */}
      <Card className="overflow-hidden border-0 bg-sidebar text-sidebar-foreground">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sidebar-foreground/60 text-xs font-medium uppercase tracking-widest mb-1">
                Total Balance
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold tabular-nums tracking-tight">
                  {balanceVisible
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(balance)
                    : "••••••"}
                </span>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                >
                  {balanceVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Badge className="bg-sidebar-accent text-sidebar-foreground border-0 text-xs">
              USD
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="text-sidebar-foreground/50 text-xs font-mono">
              {accountNumber}
            </span>
            <button
              onClick={copyAccountNumber}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate("/wallet/send")}
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
            <Button
              onClick={() => navigate("/wallet/receive")}
              variant="outline"
              className="border-sidebar-border text-sidebar-foreground bg-sidebar-accent hover:bg-sidebar-accent/80 gap-2"
            >
              <ArrowDownLeft className="h-4 w-4" />
              Receive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This month in</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  $4,200
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This month out</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">
                  $2,850
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => navigate("/wallet/transactions")}
            >
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {recentTransactions.map((tx) => {
              const isIncome = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      isIncome
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "bg-slate-100 dark:bg-slate-800",
                    )}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {tx.status === "pending" && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-3.5 px-1 py-0"
                        >
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground",
                    )}
                  >
                    {isIncome ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletScreen;
