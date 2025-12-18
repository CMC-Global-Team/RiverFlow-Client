"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { AdminUserResponse, AdminUpdateUserRequest } from '@/types/user.types';
import { getAllUsers, updateUser, deleteUser } from '@/services/user/user.service';
import UserTable from '@/components/user/UserTable';
import UserFormModal from '@/components/user/UserFormModal';
import UserFilterBar from '@/components/user/UserFilterBar';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

function UserManagementContent() {
    const { t } = useTranslation("dashboard");
    const [users, setUsers] = useState<AdminUserResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);

    // Filter and Sort state
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('createdAt');

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);

    const fetchUsers = async (page: number = 0, size: number = 10) => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllUsers(page, size, 'createdAt', 'desc');

            if (data && data.content && Array.isArray(data.content)) {
                setUsers(data.content);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(data.number || 0);
            } else {
                setError(t("userManagement.error"));
                setUsers([]);
            }
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || t("userManagement.error");
            setError(errorMsg);
            console.error('Error fetching users:', e);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, pageSize);
    }, []);

    // Filter and Sort users
    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];

        // Filter by role
        if (selectedRole !== 'all') {
            result = result.filter(user => user.role === selectedRole);
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            console.log('Filtering by status:', selectedStatus);
            result = result.filter(user => {
                const status = user.status;
                if (status === undefined) {
                    console.warn(`User ${user.email} has undefined status. Available keys:`, Object.keys(user));
                    return false; // Hoặc true nếu muốn hiện
                }
                console.log(`User ${user.email} status:`, status);
                // So sánh không phân biệt hoa thường để an toàn
                return String(status).toLowerCase() === selectedStatus.toLowerCase();
            });
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'createdAt':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                case 'updatedAt':
                    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
                case 'fullName':
                    return a.fullName.localeCompare(b.fullName);
                case 'email':
                    return a.email.localeCompare(b.email);
                default:
                    return 0;
            }
        });

        return result;
    }, [users, selectedRole, selectedStatus, sortBy]);

    const openCreateForm = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const openEditForm = (user: AdminUserResponse) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t("userManagement.delete.confirm"))) return;

        try {
            await deleteUser(id);
            await fetchUsers(currentPage, pageSize);
            alert(t("userManagement.delete.success"));
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || t("userManagement.delete.error");
            alert(errorMsg);
            console.error('Error deleting user:', e);
        }
    };

    const handleSubmit = async (formData: AdminUpdateUserRequest) => {
        if (!editingUser) {
            alert(t("userManagement.update.createNotImplemented"));
            return;
        }

        try {
            await updateUser(editingUser.userId, formData);
            setShowForm(false);
            await fetchUsers(currentPage, pageSize);
            alert(t("userManagement.update.success"));
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || t("userManagement.update.error");
            alert(errorMsg);
            console.error('Error updating user:', e);
            throw e;
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchUsers(newPage, pageSize);
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64">
                <DashboardHeader />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 md:p-8">
                        {/* Header with Title and Create Button */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">{t("userManagement.title")}</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        {t("userManagement.total", { count: filteredAndSortedUsers.length, total: users.length })}
                                    </p>
                                </div>
                                <button
                                    onClick={openCreateForm}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                                >
                                    <Plus className="h-5 w-5" />
                                    {t("userManagement.create")}
                                </button>
                            </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                                <div className="flex-1">
                                    <p className="font-semibold">{t("userManagement.error")}</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Filter Bar */}
                        <div className="mb-6">
                            <UserFilterBar
                                selectedRole={selectedRole}
                                onRoleChange={setSelectedRole}
                                selectedStatus={selectedStatus}
                                onStatusChange={setSelectedStatus}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>

                        {/* User Table */}
                        <UserTable
                            users={filteredAndSortedUsers}
                            loading={loading}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                        />

                        {/* Pagination Controls */}
                        {!loading && totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-4">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    ← {t("userManagement.table.prev")}
                                </button>

                                <span className="text-sm text-muted-foreground">
                                    {t("userManagement.table.page")} <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {t("userManagement.table.next")} →
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* User Form Modal */}
            <UserFormModal
                isOpen={showForm}
                user={editingUser}
                onSubmit={handleSubmit}
                onClose={() => setShowForm(false)}
            />
        </div>
    );
}

export default function UserManagementPage() {
    return (
        <ProtectedRoute>
            <UserManagementContent />
        </ProtectedRoute>
    );
}
