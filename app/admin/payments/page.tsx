"use client";


import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PaymentTransaction, PageResponse } from '@/types/payment.types';
import { getAllTransactions } from '@/services/admin/admin-payment.service';
import { Eye, X, CheckCircle, AlertCircle, Clock, Ban, ArrowRight, ArrowLeft } from 'lucide-react';

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

                        {/* Webhook Content */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-foreground">Nội Dung Webhook (Raw)</h3>
                            <div className="p-3 bg-muted rounded-md border border-border overflow-x-auto">
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                                    {transaction.content || transaction.description || 'Không có nội dung'}
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

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const fetchTransactions = async (page: number) => {
        setLoading(true);
        try {
            const data = await getAllTransactions(page, pageSize);
            if (data && Array.isArray(data.content)) {
                setTransactions(data.content);
                setTotalPages(data.totalPages);
                setCurrentPage(data.number);
            } else {
                setTransactions([]);
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
            setError("Không thể tải danh sách giao dịch.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(currentPage);
    }, [currentPage]);

    return (
        <div className="p-6 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Quản Lý Giao Dịch</h1>
                <p className="text-muted-foreground mt-1">Xem và kiểm tra lịch sử thanh toán từ cổng thanh toán.</p>
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
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4">Cổng TT</th>
                                <th className="px-6 py-4">Thời Gian</th>
                                <th className="px-6 py-4 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Đang tải dữ liệu...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Không có giao dịch nào.</td>
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
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                        <div className="text-sm text-muted-foreground">
                            Trang {currentPage + 1} / {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
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
