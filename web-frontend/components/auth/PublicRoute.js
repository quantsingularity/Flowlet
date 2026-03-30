import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return _jsx(LoadingScreen, {});
  }
  if (isAuthenticated) {
    return _jsx(Navigate, { to: "/dashboard", replace: true });
  }
  return _jsx(_Fragment, { children: children });
};
export default PublicRoute;
