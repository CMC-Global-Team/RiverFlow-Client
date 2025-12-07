/**
 * Service for Auth0 login API
 */

import axiosInstance from "@/lib/axiosInstance";
import type { Auth0LoginRequest, Auth0LoginResponse } from "@/types/auth.types";

/**
 * Authenticate user with Auth0 ID token
 * @param request - The Auth0 login request containing the ID token
 * @returns Auth0 login response with access token, refresh token, and user info
 */
export async function auth0Login(
    request: Auth0LoginRequest
): Promise<Auth0LoginResponse> {
    const response = await axiosInstance.post<Auth0LoginResponse>(
        "/auth/auth0",
        request
    );
    return { ...response.data, provider: "auth0" };
}
