import {
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronRight,
  CreditCard,
  GitBranch,
  Home,
  MessageSquare,
  PiggyBank,
  Settings,
  Shield,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    items: [{ icon: Home, label: "Dashboard", path: "/dashboard" }],
  },
  {
    title: "Finance",
    items: [
      { icon: Wallet, label: "Wallet", path: "/wallet" },
      { icon: CreditCard, label: "Cards", path: "/cards" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: PiggyBank, label: "Budgeting", path: "/budgeting" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { icon: MessageSquare, label: "AI Assistant", path: "/chat" },
      {
        icon: AlertTriangle,
        label: "Fraud Alerts",
        path: "/alerts",
        badge: "3",
        badgeVariant: "destructive",
      },
      { icon: Bot, label: "Fraud Detection", path: "/fraud-detection" },
    ],
  },
  {
    title: "Automation",
    items: [{ icon: GitBranch, label: "Workflows", path: "/workflows" }],
  },
  {
    title: "System",
    items: [
      { icon: Shield, label: "Security", path: "/security" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
  },
];

const SidebarContent: React.FC<{
  location: ReturnType<typeof useLocation>;
  onItemClick?: () => void;
}> = ({ location, onItemClick }) => (
  <ScrollArea className="flex-1">
    <nav className="px-3 py-4 space-y-6">
      {navigation.map((group, groupIdx) => (
        <div key={groupIdx}>
          {group.title && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/dashboard" &&
                  location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant ?? "secondary"}
                      className="text-[10px] h-4 px-1.5 min-w-4 justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && !item.badge && (
                    <ChevronRight className="h-3 w-3 text-sidebar-primary opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  </ScrollArea>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-72 bg-sidebar flex flex-col transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="text-sidebar-foreground font-semibold text-base tracking-tight">
                Flowlet
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent location={location} onItemClick={onClose} />
          <div className="p-3 border-t border-sidebar-border shrink-0">
            <p className="text-sidebar-foreground/25 text-[10px] text-center">
              Flowlet v2.0 · Embedded Finance
            </p>
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 h-full bg-sidebar flex flex-col transition-all duration-300 ease-out",
        isOpen ? "w-64" : "w-0 overflow-hidden",
      )}
    >
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-sidebar-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sidebar-foreground font-semibold text-base tracking-tight whitespace-nowrap">
          Flowlet
        </span>
      </div>
      <SidebarContent location={location} />
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <p className="text-sidebar-foreground/25 text-[10px] text-center whitespace-nowrap">
          Flowlet v2.0 · Embedded Finance
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
