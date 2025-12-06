import apiClient from "@/lib/apiClient";
import { AdminUserResponse, AdminUpdateUserRequest, PageResponse } from "@/types/user.types";

/**
 * Lấy danh sách tất cả users (Admin only)
 * GET /api/user/all?page=0&size=10&sort=createdAt,desc
 */
export const getAllUsers = async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
): Promise<PageResponse<AdminUserResponse>> => {
    try {
        const response = await apiClient.get<AdminUserResponse[]>('/user/all', {
            params: {
                page,
                size,
                sort: `${sortBy},${sortDirection}`
            }
        });

        // Backend trả về array trực tiếp, không phải PageResponse
        // Chuyển đổi sang format PageResponse để tương thích với UI
        const users = response.data;

        // DEBUG: Log cấu trúc user đầu tiên để kiểm tra tên trường
        if (users.length > 0) {
            console.log('Sample user data from API:', users[0]);
        }

        return {
            content: users,
            totalElements: users.length,
            totalPages: 1,
            size: users.length,
            number: 0
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

/**
 * Lấy thông tin user theo ID
 * GET /api/user/{id}
 */
export const getUserById = async (userId: number): Promise<AdminUserResponse> => {
    try {
        const response = await apiClient.get<AdminUserResponse>(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
};

/**
 * Cập nhật thông tin user
 * PUT /api/user/{id}
 */
export const updateUser = async (
    userId: number,
    data: AdminUpdateUserRequest
): Promise<AdminUserResponse> => {
    try {
        console.log(`Updating user ${userId} with data:`, data);
        const response = await apiClient.put<AdminUserResponse>(`/user/${userId}`, data);
        console.log('Update success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error updating user:", error);
        if (error.response) {
            console.error("Server response:", error.response.data);
            console.error("Status code:", error.response.status);
        }
        throw error;
    }
};

/**
 * Xóa user (soft delete)
 * DELETE /api/user/{id}
 */
export const deleteUser = async (userId: number): Promise<{ message: string }> => {
    try {
        const response = await apiClient.delete<{ message: string }>(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
    }
};

/**
 * Xóa vĩnh viễn (hard delete)
 * DELETE /api/user/{id}/permanent
 */
export const hardDeleteUser = async (userId: number): Promise<{ message: string }> => {
    try {
        const response = await apiClient.delete<{ message: string }>(`/user/${userId}/permanent`);
        return response.data;
    } catch (error) {
        console.error(`Error permanently deleting user ${userId}:`, error);
        throw error;
    }
};
