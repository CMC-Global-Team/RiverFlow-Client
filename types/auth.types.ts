/**
 * Types cho Authentication API
 */

// Register API Types
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  fullName: string;
  message: string;
}

// SignIn API Types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // in seconds
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

// API Error Response
export interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

