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
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
        );
    }

    // Safety check for users array
    if (!users || !Array.isArray(users)) {
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Không có dữ liệu</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card shadow-sm rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-semibold text-sm">
                            ID
                        </th>
                        <th className="border border-border p-3 text-left font-semibold text-sm">
                            Email
                        </th>
                        <th className="border border-border p-3 text-left font-semibold text-sm">
                            Tên
                        </th>
                        <th className="border border-border p-3 text-left font-semibold text-sm">
                            Vai Trò
                        </th>
                        <th className="border border-border p-3 text-left font-semibold text-sm">
                            Trạng Thái
                        </th>
                        <th className="border border-border p-3 text-center font-semibold text-sm">
                            Thao Tác
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                Không có người dùng nào
                            </td>
                        </tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.userId} className="border-b border-border hover:bg-muted/30 transition-colors">
                                <td className="border border-border p-3 text-sm">
                                    {user.userId}
                                </td>
                                <td className="border border-border p-3 text-sm">
                                    {user.email}
                                </td>
                                <td className="border border-border p-3 text-sm">
                                    {user.fullName}
                                </td>
                                <td className="border border-border p-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'ADMIN'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-blue-500 text-white'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="border border-border p-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'ACTIVE'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                        }`}>
                                        {user.status || 'N/A'}
                                    </span>
                                </td>
                                <td className="border border-border p-3 text-center">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="mr-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => onDelete(user.userId)}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
