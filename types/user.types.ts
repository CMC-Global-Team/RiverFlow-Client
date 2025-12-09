/**
 * Types cho User API
 */

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  avatar?: string;
  preferredLanguage?: string;
  timezone?: string;
}

export interface UserResponse {
  userId: number;
  email: string;
  fullName: string;
  avatar?: string;
  role?: string;
  credit?: number;
  preferredLanguage?: string;
  timezone?: string;
  theme?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Admin User Management Types
export interface AdminUserResponse {
  userId: number;
  email: string;
  fullName: string;
  avatar?: string | null;
  role: 'admin' | 'user'; // Lowercase matches backend
  credit: number;
  preferredLanguage?: string | null;
  timezone?: string | null;
  theme?: 'light' | 'dark' | 'auto';
  emailVerified?: boolean;
  status: 'active' | 'suspended' | 'deleted'; // Lowercase matches backend
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface AdminUpdateUserRequest {
  fullName?: string;
  email?: string;
  password?: string; // Optional for password update
  credit?: number;
  role?: 'admin' | 'user';
  status?: 'active' | 'suspended' | 'deleted';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
