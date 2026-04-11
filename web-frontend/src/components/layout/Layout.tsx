import React from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setMobileMenuOpen, toggleSidebar } from "@/store/uiSlice";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  isMobile: boolean;
}

const Layout: React.FC<LayoutProps> = ({ isMobile }) => {
  const dispatch = useAppDispatch();
  const { sidebarOpen, mobileMenuOpen } = useAppSelector((state) => state.ui);

  const handleSidebarToggle = () => {
    if (isMobile) {
      dispatch(setMobileMenuOpen(!mobileMenuOpen));
    } else {
      dispatch(toggleSidebar());
    }
  };

  const isOpen = isMobile ? mobileMenuOpen : sidebarOpen;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={handleSidebarToggle} isMobile={isMobile} />

      <Sidebar
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={() => dispatch(setMobileMenuOpen(false))}
      />

      <main
        className={cn(
          "transition-all duration-300 ease-out pt-16",
          !isMobile && sidebarOpen ? "ml-64" : "ml-0",
        )}
      >
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
