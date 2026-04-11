// ============================================================================
// Core Types
// ============================================================================
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

// ============================================================================
// User & Authentication Types
// ============================================================================
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: Address;
  profilePicture?: string;
  role: UserRole;
  permissions: Permission[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: KYCStatus;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  status: UserStatus;
}

export type UserRole = "customer" | "admin" | "support" | "compliance";
export type UserStatus = "active" | "inactive" | "suspended" | "pending_verification";
export type KYCStatus = "not_started" | "in_progress" | "completed" | "rejected" | "expired";

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Notification Types
// ============================================================================
export interface Notification extends BaseEntity {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
}
