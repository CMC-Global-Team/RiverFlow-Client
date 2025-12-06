"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
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
    AdminSearchParams,
} from "@/services/admin/admin-user.service"
import { AdminUserResponse, PageResponse } from "@/types/user.types"
import { AdminPaymentHistoryResponse } from "@/types/payment.types"

export default function UsersManagePage() {
    const { t } = useTranslation("adminSideBar")

    // State for users list
    const [users, setUsers] = useState<AdminUserResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    // Search and filter state - exclude deleted users by default
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("active")
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
            }
            const response = await getAllUsers(params)
            setUsers(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }, [search, statusFilter, roleFilter, sortBy, sortDir, page, size])

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
            toast.success("User updated successfully")
            setEditDialogOpen(false)
            fetchUsers()
        } catch (error) {
            toast.error("Failed to update user")
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
            toast.success("User deleted successfully")
            setDeleteDialogOpen(false)
            fetchUsers()
        } catch (error) {
            toast.error("Failed to delete user")
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
            toast.success("Credit updated successfully")
            setCreditDialogOpen(false)
            fetchUsers()
        } catch (error) {
            toast.error("Failed to update credit")
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
            toast.success("Password changed successfully")
            setPasswordDialogOpen(false)
        } catch (error) {
            toast.error("Failed to change password")
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
            toast.error("Failed to load payment history")
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

    // Role badge color - admin is red, user is blue
    const getRoleColor = (role: string) => {
        return role === "admin" ? "bg-red-400" : "bg-blue-500"
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("userManage")}</h1>
                <p className="mt-2 text-muted-foreground">
                    {t("showing")} {users.length} {t("of")} {totalElements} {t("results")}
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t("allStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("allStatus")}</SelectItem>
                        <SelectItem value="active">{t("active")}</SelectItem>
                        <SelectItem value="suspended">{t("suspended")}</SelectItem>
                        <SelectItem value="deleted">{t("deleted")}</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={roleFilter || "all"} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(0); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t("allRoles")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("allRoles")}</SelectItem>
                        <SelectItem value="admin">{t("admin")}</SelectItem>
                        <SelectItem value="user">{t("user")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("email")}</TableHead>
                            <TableHead>{t("fullName")}</TableHead>
                            <TableHead>{t("role")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                            <TableHead>{t("credit")}</TableHead>
                            <TableHead>{t("createdAt")}</TableHead>
                            <TableHead className="text-right">{t("actions")}</TableHead>
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
                                    {t("noUsers")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.userId}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>
                                        <Badge className={getRoleColor(user.role)}>
                                            {t(user.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(user.status)}>
                                            {t(user.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.credit}</TableCell>
                                    <TableCell>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditClick(user)}
                                                title={t("edit")}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleCreditClick(user)}
                                                title={t("updateCredit")}
                                            >
                                                <CreditCard className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handlePasswordClick(user)}
                                                title={t("changePassword")}
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handlePaymentClick(user)}
                                                title={t("viewPayments")}
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(user)}
                                                title={t("delete")}
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

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("editUser")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("fullName")}</Label>
                            <Input
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("email")}</Label>
                            <Input
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("role")}</Label>
                            <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">{t("admin")}</SelectItem>
                                    <SelectItem value="user">{t("user")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("status")}</Label>
                            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t("active")}</SelectItem>
                                    <SelectItem value="suspended">{t("suspended")}</SelectItem>
                                    <SelectItem value="deleted">{t("deleted")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleEditSave}>{t("save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteWarning")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Credit Dialog */}
            <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("updateCredit")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("credit")}</Label>
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
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleCreditSave}>{t("save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("changePassword")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("newPassword")}</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handlePasswordSave}>{t("save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment History Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{t("paymentHistory")}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("transactionCode")}</TableHead>
                                    <TableHead>{t("amount")}</TableHead>
                                    <TableHead>{t("status")}</TableHead>
                                    <TableHead>{t("date")}</TableHead>
                                    <TableHead>{t("gateway")}</TableHead>
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
                                            No payment history found
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
                                                    {payment.status}
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
                            {t("cancel")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
