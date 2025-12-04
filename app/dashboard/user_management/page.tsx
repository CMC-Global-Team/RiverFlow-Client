"use client";
import React, { useEffect, useState } from 'react';
import { AdminUserResponse, AdminUpdateUserRequest } from '@/types/user.types';
import { getAllUsers, updateUser, deleteUser } from '@/services/user/user.service';
import UserTable from '@/components/user/UserTable';
import UserForm from '@/components/user/UserForm';

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUserResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);

    const fetchUsers = async (page: number = 0, size: number = 10) => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllUsers(page, size, 'createdAt', 'desc');
            console.log('API Response:', data); // Debug log

            // Check if response has the expected structure
            if (data && data.content && Array.isArray(data.content)) {
                console.log('Setting users:', data.content.length, 'users'); // Debug
                setUsers(data.content);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(data.number || 0);
            } else {
                console.error('Unexpected API response format:', data);
                setError('Định dạng dữ liệu từ server không đúng');
                setUsers([]); // Set empty array to prevent undefined error
            }
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Không thể tải danh sách người dùng';
            setError(errorMsg);
            console.error('Error fetching users:', e);
            console.error('Error details:', e.response?.data); // More detailed error logging
            setUsers([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, pageSize);
    }, []);

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
            throw e; // Re-throw to let form handle it
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchUsers(newPage, pageSize);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: '700', color: '#333' }}>
                Quản Lý Người Dùng
            </h1>

            {error && (
                <div style={{
                    color: '#721c24',
                    padding: '1rem',
                    backgroundColor: '#f8d7da',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    border: '1px solid #f5c6cb'
                }}>
                    {error}
                </div>
            )}

            <button
                onClick={openCreateForm}
                style={{
                    marginBottom: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
                + Tạo Người Dùng Mới
            </button>

            {showForm && (
                <UserForm
                    user={editingUser}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <UserTable
                users={users}
                loading={loading}
                onEdit={openEditForm}
                onDelete={handleDelete}
            />

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: currentPage === 0 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}
                    >
                        ← Trang Trước
                    </button>

                    <span style={{ fontSize: '0.875rem', color: '#666' }}>
                        Trang <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: currentPage >= totalPages - 1 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}
                    >
                        Trang Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
