"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/auth/useAuth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    RefreshCw,
    Download,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react"
import {
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    getPaymentStatistics,
    downloadExportedPayments,
} from "@/services/admin/admin-payment.service"
import {
    AdminPaymentResponse,
    PaymentSearchParams,
    PaymentStatistics,
    PaymentStatus,
    ExportFormat,
    PageResponse,
} from "@/types/payment.types"

export default function PaymentsManagePage() {
    const { t } = useTranslation("adminSideBar")
    const { user: currentUser } = useAuth()
    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN"

    // State for payments list
    const [payments, setPayments] = useState<AdminPaymentResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    // State for statistics (super admin only)
    const [statistics, setStatistics] = useState<PaymentStatistics | null>(null)
    const [statsLoading, setStatsLoading] = useState(false)

    // Search and filter state
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [gatewayFilter, setGatewayFilter] = useState<string>("")
    const [transferTypeFilter, setTransferTypeFilter] = useState<string>("")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)

    // Dialog states
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<AdminPaymentResponse | null>(null)
    const [newStatus, setNewStatus] = useState<PaymentStatus>("pending")
    const [exportLoading, setExportLoading] = useState(false)

    // Fetch payments
    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true)
            const params: PaymentSearchParams = {
                search,
                status: statusFilter as PaymentStatus || undefined,
                gateway: gatewayFilter || undefined,
                transferType: transferTypeFilter as "in" | "out" || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                sortBy,
                sortDir,
                page,
                size,
            }
            const response = await getAllPayments(params)
            setPayments(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (error) {
            console.error("Error fetching payments:", error)
            toast.error("Failed to load payments")
        } finally {
            setLoading(false)
        }
    }, [search, statusFilter, gatewayFilter, transferTypeFilter, startDate, endDate, sortBy, sortDir, page, size])

    // Fetch statistics (super admin only)
    const fetchStatistics = useCallback(async () => {
        if (!isSuperAdmin) return
        try {
            setStatsLoading(true)
            const stats = await getPaymentStatistics()
            setStatistics(stats)
        } catch (error) {
            console.error("Error fetching statistics:", error)
        } finally {
            setStatsLoading(false)
        }
    }, [isSuperAdmin])

    useEffect(() => {
        fetchPayments()
    }, [fetchPayments])

    useEffect(() => {
        fetchStatistics()
    }, [fetchStatistics])

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0)
            fetchPayments()
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    // Handle status update
    const handleStatusClick = (payment: AdminPaymentResponse) => {
        setSelectedPayment(payment)
        setNewStatus(payment.status)
        setStatusDialogOpen(true)
    }

    const handleStatusSave = async () => {
        if (!selectedPayment) return
        try {
            await updatePaymentStatus(selectedPayment.id, newStatus)
            toast.success(t("statusUpdateSuccess"))
            setStatusDialogOpen(false)
            fetchPayments()
            if (isSuperAdmin) fetchStatistics()
        } catch (error) {
            toast.error(t("statusUpdateError"))
        }
    }

    // Handle view details
    const handleViewDetails = async (payment: AdminPaymentResponse) => {
        try {
            const details = await getPaymentById(payment.id)
            setSelectedPayment(details)
            setDetailsDialogOpen(true)
        } catch (error) {
            toast.error("Failed to load payment details")
        }
    }

    // Handle export
    const handleExport = async (format: ExportFormat) => {
        try {
            setExportLoading(true)
            await downloadExportedPayments(format, {
                search,
                status: statusFilter as PaymentStatus || undefined,
                gateway: gatewayFilter || undefined,
                transferType: transferTypeFilter as "in" | "out" || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            })
            toast.success(t("exportSuccess"))
        } catch (error) {
            toast.error(t("exportError"))
        } finally {
            setExportLoading(false)
        }
    }

    // Status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "processed":
                return "bg-green-500"
            case "matched":
                return "bg-blue-500"
            case "pending":
                return "bg-yellow-500"
            case "ignored":
                return "bg-gray-500"
            case "invalid":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    // Format amount
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + " VND"
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("paymentManage")}</h1>
                <p className="mt-2 text-muted-foreground">
                    {t("showing")} {payments.length} {t("of")} {totalElements} {t("results")}
                </p>
            </div>

            {/* Statistics Section (Super Admin Only) */}
            {isSuperAdmin && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {t("statistics")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader className="pb-2">
                                        <Skeleton className="h-4 w-24" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-8 w-32" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : statistics && (
                            <>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            {t("totalPayments")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.totalPayments}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatAmount(statistics.totalAmount)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {t("todayPayments")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.todayPayments}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatAmount(statistics.todayAmount)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {t("processedPayments")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{statistics.processedCount}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                                            {t("pendingPayments")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-yellow-600">{statistics.pendingCount}</div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    {/* Export Buttons */}
                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('csv')}
                            disabled={exportLoading}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {t("exportCSV")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('txt')}
                            disabled={exportLoading}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {t("exportTXT")}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('json')}
                            disabled={exportLoading}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {t("exportJSON")}
                        </Button>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("searchPayments")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={t("allStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("allStatus")}</SelectItem>
                        <SelectItem value="pending">{t("pending")}</SelectItem>
                        <SelectItem value="matched">{t("matched")}</SelectItem>
                        <SelectItem value="processed">{t("processed")}</SelectItem>
                        <SelectItem value="ignored">{t("ignored")}</SelectItem>
                        <SelectItem value="invalid">{t("invalid")}</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={transferTypeFilter || "all"} onValueChange={(v) => { setTransferTypeFilter(v === "all" ? "" : v); setPage(0); }}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={t("allTransferTypes")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("allTransferTypes")}</SelectItem>
                        <SelectItem value="in">{t("in")}</SelectItem>
                        <SelectItem value="out">{t("out")}</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex gap-2 items-center">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                        className="w-[140px]"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                        className="w-[140px]"
                    />
                </div>
                <Button variant="outline" size="icon" onClick={fetchPayments}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("paymentId")}</TableHead>
                            <TableHead>{t("transactionCode")}</TableHead>
                            <TableHead>{t("userInfo")}</TableHead>
                            <TableHead>{t("amount")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                            <TableHead>{t("gateway")}</TableHead>
                            <TableHead>{t("date")}</TableHead>
                            <TableHead className="text-center">{t("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {t("noPayments")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-mono text-sm">#{payment.id}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {payment.code || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {payment.userEmail ? (
                                            <div>
                                                <div className="font-medium">{payment.userFullName || "-"}</div>
                                                <div className="text-xs text-muted-foreground">{payment.userEmail}</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">{t("noUserAssociated")}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatAmount(payment.transferAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(payment.status)}>
                                            {t(payment.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{payment.gateway || "-"}</TableCell>
                                    <TableCell>
                                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewDetails(payment)}
                                                title={t("viewDetails")}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusClick(payment)}
                                                title={t("updateStatus")}
                                            >
                                                {t("updateStatus")}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {t("page")} {page + 1} {t("of")} {totalPages || 1}
                    </p>
                    <Select value={size.toString()} onValueChange={(v) => { setSize(parseInt(v)); setPage(0); }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t("previous")}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        {t("next")}
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("updateStatus")}</DialogTitle>
                        <DialogDescription>
                            {t("transactionCode")}: {selectedPayment?.code || "-"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("selectStatus")}</Label>
                            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as PaymentStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">{t("pending")}</SelectItem>
                                    <SelectItem value="matched">{t("matched")}</SelectItem>
                                    <SelectItem value="processed">{t("processed")}</SelectItem>
                                    <SelectItem value="ignored">{t("ignored")}</SelectItem>
                                    <SelectItem value="invalid">{t("invalid")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleStatusSave}>{t("save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("paymentDetails")}</DialogTitle>
                        <DialogDescription>
                            {t("paymentId")}: #{selectedPayment?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                                <Label className="text-muted-foreground">{t("transactionCode")}</Label>
                                <p className="font-mono">{selectedPayment.code || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("externalId")}</Label>
                                <p className="font-mono">{selectedPayment.externalId || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("amount")}</Label>
                                <p className="font-bold text-lg">{formatAmount(selectedPayment.transferAmount)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("status")}</Label>
                                <Badge className={getStatusColor(selectedPayment.status)}>
                                    {t(selectedPayment.status)}
                                </Badge>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("gateway")}</Label>
                                <p>{selectedPayment.gateway || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("transferType")}</Label>
                                <p>{selectedPayment.transferType ? t(selectedPayment.transferType) : "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("accountNumber")}</Label>
                                <p className="font-mono">{selectedPayment.accountNumber || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("referenceCode")}</Label>
                                <p className="font-mono">{selectedPayment.referenceCode || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-muted-foreground">{t("userInfo")}</Label>
                                {selectedPayment.userEmail ? (
                                    <p>{selectedPayment.userFullName} ({selectedPayment.userEmail})</p>
                                ) : (
                                    <p className="text-muted-foreground">{t("noUserAssociated")}</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <Label className="text-muted-foreground">{t("content")}</Label>
                                <p className="text-sm bg-muted p-2 rounded">{selectedPayment.content || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-muted-foreground">{t("description")}</Label>
                                <p className="text-sm">{selectedPayment.description || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("date")}</Label>
                                <p>{selectedPayment.transactionDate ? new Date(selectedPayment.transactionDate).toLocaleString() : "-"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t("createdAt")}</Label>
                                <p>{selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : "-"}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                            {t("closeDetails")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
