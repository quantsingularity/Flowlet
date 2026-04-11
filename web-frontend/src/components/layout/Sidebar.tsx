import {
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronRight,
  CreditCard,
  Home,
  MessageSquare,
  PiggyBank,
  Settings,
  Shield,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
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
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-150",
                      isActive ? "" : "group-hover:scale-110",
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant ?? "secondary"}
                      className="h-4 px-1.5 text-[10px] font-bold min-w-[16px] flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-sidebar flex flex-col z-50 transform transition-transform duration-300 ease-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-sm">
                  F
                </span>
              </div>
              <span className="text-sidebar-foreground font-semibold text-lg tracking-tight">
                Flowlet
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent location={location} onItemClick={onClose} />
          <SidebarFooter />
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-sidebar flex flex-col transform transition-transform duration-300 ease-out z-30 border-r border-sidebar-border",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <SidebarContent location={location} />
      <SidebarFooter />
    </div>
  );
};

const SidebarFooter: React.FC = () => (
  <div className="px-3 py-4 border-t border-sidebar-border shrink-0">
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-sidebar-accent/50">
      <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
        <Zap className="h-3.5 w-3.5 text-emerald-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-sidebar-foreground/90">
          Pro Plan
        </p>
        <p className="text-[10px] text-sidebar-foreground/50 truncate">
          All features unlocked
        </p>
      </div>
    </div>
  </div>
);

export default Sidebar;
