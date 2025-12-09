import { AdminUserResponse } from "./user.types";

export enum TransferType {
  IN = 'in',
  OUT = 'out'
}

export enum TransactionStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  PROCESSED = 'processed',
  IGNORED = 'ignored',
  INVALID = 'invalid'
}

export enum TopupStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface CreditTopupRequest {
  id: number;
  user: AdminUserResponse;
  code: string;
  amount: number;
  status: TopupStatus;
  createdAt: string;
  paidAt?: string;
}

export interface PaymentTransaction {
  id: number;
  externalId?: number;
  gateway: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string;
  content?: string;
  transferType: TransferType;
  transferAmount: number;
  accumulated?: number;
  subAccount?: string;
  referenceCode?: string;
  description?: string;
  user?: AdminUserResponse;
  matchedRequest?: CreditTopupRequest;
  status: TransactionStatus;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}