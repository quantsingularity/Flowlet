import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TransactionListProps } from "@/src/types/wallet";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  Food: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
  Income: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  Utilities: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  Transport: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  Shopping: "bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400",
  Health: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

const TransactionItem: React.FC<{
  transaction: TransactionListProps["transactions"][0];
}> = ({ transaction }) => {
  const isIncome = transaction.amount > 0;

  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
        isIncome
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "bg-slate-100 dark:bg-slate-800",
      )}>
        {isIncome ? (
          <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{transaction.description}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
          {transaction.category && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 font-medium border-0",
                  categoryColors[transaction.category] ?? "bg-muted text-muted-foreground",
                )}
              >
                {transaction.category}
              </Badge>
            </>
          )}
        </div>
      </div>

      <span className={cn(
        "text-sm font-semibold tabular-nums shrink-0",
        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
      )}>
        {isIncome ? "+" : "−"}${Math.abs(transaction.amount).toFixed(2)}
      </span>
    </div>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription className="text-xs mt-0.5">Your latest financial activity</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 h-7 px-2"
            onClick={() => navigate("/wallet/transactions")}
          >
            View all
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No recent transactions</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default TransactionList;
