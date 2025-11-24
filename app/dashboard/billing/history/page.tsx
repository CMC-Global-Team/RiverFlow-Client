"use client"

import { useState, useEffect } from "react"
import { 
  Loader2, 
  Search, 
  History, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import Sidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"

import { getMyTransactions } from "@/services/payment/payment.service"
import { TransactionHistory } from "@/types/payment.types"
import TransactionStatusBadge from "@/components/payment/TransactionStatusBadge"

export default function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return dateString
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getMyTransactions(currentPage, pageSize)
        setTransactions(data.content)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Failed to load transactions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 transition-all duration-300"> {/* ml-64 để tránh bị Sidebar che */}
        <DashboardHeader />

        <main className="flex-1 overflow-auto bg-background p-6 md:p-8">
          
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <History className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Lịch sử giao dịch</h1>
                  </div>
                  <p className="text-muted-foreground">
                    Xem lại chi tiết các khoản nạp tiền và giao dịch đã thực hiện trên tài khoản của bạn.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                    Lưu ý thanh toán
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Hệ thống xử lý giao dịch tự động 24/7.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Số dư (Credit) thường được cộng ngay lập tức sau khi chuyển khoản thành công.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Vui lòng nhập chính xác <strong>Nội dung chuyển khoản</strong> để tránh sai sót.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Cần hỗ trợ?</p>
                      <p>
                        Nếu giao dịch của bạn chưa được cập nhật sau 15 phút, vui lòng liên hệ bộ phận CSKH (0395360205) hoặc gửi yêu cầu hỗ trợ kèm biên lai.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-lg">Danh sách giao dịch</h2>
                      <p className="text-sm text-muted-foreground">Hiển thị 10 giao dịch gần nhất</p>
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="min-h-[400px]">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                        <div className="bg-muted/50 p-4 rounded-full mb-4">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">Chưa có giao dịch nào</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          Lịch sử nạp tiền của bạn sẽ xuất hiện tại đây.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                            <tr>
                              <th className="px-6 py-4 font-medium whitespace-nowrap">Mã GD</th>
                              <th className="px-6 py-4 font-medium whitespace-nowrap">Thời gian</th>
                              <th className="px-6 py-4 font-medium whitespace-nowrap">Cổng TT</th>
                              <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Số tiền</th>
                              <th className="px-6 py-4 font-medium whitespace-nowrap text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                  {tx.transactionCode || "#UNK"}
                                </td>
                                <td className="px-6 py-4 text-foreground">
                                  {formatDate(tx.date)}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium uppercase">
                                    {tx.gateway}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                                  +{formatCurrency(tx.amount)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <TransactionStatusBadge status={tx.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {!loading && transactions.length > 0 && (
                    <div className="border-t border-border p-4 flex items-center justify-between bg-muted/10">
                      <p className="text-sm text-muted-foreground">
                        Trang <span className="font-medium text-foreground">{currentPage + 1}</span> / {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="px-3 py-1.5 border border-border rounded-md text-sm bg-background hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Trước
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={currentPage >= totalPages - 1}
                          className="px-3 py-1.5 border border-border rounded-md text-sm bg-background hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        
        </main>
      </div>
    </div>
  )
}