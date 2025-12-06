/**
 * Custom hook để quản lý logic đăng nhập bằng GitHub
 */

"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";
import { githubLogin } from "@/services/auth/github-login.service";
import type { GitHubLoginResponse, ApiErrorResponse } from "@/types/auth.types";

interface UseGitHubSignInResult {
    signInWithGitHub: (code: string) => Promise<GitHubLoginResponse | null>;
    isLoading: boolean;
    error: ApiErrorResponse | null;
    data: GitHubLoginResponse | null;
    clearError: () => void;
}

/**
 * Hook xử lý đăng nhập người dùng bằng GitHub
 * @returns Object chứa hàm signInWithGitHub và các state liên quan
 */
export const useGitHubSignIn = (): UseGitHubSignInResult => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ApiErrorResponse | null>(null);
    const [data, setData] = useState<GitHubLoginResponse | null>(null);
    const { login } = useAuth();

    const signInWithGitHub = async (code: string): Promise<GitHubLoginResponse | null> => {
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await githubLogin({ code });
            setData(response);

            // Chuyển đổi GitHubLoginResponse thành SignInResponse format để tương thích với AuthContext
            const signInResponse = {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                tokenType: response.tokenType,
                expiresIn: response.expiresIn,
                userId: response.userId,
                email: response.email,
                fullName: response.fullName,
                role: response.role,
                credit: response.credit,
                avatar: response.avatar,
            };

            // Sử dụng AuthContext để lưu trạng thái đăng nhập
            login(signInResponse);

            return response;
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            setError(apiError);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        signInWithGitHub,
        isLoading,
        error,
        data,
        clearError,
    };
};
