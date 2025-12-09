"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { PaymentTransaction } from '@/types/payment.types';
import { getAllTransactions, AdminPaymentSearchParams } from '@/services/admin/admin-payment.service';
import { Eye, X, CheckCircle, AlertCircle, Clock, Ban, ArrowRight, ArrowLeft, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// --- Badge Components ---
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (s: string) => {
        switch (s.toLowerCase()) {
            case 'processed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'matched': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'ignored': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            case 'invalid': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getIcon = (s: string) => {
        switch (s.toLowerCase()) {
            case 'processed': return <CheckCircle className="w-3 h-3 mr-1" />;
            case 'matched': return <CheckCircle className="w-3 h-3 mr-1" />;
            case 'pending': return <Clock className="w-3 h-3 mr-1" />;
            case 'invalid': return <AlertCircle className="w-3 h-3 mr-1" />;
            default: return <Ban className="w-3 h-3 mr-1" />;
        }
    };

    return (
        <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {getIcon(status)}
            {status.toUpperCase()}
        </span>
    );
};

// --- Details Modal ---
const TransactionDetailsModal = ({ transaction, onClose }: { transaction: PaymentTransaction | null, onClose: () => void }) => {
    if (!transaction) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                        <h2 className="text-xl font-semibold text-foreground">Chi Tiết Giao Dịch #{transaction.id}</h2>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground">Mã Giao Dịch</label>
                                <p className="font-medium">{transaction.code || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Số Tiền</label>
                                <p className="font-medium text-lg text-primary">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.transferAmount)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Cổng Thanh Toán</label>
                                <p className="font-medium">{transaction.gateway}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Ngày Giao Dịch</label>
                                <p className="font-medium">{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleString('vi-VN') : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Trạng Thái</label>
                                <div className="mt-1"><StatusBadge status={transaction.status} /></div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Loại Giao Dịch</label>
                                <p className="font-medium uppercase">{transaction.transferType}</p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full"></span>
                                Thông Tin Người Dùng
                            </h3>
                            {transaction.user ? (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Họ Tên:</span>
                                        <span className="ml-2 font-medium">{transaction.user.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="ml-2 font-medium">{transaction.user.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">ID:</span>
                                        <span className="ml-2 font-medium">{transaction.user.userId}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Chưa xác định người dùng (Giao dịch chưa được xử lý hoặc không hợp lệ)</p>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground">Nội dung chuyển khoản</label>
                                    <p className="font-mono text-sm">{transaction.content || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Số tài khoản</label>
                                    <p className="font-mono text-sm">{transaction.accountNumber || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Webhook Content */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-foreground">Dữ liệu thô (Raw Description)</h3>
                            <div className="p-3 bg-muted rounded-md border border-border overflow-x-auto">
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                                    {transaction.description || 'Không có mô tả'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- Main Page Component ---
function PaymentManagementContent() {
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [size, setSize] = useState(10);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params: AdminPaymentSearchParams = {
                page,
                size,
                search: search || undefined,
                status: statusFilter === "all" ? undefined : statusFilter,
                transferType: typeFilter === "all" ? undefined : typeFilter,
                sort: 'id,desc'
            };

            const data = await getAllTransactions(params);
            if (data && Array.isArray(data.content)) {
                setTransactions(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
                setPage(data.number);
            } else {
                setTransactions([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
            setError("Không thể tải danh sách giao dịch.");
        } finally {
            setLoading(false);
        }
    }, [page, size, search, statusFilter, typeFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 0) {
                setPage(0); // Reset to first page on search change will trigger fetch via page dependency
            } else {
                fetchTransactions();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch on filter/pagination change (except search which is handled above)
    useEffect(() => {
        fetchTransactions();
    }, [page, size, statusFilter, typeFilter]); // Removed fetchTransactions from dependency to avoid loop if not memoized, but useCallback handles it. Added it back for correctness.


    return (
        <div className="p-6 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Quản Lý Giao Dịch</h1>
                <p className="text-muted-foreground mt-1">
                    Xem và kiểm tra lịch sử thanh toán từ cổng thanh toán. Tổng số: {totalElements} giao dịch.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã giao dịch, nội dung..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="matched">Matched</SelectItem>
                        <SelectItem value="ignored">Ignored</SelectItem>
                        <SelectItem value="invalid">Invalid</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Loại giao dịch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="in">Nạp tiền (IN)</SelectItem>
                        <SelectItem value="out">Rút tiền (OUT)</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={size.toString()} onValueChange={(v) => { setSize(Number(v)); setPage(0); }}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Kích thước" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 / trang</SelectItem>
                        <SelectItem value="20">20 / trang</SelectItem>
                        <SelectItem value="50">50 / trang</SelectItem>
                        <SelectItem value="100">100 / trang</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Người Dùng</th>
                                <th className="px-6 py-4">Số Tiền</th>
                                <th className="px-6 py-4">Loại</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4">Cổng TT</th>
                                <th className="px-6 py-4">Thời Gian</th>
                                <th className="px-6 py-4 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={8} className="px-6 py-4 text-center text-muted-foreground animate-pulse">
                                            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                                        Không tìm thấy giao dịch nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">#{tx.id}</td>
                                        <td className="px-6 py-4">
                                            {tx.user ? (
                                                <div>
                                                    <div className="font-medium text-foreground">{tx.user.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{tx.user.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Chưa xác định</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-primary">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.transferAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${tx.transferType === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {tx.transferType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="px-6 py-4 uppercase text-xs font-semibold text-muted-foreground">
                                            {tx.gateway}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                            <div className="text-xs opacity-70">
                                                {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString('vi-VN') : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedTransaction(tx)}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-full transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                        Trang {page + 1} / {totalPages || 1}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            Sau
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <TransactionDetailsModal
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
            />
        </div>
    );
}

export default function PaymentManagementPage() {
    return <PaymentManagementContent />;
}
