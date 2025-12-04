import React, { FormEvent, useState } from 'react';
import { AdminUserResponse, AdminUpdateUserRequest } from '@/types/user.types';
import { X } from 'lucide-react';

interface UserFormModalProps {
    isOpen: boolean;
    user: AdminUserResponse | null;
    onSubmit: (data: AdminUpdateUserRequest) => Promise<void>;
    onClose: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, user, onSubmit, onClose }) => {
    const [formData, setFormData] = useState<AdminUpdateUserRequest>({
        fullName: '',
        email: '',
        credit: 3,
        role: 'user',
        status: 'active',
        password: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Reset form when user changes
    React.useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName,
                email: user.email,
                credit: user.credit,
                role: user.role,
                status: user.status,
                password: '' // Don't populate password
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                credit: 3,
                role: 'user',
                status: 'active',
                password: ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Clone data để xử lý
            const dataToSubmit: any = { ...formData };

            // 1. Xử lý password: Nếu rỗng thì xóa khỏi request (không update)
            if (!dataToSubmit.password || dataToSubmit.password.trim() === '') {
                delete dataToSubmit.password;
            }

            // 2. Xử lý email: Nếu đang edit (user tồn tại), xóa email để tránh lỗi duplicate
            if (user) {
                delete dataToSubmit.email;
            }

            console.log('Submitting user data:', dataToSubmit); // Debug log
            await onSubmit(dataToSubmit);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            // Error handled by parent
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                        <h2 className="text-xl font-semibold text-foreground">
                            {user ? 'Chỉnh Sửa Người Dùng' : 'Tạo Người Dùng Mới'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            disabled={submitting}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email Field */}
                            <div className="col-span-2">
                                <label className="block mb-2 font-medium text-sm text-foreground">
                                    Email <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={!!user}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground disabled:bg-muted disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    placeholder="user@example.com"
                                />
                                {user && (
                                    <p className="text-muted-foreground text-xs mt-1">
                                        Email không thể thay đổi
                                    </p>
                                )}
                            </div>

                            {/* Full Name Field */}
                            <div className="col-span-2">
                                <label className="block mb-2 font-medium text-sm text-foreground">
                                    Họ và Tên <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="col-span-2">
                                <label className="block mb-2 font-medium text-sm text-foreground">
                                    {user ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password || ''}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required={!user}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    placeholder={user ? "Nhập mật khẩu mới" : "Nhập mật khẩu"}
                                />
                            </div>

                            {/* Credit (Token) Field */}
                            <div>
                                <label className="block mb-2 font-medium text-sm text-foreground">
                                    Token (Credit)
                                </label>
                                <input
                                    type="number"
                                    value={formData.credit}
                                    onChange={e => setFormData({ ...formData, credit: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>

                            {/* Role Field */}
                            <div>
                                <label className="block mb-2 font-medium text-sm text-foreground">
                                    Vai Trò
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Status Field */}
                            <div className="col-span-2">
                                <label className="block mb-2 font-medium text-sm text-foreground">
                                    Trạng Thái
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'suspended' | 'deleted' })}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                >
                                    <option value="active">Đang hoạt động (Active)</option>
                                    <option value="suspended">Tạm khóa (Suspended)</option>
                                    <option value="deleted">Đã xóa (Deleted)</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-border mt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                {submitting ? 'Đang xử lý...' : (user ? 'Cập Nhật' : 'Tạo Mới')}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UserFormModal;
