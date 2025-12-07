/**
 * Custom hook to manage Auth0 sign-in logic
 */

"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";
import { auth0Login } from "@/services/auth/auth0-login.service";
import type { Auth0LoginResponse, ApiErrorResponse } from "@/types/auth.types";

interface UseAuth0SignInResult {
    signInWithAuth0: (idToken: string) => Promise<Auth0LoginResponse | null>;
    isLoading: boolean;
    error: ApiErrorResponse | null;
    data: Auth0LoginResponse | null;
    clearError: () => void;
}

/**
 * Hook to handle user sign-in with Auth0
 * @returns Object containing signInWithAuth0 function and related states
 */
export const useAuth0SignIn = (): UseAuth0SignInResult => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ApiErrorResponse | null>(null);
    const [data, setData] = useState<Auth0LoginResponse | null>(null);
    const { login } = useAuth();

    const signInWithAuth0 = async (idToken: string): Promise<Auth0LoginResponse | null> => {
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await auth0Login({ idToken });
            setData(response);

            // Convert Auth0LoginResponse to SignInResponse format for AuthContext compatibility
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

            // Use AuthContext to store login state
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
        signInWithAuth0,
        isLoading,
        error,
        data,
        clearError,
    };
};
