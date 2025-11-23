"use client"

import { useState, useEffect } from "react"
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Search, 
  History 
} from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns" 
import { vi } from "date-fns/locale"

import { getMyTransactions } from "@/services/payment/payment.service"
import { TransactionHistory } from "@/types/payment.types"
import TransactionStatusBadge from "@/components/payment/TransactionStatusBadge"

export default function PaymentHistoryPage() {
  const router = useRouter()

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
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Lịch sử giao dịch
          </h1>
          <p className="text-muted-foreground text-sm">
            Xem lại toàn bộ lịch sử nạp tiền vào tài khoản
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : transactions.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có giao dịch nào</h3>
            <p className="text-muted-foreground max-w-xs mt-2">
              Bạn chưa thực hiện giao dịch nào. Lịch sử nạp tiền sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          /* Table Data */
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Mã giao dịch</th>
                  <th className="px-6 py-4 font-medium">Thời gian</th>
                  <th className="px-6 py-4 font-medium">Cổng thanh toán</th>
                  <th className="px-6 py-4 font-medium">Nội dung</th>
                  <th className="px-6 py-4 font-medium text-right">Số tiền</th>
                  <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium font-mono text-xs">
                      {tx.transactionCode || "#UNKNOWN"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-bold text-muted-foreground">
                      {tx.gateway}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={tx.content}>
                      {tx.content}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-primary">
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

        {/* Pagination Footer */}
        {!loading && transactions.length > 0 && (
          <div className="border-t p-4 flex items-center justify-between bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Trang <span className="font-medium">{currentPage + 1}</span> / <span className="font-medium">{totalPages}</span>
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 border rounded-md text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 border rounded-md text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}