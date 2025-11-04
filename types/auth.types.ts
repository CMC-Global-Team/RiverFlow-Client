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

// API Error Response
export interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

