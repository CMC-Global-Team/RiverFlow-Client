import React from 'react';
import { AdminUserResponse } from '@/types/user.types';

interface UserTableProps {
    users: AdminUserResponse[];
    loading: boolean;
    onEdit: (user: AdminUserResponse) => void;
    onDelete: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    // Safety check for users array
    if (!users || !Array.isArray(users)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Không có dữ liệu</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                            ID
                        </th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                            Email
                        </th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                            Tên
                        </th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                            Vai Trò
                        </th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                            Trạng Thái
                        </th>
                        <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                            Thao Tác
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                Không có người dùng nào
                            </td>
                        </tr>
                    ) : (
                        users.map(user => {
                            console.log('Rendering user:', user.userId, 'Status:', user.status); // Debug log
                            return (
                                <tr key={user.userId} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                        {user.userId}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                        {user.email}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                        {user.fullName}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: user.role === 'ADMIN' ? '#ffc107' : '#17a2b8',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: user.status === 'ACTIVE' ? '#28a745' : '#dc3545',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                        }}>
                                            {user.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => onEdit(user)}
                                            style={{
                                                marginRight: '0.5rem',
                                                padding: '0.375rem 0.75rem',
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
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => onDelete(user.userId)}
                                            style={{
                                                padding: '0.375rem 0.75rem',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
