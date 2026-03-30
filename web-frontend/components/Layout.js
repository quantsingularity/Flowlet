import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setMobileMenuOpen, toggleSidebar } from "@/store/uiSlice";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ isMobile }) => {
  const dispatch = useAppDispatch();
  const { sidebarOpen, mobileMenuOpen } = useAppSelector((state) => state.ui);
  const handleSidebarToggle = () => {
    if (isMobile) {
      dispatch(setMobileMenuOpen(!mobileMenuOpen));
    } else {
      dispatch(toggleSidebar());
    }
  };
  return _jsxs("div", {
    className: "min-h-screen bg-background",
    children: [
      _jsx(Header, { onMenuClick: handleSidebarToggle, isMobile: isMobile }),
      _jsxs("div", {
        className: "flex",
        children: [
          _jsx(Sidebar, {
            isOpen: isMobile ? mobileMenuOpen : sidebarOpen,
            isMobile: isMobile,
            onClose: () => dispatch(setMobileMenuOpen(false)),
          }),
          _jsx("main", {
            className: `flex-1 transition-all duration-300 ${!isMobile && sidebarOpen ? "ml-64" : "ml-0"}`,
            children: _jsx("div", {
              className: "p-6 pt-20",
              children: _jsx(Outlet, {}),
            }),
          }),
        ],
      }),
    ],
  });
};
export default Layout;
