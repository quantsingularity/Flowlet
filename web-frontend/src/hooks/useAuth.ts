import { useEffect, useState } from "react";
import { authService } from "@/lib/api/authService";
import { refreshToken, validateToken } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "./redux";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth,
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated() && !isAuthenticated) {
        try {
          await dispatch(validateToken()).unwrap();
        } catch {
          await authService.logout();
        }
      }
      setInitialized(true);
    };

    if (!initialized) {
      initAuth();
    }
  }, [dispatch, isAuthenticated, initialized]);

  const refreshAuthToken = async () => {
    try {
      await dispatch(refreshToken()).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || !initialized,
    error,
    refreshAuthToken,
  };
};
