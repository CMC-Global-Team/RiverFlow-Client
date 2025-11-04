"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { useForgotPassword } from "@/hooks/auth/useForgotPassword"
import { useToast } from "@/hooks/use-toast"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  
  const { sendResetLink, isLoading, error, data, clearError } = useForgotPassword()
  const { toast } = useToast()
  
  // Xóa lỗi khi user thay đổi email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      clearError()
    }
  }

  // Hiển thị thông báo khi có lỗi
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Gửi yêu cầu thất bại",
        description: error.message,
      })
    }
  }, [error, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập email!",
      })
      return
    }

    // Gọi API forgot password
    await sendResetLink({ email })
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </button>

      {!data ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
          </p>

          {/* Hiển thị lỗi từ server */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive font-medium">{error.message}</p>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className={`w-full rounded-lg border ${error ? 'border-destructive' : 'border-border'} bg-input pl-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {isLoading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
          </button>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Kiểm tra email của bạn</h3>
            <p className="mt-2 text-sm text-muted-foreground">{data.message}</p>
          </div>
          <button
            onClick={onBack}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Quay lại đăng nhập
          </button>
        </div>
      )}
    </div>
  )
}
