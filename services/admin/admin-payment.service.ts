import apiClient from "@/lib/apiClient";
import { PageResponse, PaymentTransaction } from "@/types/payment.types";

/**
 * Admin Payment Service
 * API calls for admin payment management
 */

// Types for search/filter params
export interface AdminPaymentSearchParams {
    search?: string;
    status?: string;
    transferType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sort?: string;
}

/**
 * Get all transactions with pagination and filters (Admin only)
 * GET /api/admin/payments
 */
export const getAllTransactions = async (
    params: AdminPaymentSearchParams = {}
): Promise<PageResponse<PaymentTransaction>> => {
    try {
        const {
            search = '',
            status,
            transferType,
            startDate,
            endDate,
            page = 0,
            size = 10,
            sort = 'id,desc'
        } = params;

        const response = await apiClient.get<PageResponse<PaymentTransaction>>('/admin/payments', {
            params: {
                search,
                status,
                transferType,
                startDate,
                endDate,
                page,
                size,
                sort
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

/**
 * Get transaction by ID (Admin only)
 * GET /api/admin/payments/{id}
 */
export const getTransactionById = async (id: number): Promise<PaymentTransaction> => {
    try {
        const response = await apiClient.get<PaymentTransaction>(`/admin/payments/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching transaction ${id}:`, error);
        throw error;
    }
};
