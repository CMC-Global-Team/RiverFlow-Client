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
            style={{
                marginBottom: '1.5rem',
                border: '1px solid #ddd',
                padding: '1.5rem',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
            }}
        >
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
                {user ? 'Chỉnh Sửa Người Dùng' : 'Tạo Người Dùng Mới'}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#333'
                }}>
                    Email: <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!user} // Disable email edit for existing users
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        backgroundColor: user ? '#e9ecef' : 'white',
                        cursor: user ? 'not-allowed' : 'text'
                    }}
                    placeholder="user@example.com"
                />
                {user && (
                    <small style={{ color: '#6c757d', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        Email không thể thay đổi
                    </small>
                )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#333'
                }}>
                    Tên: <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem'
                    }}
                    placeholder="Nhập tên người dùng"
                />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: submitting ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {submitting ? 'Đang xử lý...' : (user ? 'Cập Nhật' : 'Tạo Mới')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    }}
                >
                    Hủy
                </button>
            </div>
        </form>
    );
};

export default UserForm;
