/**
 * useAuth Hook - Hook chính để sử dụng authentication
 */

"use client";

import { useAuthContext } from "@/contexts/auth/AuthContext";

/**
 * Custom hook để truy cập authentication state và methods
 * Wrapper cho useAuthContext để dễ sử dụng
 */
export const useAuth = () => {
  return useAuthContext();
};

