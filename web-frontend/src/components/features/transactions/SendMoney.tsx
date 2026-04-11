import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Loader2,
  Send,
  Shield,
  User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// BUG FIX: amount uses z.coerce.number() so string input from <input> is properly cast
const sendMoneySchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount" })
    .min(0.01, "Amount must be greater than $0.00")
    .max(10000, "Amount cannot exceed $10,000"),
  currency: z.string().min(1, "Currency is required"),
  notes: z.string().max(200, "Notes must be under 200 characters").optional(),
});

type SendMoneyFormData = z.infer<typeof sendMoneySchema>;

interface SendMoneyProps {
  onSendMoney?: (data: SendMoneyFormData) => Promise<void>;
  availableBalance?: number;
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

const SendMoney: React.FC<SendMoneyProps> = ({
  onSendMoney,
  availableBalance = 12345.67,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<SendMoneyFormData | null>(
    null,
  );
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<SendMoneyFormData>({
    resolver: zodResolver(sendMoneySchema),
    mode: "onChange",
    defaultValues: { currency: "USD" },
  });

  const watchedAmount = watch("amount");
  const watchedRecipient = watch("recipient");
  const watchedCurrency = watch("currency");
  const selectedCurrency =
    CURRENCIES.find((c) => c.code === watchedCurrency) ?? CURRENCIES[0];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: watchedCurrency || "USD",
    }).format(amount);

  const fee = watchedAmount ? Math.min(watchedAmount * 0.005, 5) : 0;
  const total = watchedAmount ? watchedAmount + fee : 0;
  const insufficientFunds = total > availableBalance;

  const onSubmit = (data: SendMoneyFormData) => {
    if (insufficientFunds) {
      toast.error("Insufficient balance");
      return;
    }
    setPendingData(data);
    setShowConfirmation(true);
  };

  const confirmSend = async () => {
    if (!pendingData) return;
    setIsLoading(true);
    try {
      if (onSendMoney) {
        await onSendMoney(pendingData);
      } else {
        await new Promise((r) => setTimeout(r, 1500));
      }
      setSuccess(true);
    } catch (err) {
      toast.error("Transfer failed. Please try again.");
      setShowConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card>
          <CardContent className="pt-12 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Transfer Sent!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {formatCurrency(pendingData?.amount ?? 0)} has been sent to{" "}
                <span className="font-medium text-foreground">
                  {pendingData?.recipient}
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {formatCurrency(pendingData?.amount ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold">Total deducted</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSuccess(false);
                  setShowConfirmation(false);
                  setPendingData(null);
                }}
              >
                Send Again
              </Button>
              <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Send Money</h1>
          <p className="text-xs text-muted-foreground">
            Available: {formatCurrency(availableBalance)}
          </p>
        </div>
      </div>

      {showConfirmation && pendingData ? (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Confirm Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-semibold">{pendingData.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {formatCurrency(pendingData.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network fee</span>
                <span className="font-semibold">{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="font-bold">Total</span>
                <span className="font-bold text-base">
                  {formatCurrency(total)}
                </span>
              </div>
              {pendingData.notes && (
                <div className="border-t border-border pt-3">
                  <span className="text-muted-foreground">Note: </span>
                  <span>{pendingData.notes}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
              >
                Edit
              </Button>
              <Button
                className="flex-1"
                onClick={confirmSend}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Sending..." : "Confirm & Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="recipient">
                  <User className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                  Recipient
                </Label>
                <Input
                  id="recipient"
                  placeholder="Email, phone, or account number"
                  {...register("recipient")}
                  className={errors.recipient ? "border-destructive" : ""}
                />
                {errors.recipient && (
                  <p className="text-xs text-destructive">
                    {errors.recipient.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">
                  <DollarSign className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                  Amount
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={watchedCurrency}
                    onValueChange={(v) => setValue("currency", v)}
                  >
                    <SelectTrigger className="w-28 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...register("amount")}
                      className={cn(
                        "pl-7",
                        errors.amount ? "border-destructive" : "",
                      )}
                    />
                  </div>
                </div>
                {errors.amount && (
                  <p className="text-xs text-destructive">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {watchedAmount > 0 && (
                <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs animate-fade-in">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Amount</span>
                    <span>{formatCurrency(watchedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee (0.5%, max $5)</span>
                    <span>{formatCurrency(fee)}</span>
                  </div>
                  <div
                    className={cn(
                      "flex justify-between font-semibold border-t border-border pt-1.5",
                      insufficientFunds ? "text-destructive" : "",
                    )}
                  >
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {insufficientFunds && (
                    <p className="text-destructive font-medium">
                      Insufficient funds
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes">Note (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="What's this for?"
                  rows={2}
                  {...register("notes")}
                  className={
                    errors.notes
                      ? "border-destructive resize-none"
                      : "resize-none"
                  }
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">
                    {errors.notes.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || insufficientFunds}
              >
                <Send className="mr-2 h-4 w-4" />
                Review & Send
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SendMoney;
