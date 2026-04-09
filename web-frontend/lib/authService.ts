// Authentication Service for Flowlet web-frontend
import { ApiError, api, TokenManager } from "./api";
import type { LoginCredentials, RegisterData, User } from "@/types";

// API response shape (snake_case from backend)
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
}

// Authentication Service Class
class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        "/api/v1/auth/login",
        credentials,
      );

      // Store tokens and user data
      TokenManager.setAccessToken(response.access_token);
      TokenManager.setRefreshToken(response.refresh_token);
      TokenManager.setUser(response.user);

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Login failed", 500);
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Map camelCase frontend fields to snake_case API fields
      const apiPayload = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone_number: userData.phoneNumber,
      };

      const response = await api.post<AuthResponse>(
        "/api/v1/auth/register",
        apiPayload,
      );

      // Store tokens and user data
      TokenManager.setAccessToken(response.access_token);
      TokenManager.setRefreshToken(response.refresh_token);
      TokenManager.setUser(response.user);

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Registration failed", 500);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      // Even if server logout fails, clear local tokens
      console.warn("Server logout failed:", error);
    } finally {
      // Always clear local storage
      TokenManager.clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new ApiError("No refresh token available", 401);
    }

    try {
      const response = await api.post<{ access_token: string }>(
        "/api/v1/auth/refresh",
        {
          refresh_token: refreshToken,
        },
      );

      TokenManager.setAccessToken(response.access_token);
      return response.access_token;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      TokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await api.get<User>("/api/v1/auth/profile");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        TokenManager.clearTokens();
      }
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    return await api.put<User>("/api/v1/auth/profile", userData);
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await api.post("/api/v1/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post("/api/v1/auth/forgot-password", { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/api/v1/auth/reset-password", {
      token,
      password,
    });
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    await api.post("/api/v1/auth/verify-email", { token });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    await api.post("/api/v1/auth/resend-verification");
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    const user = TokenManager.getUser();

    return !!(token && user && !TokenManager.isTokenExpired(token));
  }

  /**
   * Get current user from local storage
   */
  getCurrentUserFromStorage(): User | null {
    return TokenManager.getUser();
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<{ qr_code: string; secret: string }> {
    return await api.post("/api/v1/auth/2fa/enable");
  }

  /**
   * Verify two-factor authentication setup
   */
  async verifyTwoFactor(code: string): Promise<void> {
    await api.post("/api/v1/auth/2fa/verify", { code });
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(password: string): Promise<void> {
    await api.post("/api/v1/auth/2fa/disable", { password });
  }

  /**
   * Get user sessions
   */
  async getSessions(): Promise<any[]> {
    return await api.get("/api/v1/auth/sessions");
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/api/v1/auth/sessions/${sessionId}`);
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions(): Promise<void> {
    await api.post("/api/v1/auth/sessions/revoke-all");
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
