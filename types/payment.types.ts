export interface TransactionHistory {
  id: number;
  transactionCode: string;
  amount: number;
  status: 'pending' | 'processed' | 'invalid' | 'ignored' | string;
  date: string;
  gateway: string;
  content: string;
}

export interface PageResponse<T> {
  content: T[];          // Danh sách dữ liệu chính
  totalPages: number;    // Tổng số trang
  totalElements: number; // Tổng số bản ghi
  size: number;          // Kích thước trang
  number: number;        // Trang hiện tại (bắt đầu từ 0)
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Admin payment history type (same structure as TransactionHistory)
export type AdminPaymentHistoryResponse = TransactionHistory;

// Payment status type
export type PaymentStatus = 'pending' | 'matched' | 'processed' | 'ignored' | 'invalid';

// Admin payment response with full details
export interface AdminPaymentResponse {
  id: number;
  externalId: number | null;
  gateway: string;
  transactionDate: string | null;
  accountNumber: string | null;
  code: string | null;
  content: string | null;
  transferType: 'in' | 'out' | null;
  transferAmount: number;
  accumulated: number | null;
  subAccount: string | null;
  referenceCode: string | null;
  description: string | null;
  status: PaymentStatus;
  createdAt: string;

  // User info (if matched)
  userId: number | null;
  userEmail: string | null;
  userFullName: string | null;

  // Matched request info
  matchedRequestId: number | null;
  matchedRequestCode: string | null;
}

// Payment search params
export interface PaymentSearchParams {
  search?: string;
  status?: PaymentStatus;
  gateway?: string;
  transferType?: 'in' | 'out';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// Payment statistics (super admin only)
export interface PaymentStatistics {
  totalPayments: number;
  totalAmount: number;

  pendingCount: number;
  processedCount: number;
  matchedCount: number;
  ignoredCount: number;
  invalidCount: number;

  todayPayments: number;
  todayAmount: number;

  weekPayments: number;
  weekAmount: number;

  monthPayments: number;
  monthAmount: number;
}

// Export format type
export type ExportFormat = 'csv' | 'txt' | 'json';