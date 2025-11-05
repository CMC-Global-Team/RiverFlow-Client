"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react"
import { useResetPassword } from "@/hooks/auth/useResetPassword"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)

  const { resetUserPassword, isLoading, error, data } = useResetPassword()

  // Validate token khi component mount
  useEffect(() => {
    const validateToken = async () => {
      // Nếu không có token, redirect về home
      if (!token) {
        router.push("/")
        return
      }

      // Validate token (đơn giản là kiểm tra có token hay không)
      // Trong thực tế, token sẽ được validate khi submit form
      setIsValidatingToken(false)
      setIsTokenValid(true)
    }

    validateToken()
  }, [token, router])

  // Redirect về login sau khi reset thành công
  useEffect(() => {
    if (data) {
      setTimeout(() => {
        router.push("/")
      }, 3000)
    }
  }, [data, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")

    // Validation
    if (!newPassword || !confirmPassword) {
      setValidationError("Vui lòng nhập đầy đủ thông tin!")
      return
    }

    if (newPassword.length < 6) {
      setValidationError("Mật khẩu phải có ít nhất 6 ký tự!")
      return
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Mật khẩu xác nhận không khớp!")
      return
    }

    // Gọi API reset password
    try {
      await resetUserPassword({
        token: token!,
        newPassword,
        confirmPassword,
      })
    } catch (err) {
      // Error đã được handle trong hook
    }
  }

  // Loading state khi đang validate token
  if (isValidatingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // Nếu token không hợp lệ (không có token)
  if (!isTokenValid) {
    return null
  }

  // Success state
  if (data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-8 shadow-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Đặt lại mật khẩu thành công!</h2>
            <p className="text-muted-foreground mb-6">{data.message}</p>
            <p className="text-sm text-muted-foreground">
              Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Đặt lại mật khẩu</h1>
            <p className="mt-2 text-muted-foreground">Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Validation Error */}
            {validationError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive font-medium">{validationError}</p>
              </div>
            )}

            {/* API Error */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive font-medium">{error.message}</p>
              </div>
            )}

            {/* New Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setValidationError("")
                  }}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full rounded-lg border border-border bg-input pl-10 pr-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 6 ký tự</p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setValidationError("")
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full rounded-lg border border-border bg-input pl-10 pr-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Quay lại trang đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

