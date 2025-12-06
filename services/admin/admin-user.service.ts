import apiClient from "@/lib/apiClient";
import {
    AdminUserResponse,
    AdminUpdateUserRequest,
    PageResponse,
} from "@/types/user.types";
import { AdminPaymentHistoryResponse } from "@/types/payment.types";

/**
 * Admin User Service
 * API calls for admin user management
 */

// Types for search/filter params
export interface AdminSearchParams {
    search?: string;
    status?: 'active' | 'suspended' | 'deleted';
    role?: 'admin' | 'user';
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    page?: number;
    size?: number;
}

/**
 * Get all users with pagination, search, filter, and sort (Admin only)
 * GET /api/admin/users
 */
export const getAllUsers = async (
    params: AdminSearchParams = {}
): Promise<PageResponse<AdminUserResponse>> => {
    try {
        const {
            search = '',
            status,
            role,
            sortBy = 'createdAt',
            sortDir = 'desc',
            page = 0,
            size = 10,
        } = params;

        const response = await apiClient.get<PageResponse<AdminUserResponse>>('/admin/users', {
            params: {
                search,
                status,
                role,
                sortBy,
                sortDir,
                page,
                size,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

/**
 * Get user by ID (Admin only)
 * GET /api/admin/users/{id}
 */
export const getUserById = async (userId: number): Promise<AdminUserResponse> => {
    try {
        const response = await apiClient.get<AdminUserResponse>(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
};

/**
 * Update user information (Admin only)
 * PUT /api/admin/users/{id}
 */
export const updateUser = async (
    userId: number,
    data: AdminUpdateUserRequest
): Promise<AdminUserResponse> => {
    try {
        const response = await apiClient.put<AdminUserResponse>(`/admin/users/${userId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

/**
 * Soft delete user (Admin only)
 * DELETE /api/admin/users/{id}
 */
export const deleteUser = async (userId: number): Promise<{ message: string }> => {
    try {
        const response = await apiClient.delete<{ message: string }>(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
    }
};

/**
 * Update user credit (Admin only)
 * PUT /api/admin/users/{id}/credit
 */
export const updateUserCredit = async (
    userId: number,
    credit: number
): Promise<AdminUserResponse> => {
    try {
        const response = await apiClient.put<AdminUserResponse>(`/admin/users/${userId}/credit`, {
            credit,
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating credit for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Change user password (Admin only)
 * PUT /api/admin/users/{id}/password
 */
export const changeUserPassword = async (
    userId: number,
    newPassword: string
): Promise<{ message: string }> => {
    try {
        const response = await apiClient.put<{ message: string }>(
            `/admin/users/${userId}/password`,
            { newPassword }
        );
        return response.data;
    } catch (error) {
        console.error(`Error changing password for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get user payment history (Admin only)
 * GET /api/admin/users/{id}/payments
 */
export const getUserPaymentHistory = async (
    userId: number,
    page: number = 0,
    size: number = 10
): Promise<PageResponse<AdminPaymentHistoryResponse>> => {
    try {
        const response = await apiClient.get<PageResponse<AdminPaymentHistoryResponse>>(
            `/admin/users/${userId}/payments`,
            {
                params: { page, size },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching payment history for user ${userId}:`, error);
        throw error;
    }
};
