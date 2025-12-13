import apiClient from "@/lib/apiClient";
import { AdminDashboardResponse } from "@/types/dashboard.types";

/**
 * Admin Dashboard Service
 * API calls for admin dashboard (accessible by ADMIN and SUPER_ADMIN)
 */

/**
 * Get dashboard data
 * Returns overview stats, quick stats, and recent activity (SUPER_ADMIN only)
 * GET /api/admin/dashboard
 */
export const getDashboardData = async (): Promise<AdminDashboardResponse> => {
    try {
        const response = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};

/**
 * Format currency as VND
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
};
