"use client" // Bắt buộc dùng client component

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import { isAxiosError } from 'axios'

import { Loader2, CircleCheck, CircleAlert } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <VerifyEmailComponent />
        </Suspense>
    )
}

function VerifyEmailComponent() {
    const { t } = useTranslation("auth")
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') // Lấy token từ URL

    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState(t('verifyEmail.validating'))

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage(t('verifyEmail.invalidToken'))
            return
        }

        const verifyToken = async () => {
            try {
                console.log('Verifying email with token:', token?.substring(0, 8) + '...')
                const response = await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
                console.log('Verification response:', response.data)
                setStatus('success')
                setMessage(response.data.message || t('verifyEmail.successMessage'))
                setTimeout(() => {
                    router.push('/?showLogin=true')
                }, 2000)
            } catch (error) {
                console.error('Verification error:', error)
                setStatus('error')
                if (isAxiosError(error)) {
                    if (error.response) {
                        // Server responded with error
                        const errorMessage = error.response.data?.message ||
                            error.response.data?.error ||
                            'Token không hợp lệ hoặc đã hết hạn.'
                        console.error('Server error response:', error.response.status, errorMessage)
                        setMessage(errorMessage)
                    } else if (error.request) {
                        // Request was made but no response received
                        console.error('No response from server:', error.request)
                        setMessage('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.')
                    } else {
                        // Something else happened
                        console.error('Error setting up request:', error.message)
                        setMessage('Đã xảy ra lỗi. Vui lòng thử lại.')
                    }
                } else {
                    setMessage(t('verifyEmail.errorTitle')) // Fallback generic error
                }
            }
        }
        verifyToken()
    }, [token, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">

            <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-md border border-border text-center">

                {/* --- Trạng thái Loading --- */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h1 className="text-2xl font-semibold">{t('verifyEmail.title')}</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                )}

                {/* --- Trạng thái Success --- */}
                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <CircleCheck className="h-12 w-12 text-green-500" />
                        <h1 className="text-2xl font-semibold">{t('verifyEmail.successTitle')}</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                )}

                {/* --- Trạng thái Error --- */}
                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <CircleCheck className="h-12 w-12 text-red-500" />
                        <h1 className="text-2xl font-semibold">{t('verifyEmail.errorTitle')}</h1>
                        <p className="text-muted-foreground">{message}</p>

                        {/* 3. Sửa lại button này để dùng Tailwind và đúng đường dẫn */}
                        <button
                            onClick={() => router.push('/?showLogin=true')} // Chuyển về trang chủ để mở modal
                            className="mt-4 w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                            {t('verifyEmail.backToLogin')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}