import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CreditCard,
  Info,
  Shield,
  Trash2,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NotifType = "transaction" | "security" | "alert" | "info" | "promotion";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Unusual Activity Detected",
    message:
      "A transaction of $284.50 was flagged from an unusual location (Dubai, UAE).",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "transaction",
    title: "Payment Received",
    message:
      "You received $4,200.00 from Employer Inc. Your balance has been updated.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "security",
    title: "New Login Detected",
    message: "A new login was detected from Chrome on macOS in New York, US.",
    time: "1 day ago",
    read: false,
  },
  {
    id: "4",
    type: "transaction",
    title: "Transfer Completed",
    message:
      "Your transfer of $150.00 to John Smith was completed successfully.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "KYC Verification Complete",
    message:
      "Your identity has been verified. You now have full access to all features.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "6",
    type: "promotion",
    title: "New Feature: AI Budgeting",
    message: "Try our new AI-powered budgeting tool to optimize your spending.",
    time: "1 week ago",
    read: true,
  },
];

const typeConfig: Record<
  NotifType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  transaction: {
    icon: CreditCard,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  security: {
    icon: Shield,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  info: {
    icon: Info,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  promotion: {
    icon: TrendingUp,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification dismissed");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated with your account activity
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={markAllRead}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={clearAll}
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors",
              filter === f
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((notif) => {
                const cfg = typeConfig[notif.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-4 px-5 py-4 transition-colors",
                      !notif.read && "bg-primary/[0.02]",
                    )}
                    onClick={() => !notif.read && markRead(notif.id)}
                    role={!notif.read ? "button" : undefined}
                    tabIndex={!notif.read ? 0 : undefined}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        cfg.bg,
                      )}
                    >
                      <Icon className={cn("h-4 w-4", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            !notif.read && "text-foreground",
                          )}
                        >
                          {notif.title}
                          {!notif.read && (
                            <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                    <button
                      className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(notif.id);
                      }}
                      aria-label="Dismiss notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification preferences hint */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage which notifications you receive in{" "}
            <a href="/settings" className="text-primary hover:underline">
              Settings → Notifications
            </a>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default NotificationsPage;
