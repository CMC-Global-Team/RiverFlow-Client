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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    CreditCard,
    Key,
    History,
} from "lucide-react"
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserCredit,
    changeUserPassword,
    getUserPaymentHistory,
    hardDeleteUser,
    AdminSearchParams,
} from "@/services/admin/admin-user.service"
import { AdminUserResponse, PageResponse } from "@/types/user.types"
import { AdminPaymentHistoryResponse } from "@/types/payment.types"

export default function UsersManagePage() {
    const { t } = useTranslation("admin")
    const { user: currentUser } = useAuth()
    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN"

    // State for users list
    const [users, setUsers] = useState<AdminUserResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    // Search and filter state - deleted users excluded on server side by default
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [roleFilter, setRoleFilter] = useState<string>("")
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [creditDialogOpen, setCreditDialogOpen] = useState(false)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

    // Selected user for dialogs
    const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null)

    // Form states
    const [editForm, setEditForm] = useState({
        fullName: "",
        email: "",
        role: "",
        status: "",
    })
    const [creditValue, setCreditValue] = useState<number>(0)
    const [newPassword, setNewPassword] = useState("")
    const [payments, setPayments] = useState<AdminPaymentHistoryResponse[]>([])
    const [paymentLoading, setPaymentLoading] = useState(false)

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const params: AdminSearchParams = {
                search,
                status: statusFilter as AdminSearchParams["status"],
                role: roleFilter as AdminSearchParams["role"],
                sortBy,
                sortDir,
                page,
                size,
                // Super admin can always see all statuses including deleted
                includeSoftDeleted: isSuperAdmin ? true : false,
            }
            const response = await getAllUsers(params)
            setUsers(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error(t("users.toasts.loadFailed"))
        } finally {
            setLoading(false)
        }
    }, [search, statusFilter, roleFilter, sortBy, sortDir, page, size, isSuperAdmin, t])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0)
            fetchUsers()
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    // Handle edit user
    const handleEditClick = (user: AdminUserResponse) => {
        setSelectedUser(user)
        setEditForm({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
        })
        setEditDialogOpen(true)
    }

    const handleEditSave = async () => {
        if (!selectedUser) return
        try {
            await updateUser(selectedUser.userId, {
                fullName: editForm.fullName,
                email: editForm.email,
                role: editForm.role as "admin" | "user",
                status: editForm.status as "active" | "suspended" | "deleted",
            })
            toast.success(t("users.toasts.updateSuccess"))
            setEditDialogOpen(false)
            fetchUsers()
        } catch (error) {
            toast.error(t("users.toasts.updateFailed"))
        }
    }

    // Handle delete user
    const handleDeleteClick = (user: AdminUserResponse) => {
        setSelectedUser(user)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return
        try {
            await deleteUser(selectedUser.userId)
            toast.success(t("users.toasts.softDeleteSuccess"))
            setDeleteDialogOpen(false)
            fetchUsers()
        } catch (error) {
            toast.error(t("users.toasts.deleteFailed"))
        }
    }

    const handleHardDeleteConfirm = async () => {
        if (!selectedUser) return
        try {
            await hardDeleteUser(selectedUser.userId)
            toast.success(t("users.toasts.permanentDeleteSuccess"))
            setDeleteDialogOpen(false)
            fetchUsers()
        } catch (error) {
            toast.error(t("users.toasts.permanentDeleteFailed"))
        }
    }

    // Handle credit update
    const handleCreditClick = (user: AdminUserResponse) => {
        setSelectedUser(user)
        setCreditValue(user.credit)
        setCreditDialogOpen(true)
    }

    const handleCreditSave = async () => {
        if (!selectedUser) return
        try {
            await updateUserCredit(selectedUser.userId, creditValue)
            toast.success(t("users.toasts.creditSuccess"))
            setCreditDialogOpen(false)
            fetchUsers()
        } catch (error) {
            toast.error(t("users.toasts.creditFailed"))
        }
    }

    // Handle password change
    const handlePasswordClick = (user: AdminUserResponse) => {
        setSelectedUser(user)
        setNewPassword("")
        setPasswordDialogOpen(true)
    }

    const handlePasswordSave = async () => {
        if (!selectedUser || !newPassword) return
        try {
            await changeUserPassword(selectedUser.userId, newPassword)
            toast.success(t("users.toasts.passwordSuccess"))
            setPasswordDialogOpen(false)
        } catch (error) {
            toast.error(t("users.toasts.passwordFailed"))
        }
    }

    // Handle payment history
    const handlePaymentClick = async (user: AdminUserResponse) => {
        setSelectedUser(user)
        setPaymentLoading(true)
        setPaymentDialogOpen(true)
        try {
            const response = await getUserPaymentHistory(user.userId)
            setPayments(response.content)
        } catch (error) {
            toast.error(t("users.toasts.historyFailed"))
        } finally {
            setPaymentLoading(false)
        }
    }

    // Status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-500"
            case "suspended":
                return "bg-yellow-500"
            case "deleted":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    // Role badge color - admin is red, super_admin is purple, user is blue
    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-red-400"
            case "super_admin":
                return "bg-purple-500"
            default:
                return "bg-blue-500"
        }
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("users.title")}</h1>
                <p className="mt-2 text-muted-foreground">
                    {t("users.showing", { count: users.length, total: totalElements })}
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("users.search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t("users.filters.allStatus")} />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                        <SelectItem value="all">{t("users.filters.allStatus")}</SelectItem>
                        <SelectItem value="active">{t("users.filters.active")}</SelectItem>
                        <SelectItem value="suspended">{t("users.filters.suspended")}</SelectItem>
                        {isSuperAdmin && <SelectItem value="deleted">{t("users.filters.deleted")}</SelectItem>}
                    </SelectContent>
                </Select>
                <Select value={roleFilter || "all"} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(0); }}>
                    <SelectTrigger className="w-[180px] ">
                        <SelectValue placeholder={t("users.filters.allRoles")} />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                        <SelectItem value="all">{t("users.filters.allRoles")}</SelectItem>
                        <SelectItem value="admin">{t("users.filters.admin")}</SelectItem>
                        <SelectItem value="user">{t("users.filters.user")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("users.columns.email")}</TableHead>
                            <TableHead>{t("users.columns.fullName")}</TableHead>
                            <TableHead>{t("users.columns.role")}</TableHead>
                            <TableHead>{t("users.columns.status")}</TableHead>
                            <TableHead>{t("users.columns.credit")}</TableHead>
                            <TableHead>{t("users.columns.createdAt")}</TableHead>
                            <TableHead className="text-center">{t("users.columns.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {t("users.noUsers")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.userId}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>
                                        <Badge className={getRoleColor(user.role)}>
                                            {t(`users.filters.${user.role === 'super_admin' ? 'admin' : user.role}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(user.status)}>
                                            {t(`users.filters.${user.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.credit}</TableCell>
                                    <TableCell>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditClick(user)}
                                                title={t("users.actions.edit")}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleCreditClick(user)}
                                                title={t("users.actions.updateCredit")}
                                            >
                                                <CreditCard className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handlePasswordClick(user)}
                                                title={t("users.actions.changePassword")}
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handlePaymentClick(user)}
                                                title={t("users.actions.viewPayments")}
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(user)}
                                                title={t("users.actions.delete")}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                        {t("common.page")} {page + 1} {t("common.of")} {totalPages || 1}
                    </p>
                    <Select value={size.toString()} onValueChange={(v) => { setSize(parseInt(v)); setPage(0); }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="1000">1000</SelectItem>
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
                        {t("common.previous")}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        {t("common.next")}
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("users.dialogs.editUser")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("users.columns.fullName")}</Label>
                            <Input
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("users.columns.email")}</Label>
                            <Input
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("users.columns.role")}</Label>
                            {isSuperAdmin ? (
                                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">{t("users.filters.admin")}</SelectItem>
                                        <SelectItem value="user">{t("users.filters.user")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <Input value={t(`users.filters.${editForm.role}`)} disabled className="bg-muted" />
                                    <span className="text-xs text-muted-foreground">{t("users.dialogs.roleChangeRestricted")}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>{t("users.columns.status")}</Label>
                            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                    <SelectItem value="active">{t("users.filters.active")}</SelectItem>
                                    <SelectItem value="suspended">{t("users.filters.suspended")}</SelectItem>
                                    <SelectItem value="deleted">{t("users.filters.deleted")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            {t("users.dialogs.cancel")}
                        </Button>
                        <Button onClick={handleEditSave}>{t("users.dialogs.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("users.delete.confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isSuperAdmin
                                ? (selectedUser?.status === "deleted"
                                    ? t("users.delete.warningAlreadyDeleted")
                                    : t("users.delete.warningPermanent"))
                                : t("users.delete.warning")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("users.dialogs.cancel")}</AlertDialogCancel>
                        {isSuperAdmin ? (
                            <>
                                {/* Only show soft delete if user is NOT already deleted */}
                                {selectedUser?.status !== "deleted" && (
                                    <AlertDialogAction onClick={handleDeleteConfirm} className="bg-yellow-600 hover:bg-yellow-700">
                                        {t("users.delete.soft")}
                                    </AlertDialogAction>
                                )}
                                <AlertDialogAction onClick={handleHardDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                                    {t("users.delete.permanent")}
                                </AlertDialogAction>
                            </>
                        ) : (
                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                                {t("users.actions.delete")}
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Credit Dialog */}
            <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("users.dialogs.updateCredit")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("users.columns.credit")}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={creditValue}
                                onChange={(e) => setCreditValue(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>
                            {t("users.dialogs.cancel")}
                        </Button>
                        <Button onClick={handleCreditSave}>{t("users.dialogs.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("users.dialogs.changePassword")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("users.dialogs.newPassword")}</Label>
                            <Input
                                type="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                            {t("users.dialogs.cancel")}
                        </Button>
                        <Button onClick={handlePasswordSave}>{t("users.dialogs.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment History Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{t("users.dialogs.paymentHistory")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("payments.columns.code")}</TableHead>
                                    <TableHead>{t("payments.columns.amount")}</TableHead>
                                    <TableHead>{t("payments.columns.status")}</TableHead>
                                    <TableHead>{t("payments.columns.date")}</TableHead>
                                    <TableHead>{t("payments.columns.gateway")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            {t("users.dialogs.noPaymentHistory")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-mono text-sm">
                                                {payment.transactionCode || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {payment.amount?.toLocaleString()} VND
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    payment.status === "processed" ? "bg-green-500" :
                                                        payment.status === "pending" ? "bg-yellow-500" :
                                                            "bg-gray-500"
                                                }>
                                                    {t(`payments.filters.${payment.status}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {payment.date ? new Date(payment.date).toLocaleString() : "-"}
                                            </TableCell>
                                            <TableCell>{payment.gateway || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                            {t("users.dialogs.cancel")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
