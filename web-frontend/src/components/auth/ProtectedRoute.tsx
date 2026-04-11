import React from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole)
    return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
