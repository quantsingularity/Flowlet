import {
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Plus,
  Settings,
  Smartphone,
  Unlock,
  Zap,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardData {
  id: string;
  cardNumber: string;
  cardType: "debit" | "credit" | "prepaid";
  cardBrand: "visa" | "mastercard" | "amex" | "discover";
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  status: "active" | "blocked" | "expired" | "inactive";
  isVirtual: boolean;
  balance?: number;
  creditLimit?: number;
  lastUsed?: string;
}

const SAMPLE_CARDS: CardData[] = [
  {
    id: "1",
    cardNumber: "**** **** **** 1234",
    cardType: "debit",
    cardBrand: "visa",
    holderName: "Demo User",
    expiryMonth: 12,
    expiryYear: 2028,
    status: "active",
    isVirtual: false,
    balance: 12345.67,
    lastUsed: "2025-01-14",
  },
  {
    id: "2",
    cardNumber: "**** **** **** 5678",
    cardType: "credit",
    cardBrand: "mastercard",
    holderName: "Demo User",
    expiryMonth: 8,
    expiryYear: 2027,
    status: "active",
    isVirtual: false,
    creditLimit: 5000,
    lastUsed: "2025-01-13",
  },
  {
    id: "3",
    cardNumber: "**** **** **** 9012",
    cardType: "credit",
    cardBrand: "amex",
    holderName: "Demo User",
    expiryMonth: 6,
    expiryYear: 2026,
    status: "blocked",
    isVirtual: true,
    creditLimit: 10000,
  },
];

const brandColors: Record<string, string> = {
  visa: "from-blue-600 to-blue-800",
  mastercard: "from-slate-700 to-slate-900",
  amex: "from-emerald-600 to-emerald-900",
  discover: "from-amber-500 to-orange-700",
};

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  expired: {
    label: "Expired",
    className: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
  inactive: {
    label: "Inactive",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
};

const VisualCard: React.FC<{
  card: CardData;
  revealed: boolean;
  onToggleReveal: () => void;
}> = ({ card, revealed, onToggleReveal }) => {
  const gradClass =
    brandColors[card.cardBrand] ?? "from-slate-700 to-slate-900";
  const cfg = statusConfig[card.status];

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 bg-gradient-to-br text-white overflow-hidden",
        gradClass,
        card.status === "blocked" && "opacity-75",
      )}
    >
      {/* Card brand pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-20 -translate-x-12" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest">
              {card.isVirtual ? "Virtual" : "Physical"} {card.cardType}
            </p>
            <Badge className={cn("mt-1 text-[10px] border", cfg.className)}>
              {cfg.label}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs capitalize font-medium">
              {card.cardBrand}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="font-mono text-lg tracking-wider">
            {revealed ? "4532 1234 5678 1234" : card.cardNumber}
          </p>
          <p className="text-white/60 text-xs">
            Expires {String(card.expiryMonth).padStart(2, "0")}/
            {String(card.expiryYear).slice(-2)}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-sm font-medium">{card.holderName}</p>
          {card.balance !== undefined && (
            <div className="text-right">
              <p className="text-white/60 text-[10px] uppercase tracking-wide">
                Balance
              </p>
              <p className="font-bold tabular-nums">
                {revealed
                  ? `$${card.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "••••••"}
              </p>
            </div>
          )}
          {card.creditLimit !== undefined && (
            <div className="text-right">
              <p className="text-white/60 text-[10px] uppercase tracking-wide">
                Limit
              </p>
              <p className="font-bold tabular-nums">
                ${card.creditLimit.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CardsScreen: React.FC<{ cards?: CardData[] }> = ({
  cards = SAMPLE_CARDS,
}) => {
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [cardStatuses, setCardStatuses] = useState<
    Map<string, CardData["status"]>
  >(new Map(cards.map((c) => [c.id, c.status])));
  const navigate = useNavigate();

  const toggleReveal = (id: string) => {
    setRevealedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBlock = (id: string) => {
    setCardStatuses((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      next.set(id, current === "blocked" ? "active" : "blocked");
      return next;
    });
    const current = cardStatuses.get(id);
    toast.success(current === "blocked" ? "Card unblocked" : "Card blocked");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cards</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your virtual and physical cards
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => navigate("/cards/issue")}
        >
          <Plus className="h-4 w-4" />
          Issue Card
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Cards",
            value: cards.length,
            icon: CreditCard,
            color: "text-primary bg-primary/10",
          },
          {
            label: "Active",
            value: cards.filter((c) => c.status === "active").length,
            icon: Zap,
            color:
              "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
          },
          {
            label: "Virtual",
            value: cards.filter((c) => c.isVirtual).length,
            icon: Globe,
            color:
              "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold tabular-nums">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards list */}
      <div className="space-y-5 stagger-children">
        {cards.map((card) => {
          const status = cardStatuses.get(card.id) ?? card.status;
          const effectiveCard = { ...card, status };
          const isRevealed = revealedCards.has(card.id);

          return (
            <Card key={card.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <VisualCard
                    card={effectiveCard}
                    revealed={isRevealed}
                    onToggleReveal={() => toggleReveal(card.id)}
                  />
                </div>

                <div className="px-5 pb-5 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => toggleReveal(card.id)}
                  >
                    {isRevealed ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {isRevealed ? "Hide" : "Reveal"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-1.5 text-xs",
                      status === "blocked" &&
                        "border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
                    )}
                    onClick={() => toggleBlock(card.id)}
                    disabled={status === "expired" || status === "inactive"}
                  >
                    {status === "blocked" ? (
                      <>
                        <Unlock className="h-3.5 w-3.5" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        Block
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => navigate(`/cards/${card.id}`)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Manage
                  </Button>
                  {card.isVirtual && (
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 ml-auto self-center"
                    >
                      <Smartphone className="h-3 w-3" />
                      Virtual
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CardsScreen;
