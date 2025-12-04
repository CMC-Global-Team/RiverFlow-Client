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
        fullName: user?.fullName || '',
        email: user?.email || ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Reset form when user changes
    React.useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName,
                email: user.email
            });
        } else {
            setFormData({
                fullName: '',
                email: ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
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
                    className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
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
                        {/* Email Field */}
                        <div>
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
                        <div>
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

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
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
