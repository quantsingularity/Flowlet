import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WalletSummaryProps } from "@/types/wallet";

const QuickStatCard: React.FC<{
  stat: WalletSummaryProps["quickStats"][0];
}> = ({ stat }) => {
  const isUp = stat.trend === "up";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        {isUp ? (
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <p
          className={`text-xs ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
        >
          {stat.change} from last month
        </p>
      </CardContent>
    </Card>
  );
};

const WalletSummary: React.FC<WalletSummaryProps> = ({ quickStats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {quickStats.map((stat) => (
        <QuickStatCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
};

export default WalletSummary;
