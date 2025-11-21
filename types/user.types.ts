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

