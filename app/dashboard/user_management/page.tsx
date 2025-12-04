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
    const { t } = useTranslation("userManagement");
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
                setError('Định dạng dữ liệu từ server không đúng');
                setUsers([]);
            }
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Không thể tải danh sách người dùng';
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
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

        try {
            await deleteUser(id);
            await fetchUsers(currentPage, pageSize);
            alert('Xóa người dùng thành công');
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Xóa người dùng thất bại';
            alert(errorMsg);
            console.error('Error deleting user:', e);
        }
    };

    const handleSubmit = async (formData: AdminUpdateUserRequest) => {
        if (!editingUser) {
            alert('Chức năng tạo user mới cần được implement ở backend');
            return;
        }

        try {
            await updateUser(editingUser.userId, formData);
            setShowForm(false);
            await fetchUsers(currentPage, pageSize);
            alert('Cập nhật thành công');
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Cập nhật thất bại';
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
                                    <h1 className="text-3xl font-bold text-foreground">Quản Lý Người Dùng</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        {filteredAndSortedUsers.length} người dùng
                                        {filteredAndSortedUsers.length !== users.length &&
                                            ` (${users.length} tổng)`
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={openCreateForm}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                                >
                                    <Plus className="h-5 w-5" />
                                    Tạo Người Dùng Mới
                                </button>
                            </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                                <div className="flex-1">
                                    <p className="font-semibold">Lỗi</p>
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
                                    ← Trang Trước
                                </button>

                                <span className="text-sm text-muted-foreground">
                                    Trang <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Trang Sau →
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
