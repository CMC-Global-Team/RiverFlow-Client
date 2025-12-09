import apiClient from "@/lib/apiClient";
import {
    AdminPaymentResponse,
    PaymentSearchParams,
    PaymentStatistics,
    PaymentStatus,
    ExportFormat,
    PageResponse,
} from "@/types/payment.types";

/**
 * Admin Payment Service
 * API calls for admin payment management
 */

/**
 * Get all payments with pagination, search, filter, and sort (Admin/Super Admin)
 * GET /api/admin/payments
 */
export const getAllPayments = async (
    params: PaymentSearchParams = {}
): Promise<PageResponse<AdminPaymentResponse>> => {
    try {
        const {
            search = '',
            status,
            gateway,
            transferType,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortDir = 'desc',
            page = 0,
            size = 10,
        } = params;

        const response = await apiClient.get<PageResponse<AdminPaymentResponse>>('/admin/payments', {
            params: {
                search,
                status,
                gateway,
                transferType,
                startDate,
                endDate,
                sortBy,
                sortDir,
                page,
                size,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching payments:", error);
        throw error;
    }
};

/**
 * Get payment by ID (Admin/Super Admin)
 * GET /api/admin/payments/{id}
 */
export const getPaymentById = async (paymentId: number): Promise<AdminPaymentResponse> => {
    try {
        const response = await apiClient.get<AdminPaymentResponse>(`/admin/payments/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching payment ${paymentId}:`, error);
        throw error;
    }
};

/**
 * Update payment status (Admin/Super Admin)
 * PUT /api/admin/payments/{id}/status
 */
export const updatePaymentStatus = async (
    paymentId: number,
    status: PaymentStatus
): Promise<AdminPaymentResponse> => {
    try {
        const response = await apiClient.put<AdminPaymentResponse>(
            `/admin/payments/${paymentId}/status`,
            { status }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating payment status ${paymentId}:`, error);
        throw error;
    }
};

/**
 * Get payment statistics (Super Admin only)
 * GET /api/admin/payments/statistics
 */
export const getPaymentStatistics = async (): Promise<PaymentStatistics> => {
    try {
        const response = await apiClient.get<PaymentStatistics>('/admin/payments/statistics');
        return response.data;
    } catch (error) {
        console.error("Error fetching payment statistics:", error);
        throw error;
    }
};

/**
 * Export payments (Super Admin only)
 * GET /api/admin/payments/export/{format}
 */
export const exportPayments = async (
    format: ExportFormat,
    params: PaymentSearchParams = {}
): Promise<Blob> => {
    try {
        const {
            search,
            status,
            gateway,
            transferType,
            startDate,
            endDate,
        } = params;

        const response = await apiClient.get(`/admin/payments/export/${format}`, {
            params: {
                search,
                status,
                gateway,
                transferType,
                startDate,
                endDate,
            },
            responseType: 'blob',
        });

        return response.data;
    } catch (error) {
        console.error(`Error exporting payments as ${format}:`, error);
        throw error;
    }
};

/**
 * Download exported payments file
 */
export const downloadExportedPayments = async (
    format: ExportFormat,
    params: PaymentSearchParams = {}
): Promise<void> => {
    try {
        const blob = await exportPayments(format, params);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const extension = format;
        link.download = `payments_${date}.${extension}`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Error downloading payments as ${format}:`, error);
        throw error;
    }
};
