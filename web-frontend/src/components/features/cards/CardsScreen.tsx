import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Unlock,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchCards, toggleCardStatus } from "@/store/walletSlice";
import { cn } from "@/lib/utils";

type CardType = "debit" | "credit" | "prepaid";
const cardGradients: Record<CardType, string> = {
  debit: "from-[hsl(250,73%,34%)] via-[hsl(258,65%,26%)] to-[hsl(222,47%,12%)]",
  credit: "from-[hsl(222,47%,18%)] via-[hsl(230,40%,14%)] to-[hsl(222,47%,8%)]",
  prepaid:
    "from-[hsl(38,78%,34%)]  via-[hsl(30,65%,26%)]  to-[hsl(222,47%,12%)]",
};

interface CardItem {
  id: string;
  card_number_masked: string;
  card_type: CardType;
  status: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  daily_limit: number;
  monthly_limit: number;
  contactless_enabled: boolean;
  online_enabled: boolean;
  international_enabled: boolean;
  created_at: string;
}

const CardVisual: React.FC<{
  card: CardItem;
  active: boolean;
  onClick: () => void;
}> = ({ card, active, onClick }) => {
  const [showNum, setShowNum] = useState(false);
  const grad = cardGradients[card.card_type] ?? cardGradients.debit;
  const isBlocked = card.status === "blocked" || card.status === "frozen";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full rounded-2xl bg-gradient-to-br p-5 text-left transition-all",
        grad,
        active
          ? "ring-2 ring-white/30 shadow-2xl scale-[1.01]"
          : "opacity-75 hover:opacity-95",
        isBlocked &&
          "after:absolute after:inset-0 after:rounded-2xl after:bg-black/40 after:backdrop-blur-[1px]",
      )}
    >
      {isBlocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl">
          <div className="bg-black/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Blocked
            </span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-white/55 uppercase tracking-widest">
            {card.card_type}
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">Flowlet</p>
        </div>
        <Wifi className="h-5 w-5 text-white/40 rotate-90" />
      </div>

      <div className="mb-5 flex items-center gap-2">
        <p className="font-mono text-base text-white/80 tracking-[0.2em]">
          {showNum
            ? card.card_number_masked
            : "•••• •••• •••• " + card.card_number_masked.slice(-4)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowNum((v) => !v);
          }}
          className="text-white/40 hover:text-white/80 transition-colors relative z-20"
        >
          {showNum ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-white/45 mb-0.5 uppercase tracking-wider">
            Card Holder
          </p>
          <p className="text-sm font-medium text-white">
            {card.cardholder_name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/45 mb-0.5 uppercase tracking-wider">
            Expires
          </p>
          <p className="text-sm font-medium text-white">
            {String(card.expiry_month).padStart(2, "0")}/
            {String(card.expiry_year).slice(-2)}
          </p>
        </div>
      </div>
    </button>
  );
};

const CardSettings: React.FC<{ card: CardItem }> = ({ card }) => {
  const dispatch = useAppDispatch();
  const isBlocked = card.status === "blocked" || card.status === "frozen";

  const handleToggleBlock = async () => {
    try {
      await dispatch(
        toggleCardStatus({
          cardId: card.id,
          action: isBlocked ? "unblock" : "block",
        }),
      ).unwrap();
      toast.success(isBlocked ? "Card unblocked" : "Card blocked");
    } catch {
      toast.error("Failed to update card status");
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <div className="space-y-4">
      {/* Block/unblock */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Card Control</p>
            </div>
            <Badge
              className={cn(
                "border-0 text-xs",
                card.status === "active"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              )}
            >
              {card.status}
            </Badge>
          </div>
          <Button
            variant={isBlocked ? "default" : "destructive"}
            size="sm"
            className={cn(
              "w-full",
              !isBlocked && "bg-red-600 hover:bg-red-700",
            )}
            onClick={handleToggleBlock}
          >
            {isBlocked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" /> Unblock Card
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" /> Block Card
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium mb-3">Spending Limits</p>
          <div className="space-y-2.5">
            {[
              { label: "Daily limit", value: fmt(card.daily_limit) },
              { label: "Monthly limit", value: fmt(card.monthly_limit) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium mb-3">Permissions</p>
          <div className="space-y-3.5">
            {[
              {
                id: "contactless",
                label: "Contactless",
                value: card.contactless_enabled,
              },
              {
                id: "online",
                label: "Online Payments",
                value: card.online_enabled,
              },
              {
                id: "intl",
                label: "International",
                value: card.international_enabled,
              },
            ].map(({ id, label, value }) => (
              <div key={id} className="flex items-center justify-between">
                <Label htmlFor={id} className="text-xs cursor-pointer">
                  {label}
                </Label>
                <Switch id={id} checked={value} disabled />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CardsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cards, isLoading } = useAppSelector((s) => s.wallet);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    dispatch(fetchCards());
  }, [dispatch]);

  const active = cards[activeIdx];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your payment cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchCards())}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button
            size="sm"
            className="bg-gradient-brand hover:opacity-90"
            onClick={() => navigate("/cards/issue")}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Issue Card
          </Button>
        </div>
      </div>

      {isLoading && cards.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No cards yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Issue your first virtual or physical card to start making
              payments.
            </p>
            <Button
              size="sm"
              className="mt-2 bg-gradient-brand hover:opacity-90"
              onClick={() => navigate("/cards/issue")}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Issue a Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card visuals */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((card, i) => (
                <CardVisual
                  key={card.id}
                  card={card as CardItem}
                  active={i === activeIdx}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
            </div>
            {active && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Card Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { label: "Type", value: active.card_type },
                      { label: "Status", value: active.status },
                      {
                        label: "Issued",
                        value: new Date(active.created_at).toLocaleDateString(),
                      },
                      {
                        label: "Expires",
                        value: `${String(active.expiry_month).padStart(2, "0")}/${active.expiry_year}`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-medium capitalize mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings sidebar */}
          {active && <CardSettings card={active as CardItem} />}
        </div>
      )}
    </div>
  );
};

export default CardsScreen;
