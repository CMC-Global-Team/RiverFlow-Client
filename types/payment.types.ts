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