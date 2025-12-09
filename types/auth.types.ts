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
  credit: number;
  avatar?: string;
}

// Google Login API Types
export interface GoogleLoginRequest {
  credential: string; // Google ID token
}

export interface GoogleLoginResponse extends SignInResponse {
  provider: "google";
}

// GitHub Login API Types
export interface GitHubLoginRequest {
  code: string; // GitHub OAuth authorization code
}

export interface GitHubLoginResponse extends SignInResponse {
  provider: "github";
}

// Auth0 Login API Types
export interface Auth0LoginRequest {
  idToken: string; // Auth0 ID token
}

export interface Auth0LoginResponse extends SignInResponse {
  provider: "auth0";
}

// ForgotPassword API Types
export interface ForgotPasswordRequest {
  email: string;
}

// ResetPassword API Types
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}

// API Error Response
export interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

