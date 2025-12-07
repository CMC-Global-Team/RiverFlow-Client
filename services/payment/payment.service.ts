import apiClient from "@/lib/apiClient";
import { PageResponse, PaymentTransaction } from "@/types/payment.types";

export interface TopupIntentResponse {
  code: string;
  amount: number;
  qrUrl: string;
}

export const createTopupIntent = async (amount: number): Promise<TopupIntentResponse> => {
  const res = await apiClient.post<TopupIntentResponse>("/payments/topup-intent", { amount });
  return res.data;
};

/**
 * Lấy lịch sử giao dịch của user
 * GET /api/payments/history
 */
export const getMyTransactions = async (page: number = 0, size: number = 10): Promise<PageResponse<PaymentTransaction>> => {
  try {
    const response = await apiClient.get<PageResponse<PaymentTransaction>>('/payments/history', {
      params: {
        page, // Spring Boot mặc định trang đầu tiên là 0
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
};