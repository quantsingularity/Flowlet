import { Download, Filter, Search, X } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: "completed" | "pending" | "failed";
  category?: string;
}

const SAMPLE: Transaction[] = [
  {
    id: "1",
    date: "2025-01-14",
    description: "Coffee Shop",
    amount: -4.5,
    type: "debit",
    status: "completed",
    category: "Food & Dining",
  },
  {
    id: "2",
    date: "2025-01-13",
    description: "Salary Deposit",
    amount: 4200.0,
    type: "credit",
    status: "completed",
    category: "Income",
  },
  {
    id: "3",
    date: "2025-01-12",
    description: "Netflix Subscription",
    amount: -15.99,
    type: "debit",
    status: "completed",
    category: "Entertainment",
  },
  {
    id: "4",
    date: "2025-01-11",
    description: "Gas Station",
    amount: -45.2,
    type: "debit",
    status: "pending",
    category: "Transportation",
  },
  {
    id: "5",
    date: "2025-01-10",
    description: "Freelance Payment",
    amount: 850.0,
    type: "credit",
    status: "completed",
    category: "Income",
  },
  {
    id: "6",
    date: "2025-01-09",
    description: "Grocery Store",
    amount: -92.4,
    type: "debit",
    status: "completed",
    category: "Food & Dining",
  },
  {
    id: "7",
    date: "2025-01-08",
    description: "Electricity Bill",
    amount: -128.0,
    type: "debit",
    status: "failed",
    category: "Utilities",
  },
  {
    id: "8",
    date: "2025-01-07",
    description: "Online Purchase",
    amount: -65.0,
    type: "debit",
    status: "completed",
    category: "Shopping",
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  },
};

const TransactionHistory: React.FC<{ transactions?: Transaction[] }> = ({
  transactions = SAMPLE,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        searchTerm === "" ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);
      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;
      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const hasFilters =
    searchTerm || statusFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const downloadCSV = () => {
    const rows = [
      ["Date", "Description", "Amount", "Type", "Status", "Category"],
      ...filtered.map((tx) => [
        tx.date,
        tx.description,
        tx.amount.toString(),
        tx.type,
        tx.status,
        tx.category ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={downloadCSV}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-full sm:w-36 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-full sm:w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No transactions found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((tx) => {
                const isIncome = tx.type === "credit";
                const cfg = statusConfig[tx.status];
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                        isIncome
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                      )}
                    >
                      {isIncome ? "+" : "−"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {tx.description}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] h-4 px-1.5 border-0 shrink-0",
                            cfg.className,
                          )}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {tx.category && (
                          <>
                            <span className="text-muted-foreground/40 text-xs">
                              ·
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {tx.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums shrink-0",
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
