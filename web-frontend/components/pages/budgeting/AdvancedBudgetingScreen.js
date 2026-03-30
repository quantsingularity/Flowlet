import { DollarSign, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
export default function AdvancedBudgetingScreen() {
  const [budgets] = useState([
    { category: "Groceries", budget: 500, spent: 350, icon: "🛒" },
    { category: "Transportation", budget: 300, spent: 280, icon: "🚗" },
    { category: "Entertainment", budget: 200, spent: 150, icon: "🎬" },
    { category: "Utilities", budget: 400, spent: 400, icon: "⚡" },
    { category: "Dining Out", budget: 250, spent: 180, icon: "🍽️" },
  ]);
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  return _jsxs("div", {
    className: "container mx-auto p-6",
    children: [
      _jsxs("div", {
        className: "mb-8",
        children: [
          _jsx("h1", {
            className: "text-3xl font-bold mb-2",
            children: "Budget Planning",
          }),
          _jsx("p", {
            className: "text-muted-foreground",
            children: "Track and manage your spending across categories",
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-4 md:grid-cols-3 mb-8",
        children: [
          _jsxs(Card, {
            children: [
              _jsxs(CardHeader, {
                className:
                  "flex flex-row items-center justify-between space-y-0 pb-2",
                children: [
                  _jsx(CardTitle, {
                    className: "text-sm font-medium",
                    children: "Total Budget",
                  }),
                  _jsx(DollarSign, {
                    className: "h-4 w-4 text-muted-foreground",
                  }),
                ],
              }),
              _jsxs(CardContent, {
                children: [
                  _jsxs("div", {
                    className: "text-2xl font-bold",
                    children: ["$", totalBudget.toFixed(2)],
                  }),
                  _jsx("p", {
                    className: "text-xs text-muted-foreground",
                    children: "Monthly allocation",
                  }),
                ],
              }),
            ],
          }),
          _jsxs(Card, {
            children: [
              _jsxs(CardHeader, {
                className:
                  "flex flex-row items-center justify-between space-y-0 pb-2",
                children: [
                  _jsx(CardTitle, {
                    className: "text-sm font-medium",
                    children: "Total Spent",
                  }),
                  _jsx(TrendingUp, {
                    className: "h-4 w-4 text-muted-foreground",
                  }),
                ],
              }),
              _jsxs(CardContent, {
                children: [
                  _jsxs("div", {
                    className: "text-2xl font-bold",
                    children: ["$", totalSpent.toFixed(2)],
                  }),
                  _jsxs("p", {
                    className: "text-xs text-muted-foreground",
                    children: [
                      ((totalSpent / totalBudget) * 100).toFixed(1),
                      "% of budget",
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsxs(Card, {
            children: [
              _jsxs(CardHeader, {
                className:
                  "flex flex-row items-center justify-between space-y-0 pb-2",
                children: [
                  _jsx(CardTitle, {
                    className: "text-sm font-medium",
                    children: "Remaining",
                  }),
                  _jsx(TrendingDown, {
                    className: "h-4 w-4 text-muted-foreground",
                  }),
                ],
              }),
              _jsxs(CardContent, {
                children: [
                  _jsxs("div", {
                    className: "text-2xl font-bold text-green-600",
                    children: ["$", remaining.toFixed(2)],
                  }),
                  _jsxs("p", {
                    className: "text-xs text-muted-foreground",
                    children: [
                      ((remaining / totalBudget) * 100).toFixed(1),
                      "% left",
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs(Card, {
        className: "mb-6",
        children: [
          _jsxs(CardHeader, {
            children: [
              _jsx(CardTitle, { children: "Budget Categories" }),
              _jsx(CardDescription, { children: "Track spending by category" }),
            ],
          }),
          _jsx(CardContent, {
            className: "space-y-6",
            children: budgets.map((budget) => {
              const percentage = (budget.spent / budget.budget) * 100;
              const isOverBudget = percentage > 100;
              return _jsxs(
                "div",
                {
                  className: "space-y-2",
                  children: [
                    _jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx("span", {
                              className: "text-2xl",
                              children: budget.icon,
                            }),
                            _jsxs("div", {
                              children: [
                                _jsx("p", {
                                  className: "font-medium",
                                  children: budget.category,
                                }),
                                _jsxs("p", {
                                  className: "text-sm text-muted-foreground",
                                  children: [
                                    "$",
                                    budget.spent.toFixed(2),
                                    " of $",
                                    budget.budget.toFixed(2),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        _jsxs(Badge, {
                          variant: isOverBudget
                            ? "destructive"
                            : percentage > 80
                              ? "warning"
                              : "success",
                          children: [percentage.toFixed(0), "%"],
                        }),
                      ],
                    }),
                    _jsx(Progress, {
                      value: Math.min(percentage, 100),
                      className: isOverBudget ? "bg-destructive/20" : "",
                    }),
                  ],
                },
                budget.category,
              );
            }),
          }),
        ],
      }),
      _jsxs("div", {
        className: "flex gap-4",
        children: [
          _jsxs(Button, {
            className: "flex-1",
            children: [
              _jsx(PieChart, { className: "mr-2 h-4 w-4" }),
              "View Insights",
            ],
          }),
          _jsx(Button, {
            variant: "outline",
            className: "flex-1",
            children: "Add Category",
          }),
        ],
      }),
    ],
  });
}
