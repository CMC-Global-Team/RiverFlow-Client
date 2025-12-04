import React, { FormEvent, useState } from 'react';
import { AdminUserResponse, AdminUpdateUserRequest } from '@/types/user.types';

interface UserFormProps {
    user: AdminUserResponse | null;
    onSubmit: (data: AdminUpdateUserRequest) => Promise<void>;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<AdminUpdateUserRequest>({
        fullName: user?.fullName || '',
        email: user?.email || ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-6 border border-border p-6 rounded-lg bg-card"
        >
            <h3 className="mt-0 mb-6 text-xl font-semibold">
                {user ? 'Chỉnh Sửa Người Dùng' : 'Tạo Người Dùng Mới'}
            </h3>

            <div className="mb-4">
                <label className="block mb-2 font-semibold text-sm text-foreground">
                    Email: <span className="text-destructive">*</span>
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!user}
                    className="w-full px-3 py-2 border border-input rounded bg-background text-foreground disabled:bg-muted disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="user@example.com"
                />
                {user && (
                    <small className="text-muted-foreground text-xs mt-1 block">
                        Email không thể thay đổi
                    </small>
                )}
            </div>

            <div className="mb-6">
                <label className="block mb-2 font-semibold text-sm text-foreground">
                    Tên: <span className="text-destructive">*</span>
                </label>
                <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Nhập tên người dùng"
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-muted disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                    {submitting ? 'Đang xử lý...' : (user ? 'Cập Nhật' : 'Tạo Mới')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                    Hủy
                </button>
            </div>
        </form>
    );
};

export default UserForm;
