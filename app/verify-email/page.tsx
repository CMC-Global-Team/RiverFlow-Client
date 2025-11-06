"use client" // Bắt buộc dùng client component

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import { isAxiosError } from 'axios'

import { Loader2, CircleCheck, CircleAlert } from "lucide-react"

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
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') // Lấy token từ URL

    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState('Đang xác thực tài khoản của bạn...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Token không hợp lệ hoặc bị thiếu.')
            return
        }

        const verifyToken = async () => {
            try {
                const response = await apiClient.get(`/api/auth/verify-email?token=${token}`)
                setStatus('success')
                setMessage(response.data.message || 'Xác thực tài khoản thành công!')
                alert('Xác thực thành công! Bạn sẽ được chuyển đến trang đăng nhập.')
                setTimeout(() => {
                    router.push('/?showLogin=true')
                }, 1000)
            } catch (error) {
                setStatus('error')
                if (isAxiosError(error) && error.response) {
                    setMessage(error.response.data.message || 'Token không hợp lệ hoặc đã hết hạn.')
                } else {
                    setMessage('Đã xảy ra lỗi. Vui lòng thử lại.')
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
                        <h1 className="text-2xl font-semibold">Đang xác thực...</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                )}

                {/* --- Trạng thái Success --- */}
                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <CircleCheck className="h-12 w-12 text-green-500" />
                        <h1 className="text-2xl font-semibold">Thành công!</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                )}

                {/* --- Trạng thái Error --- */}
                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <CircleAlert className="h-12 w-12 text-red-500" />
                        <h1 className="text-2xl font-semibold">Đã xảy ra lỗi</h1>
                        <p className="text-muted-foreground">{message}</p>
                        
                        {/* 3. Sửa lại button này để dùng Tailwind và đúng đường dẫn */}
                        <button 
                            onClick={() => router.push('/?showLogin=true')} // Chuyển về trang chủ để mở modal
                            className="mt-4 w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                            Quay lại trang đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}