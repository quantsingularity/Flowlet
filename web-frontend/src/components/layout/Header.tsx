import {
  Bell,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/store/authSlice";
import { setTheme } from "@/store/uiSlice";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { theme, unreadNotifications } = useAppSelector((state) => state.ui);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => dispatch(logoutUser());
  const handleThemeChange = (newTheme: "light" | "dark" | "system") =>
    dispatch(setTheme(newTheme));

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const displayName =
    user?.fullName ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "User";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                F
              </span>
            </div>
            <span className="text-lg font-semibold tracking-tight hidden sm:block">
              Flowlet
            </span>
          </div>
        </div>

        {/* Search */}
        <div
          className={cn(
            "flex-1 max-w-sm transition-all duration-200",
            isMobile && searchOpen ? "flex" : isMobile ? "hidden" : "flex",
          )}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              {searchOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="relative p-2"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-destructive-foreground font-semibold">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0 ml-1"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8 ring-2 ring-border">
                  <AvatarImage src={user?.profilePicture} alt={displayName} />
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {getThemeIcon()}
                  <span className="ml-2">Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
