import {
  AlertCircle,
  PiggyBank,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

const BUDGETS: Budget[] = [
  {
    id: "1",
    category: "Food & Dining",
    allocated: 600,
    spent: 487,
    color: "bg-orange-500",
  },
  {
    id: "2",
    category: "Transportation",
    allocated: 300,
    spent: 265,
    color: "bg-blue-500",
  },
  {
    id: "3",
    category: "Entertainment",
    allocated: 200,
    spent: 95,
    color: "bg-violet-500",
  },
  {
    id: "4",
    category: "Shopping",
    allocated: 400,
    spent: 512,
    color: "bg-pink-500",
  },
  {
    id: "5",
    category: "Utilities",
    allocated: 250,
    spent: 198,
    color: "bg-cyan-500",
  },
  {
    id: "6",
    category: "Health",
    allocated: 150,
    spent: 42,
    color: "bg-emerald-500",
  },
];

const SAVINGS_GOALS = [
  {
    id: "1",
    name: "Emergency Fund",
    target: 10000,
    saved: 6500,
    deadline: "Dec 2025",
    color: "bg-emerald-500",
  },
  {
    id: "2",
    name: "Vacation",
    target: 3000,
    saved: 1200,
    deadline: "Jun 2025",
    color: "bg-blue-500",
  },
  {
    id: "3",
    name: "New Laptop",
    target: 1500,
    saved: 1500,
    deadline: "Completed",
    color: "bg-violet-500",
  },
];

const BudgetCard: React.FC<{ budget: Budget }> = ({ budget }) => {
  const pct = Math.min((budget.spent / budget.allocated) * 100, 100);
  const over = budget.spent > budget.allocated;
  const remaining = budget.allocated - budget.spent;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", budget.color)} />
          <span className="text-sm font-medium">{budget.category}</span>
          {over && (
            <Badge
              variant="destructive"
              className="text-[10px] h-4 px-1.5 py-0"
            >
              Over
            </Badge>
          )}
        </div>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            over ? "text-destructive" : "text-muted-foreground",
          )}
        >
          ${budget.spent} / ${budget.allocated}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            over
              ? "bg-destructive"
              : pct > 80
                ? "bg-amber-500"
                : "bg-emerald-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={cn(
          "text-xs",
          over ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {over
          ? `$${Math.abs(remaining).toFixed(2)} over budget`
          : `$${remaining.toFixed(2)} remaining`}
      </p>
    </div>
  );
};

const SavingsGoalCard: React.FC<{ goal: (typeof SAVINGS_GOALS)[0] }> = ({
  goal,
}) => {
  const pct = Math.min((goal.saved / goal.target) * 100, 100);
  const completed = goal.saved >= goal.target;

  return (
    <Card className={cn("card-hover", completed && "border-emerald-500/30")}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-sm">{goal.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completed ? "🎉 Goal reached!" : `Due ${goal.deadline}`}
            </p>
          </div>
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              completed
                ? "bg-emerald-50 dark:bg-emerald-950/30"
                : "bg-primary/10",
            )}
          >
            {completed ? (
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PiggyBank className="h-4 w-4 text-primary" />
            )}
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              goal.color,
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold tabular-nums">
            ${goal.saved.toLocaleString()}
          </span>
          <span className="text-muted-foreground tabular-nums">
            of ${goal.target.toLocaleString()}
          </span>
          <Badge
            variant={completed ? "default" : "secondary"}
            className="text-[10px]"
          >
            {Math.round(pct)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const BudgetingScreen: React.FC = () => {
  const totalAllocated = BUDGETS.reduce((a, b) => a + b.allocated, 0);
  const totalSpent = BUDGETS.reduce((a, b) => a + b.spent, 0);
  const overBudget = BUDGETS.filter((b) => b.spent > b.allocated).length;
  const remaining = totalAllocated - totalSpent;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgeting</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your spending and savings goals
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Budget
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          {
            label: "Total Budget",
            value: `$${totalAllocated.toLocaleString()}`,
            icon: Target,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Total Spent",
            value: `$${totalSpent.toLocaleString()}`,
            icon: TrendingDown,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
          },
          {
            label: "Remaining",
            value: `$${Math.abs(remaining).toFixed(2)}`,
            icon: remaining >= 0 ? TrendingUp : AlertCircle,
            color: remaining >= 0 ? "text-emerald-600" : "text-destructive",
            bg:
              remaining >= 0
                ? "bg-emerald-50 dark:bg-emerald-950/30"
                : "bg-destructive/10",
          },
          {
            label: "Over Budget",
            value: `${overBudget} ${overBudget === 1 ? "category" : "categories"}`,
            icon: AlertCircle,
            color: overBudget > 0 ? "text-destructive" : "text-emerald-600",
            bg:
              overBudget > 0
                ? "bg-destructive/10"
                : "bg-emerald-50 dark:bg-emerald-950/30",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    bg,
                  )}
                >
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={cn("text-base font-bold tabular-nums", color)}>
                    {value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="budgets" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="budgets" className="text-xs">
            Monthly Budgets
          </TabsTrigger>
          <TabsTrigger value="goals" className="text-xs">
            Savings Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budgets">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">January 2025</CardTitle>
                  <CardDescription className="text-xs">
                    ${totalSpent.toFixed(2)} of ${totalAllocated.toFixed(2)}{" "}
                    spent
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Overall</p>
                  <p className="text-lg font-bold tabular-nums">
                    {Math.round((totalSpent / totalAllocated) * 100)}%
                  </p>
                </div>
              </div>
              <Progress
                value={(totalSpent / totalAllocated) * 100}
                className="h-2 mt-2"
              />
            </CardHeader>
            <CardContent className="space-y-5">
              {BUDGETS.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 mt-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Budget Category
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {SAVINGS_GOALS.map((goal) => (
                <SavingsGoalCard key={goal.id} goal={goal} />
              ))}
            </div>
            <Button variant="outline" className="w-full gap-1.5 mt-2">
              <Plus className="h-4 w-4" />
              Add Savings Goal
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetingScreen;
