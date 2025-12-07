/**
 * Service for Auth0 login API
 */

import apiClient from "@/lib/apiClient";
import type { Auth0LoginRequest, Auth0LoginResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Authenticate user with Auth0 ID token
 * @param request - The Auth0 login request containing the ID token
 * @returns Auth0 login response with access token, refresh token, and user info
 */
export async function auth0Login(
    request: Auth0LoginRequest
): Promise<Auth0LoginResponse> {
    try {
        const response = await apiClient.post<Auth0LoginResponse>(
            "/auth/auth0",
            request
        );
        return { ...response.data, provider: "auth0" };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const apiError: ApiErrorResponse = {
                message: error.response?.data?.message || "Auth0 login failed",
                status: error.response?.status,
                errors: error.response?.data?.errors,
            };
            throw apiError;
        }
        throw {
            message: "Unable to connect to server",
        } as ApiErrorResponse;
    }
}
