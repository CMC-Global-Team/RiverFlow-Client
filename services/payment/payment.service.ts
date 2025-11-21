import apiClient from "@/lib/apiClient";

export interface TopupIntentResponse {
  code: string;
  amount: number;
  qrUrl: string;
}

export const createTopupIntent = async (amount: number): Promise<TopupIntentResponse> => {
  const res = await apiClient.post<TopupIntentResponse>("/payments/topup-intent", { amount });
  return res.data;
};
