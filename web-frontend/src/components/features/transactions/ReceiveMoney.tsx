import {
  Building,
  CheckCircle,
  Copy,
  Download,
  QrCode,
  Share2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  routingNumber: string;
  swiftCode: string;
  ibanNumber: string;
}

const DEFAULT_ACCOUNT: AccountDetails = {
  bankName: "Flowlet Bank",
  accountNumber: "1234 5678 9012 3456",
  accountName: "Demo User",
  routingNumber: "021000021",
  swiftCode: "FLOWLTXX",
  ibanNumber: "GB29 FLOW 6016 1331 9268 19",
};

const CopyField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Could not copy to clipboard"));
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          readOnly
          className="font-mono text-sm bg-muted/50 border-0"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 shrink-0"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
};

const QRCodePlaceholder: React.FC = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="w-48 h-48 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center gap-3">
      <QrCode className="h-12 w-12 text-muted-foreground/40" />
      <p className="text-xs text-muted-foreground text-center px-4">
        QR code appears here in production
      </p>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
        <Download className="h-3.5 w-3.5" />
        Save QR
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
    </div>
  </div>
);

const ReceiveMoney: React.FC<{ accountDetails?: AccountDetails }> = ({
  accountDetails = DEFAULT_ACCOUNT,
}) => {
  const [requestAmount, setRequestAmount] = useState("");

  const copyAll = () => {
    const text = `Bank: ${accountDetails.bankName}\nAccount: ${accountDetails.accountNumber}\nRouting: ${accountDetails.routingNumber}\nSWIFT: ${accountDetails.swiftCode}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("All account details copied");
      })
      .catch(() => toast.error("Could not copy"));
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Receive Money</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share your account details to receive funds
        </p>
      </div>

      {/* Account card */}
      <Card className="overflow-hidden border-0 bg-sidebar text-sidebar-foreground">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sidebar-foreground/60 text-xs uppercase tracking-widest">
                Account Holder
              </p>
              <p className="text-xl font-bold mt-1">
                {accountDetails.accountName}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sidebar-accent flex items-center justify-center">
              <Building className="h-5 w-5 text-sidebar-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sidebar-foreground/60 text-xs">
              {accountDetails.bankName}
            </p>
            <p className="font-mono text-lg tracking-wider">
              {accountDetails.accountNumber}
            </p>
          </div>
          <Badge className="mt-4 bg-sidebar-accent text-sidebar-foreground border-0 text-xs">
            USD Account
          </Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="details" className="text-xs">
            Account Details
          </TabsTrigger>
          <TabsTrigger value="qr" className="text-xs">
            QR Code
          </TabsTrigger>
          <TabsTrigger value="request" className="text-xs">
            Request Amount
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Bank Transfer Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 h-7"
                  onClick={copyAll}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopyField
                label="Account Name"
                value={accountDetails.accountName}
              />
              <CopyField
                label="Account Number"
                value={accountDetails.accountNumber}
              />
              <CopyField
                label="Routing Number (ACH / ABA)"
                value={accountDetails.routingNumber}
              />
              <CopyField
                label="SWIFT / BIC Code"
                value={accountDetails.swiftCode}
              />
              <CopyField label="IBAN" value={accountDetails.ibanNumber} />

              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <span className="font-semibold">Note:</span> International
                  wires typically take 1–3 business days. Domestic ACH transfers
                  settle the next business day.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr">
          <Card>
            <CardContent className="pt-8 pb-6 flex justify-center">
              <QRCodePlaceholder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Request a Specific Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="pl-7 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Note (optional)</Label>
                <Input placeholder="What's this payment for?" />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-1.5"
                  disabled={!requestAmount || Number(requestAmount) <= 0}
                >
                  <Share2 className="h-4 w-4" />
                  Generate Request Link
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  disabled={!requestAmount || Number(requestAmount) <= 0}
                >
                  <QrCode className="h-4 w-4" />
                  QR
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReceiveMoney;
