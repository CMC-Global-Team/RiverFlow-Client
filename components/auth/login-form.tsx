"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, Lock, Github, Chrome } from "lucide-react"
import { useSignIn } from "@/hooks/auth/useSignIn"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onForgotClick: () => void
}

export default function LoginForm({ onForgotClick }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const { signIn, isLoading, error, data } = useSignIn()
  const { toast } = useToast()
  const router = useRouter()

  // Hiển thị thông báo khi có lỗi
  useEffect(() => {
    if (error) {
      // Kiểm tra nếu là lỗi email chưa xác thực (status 403)
      const isUnverifiedEmail = error.status === 403
      
      toast({
        variant: "destructive",
        title: isUnverifiedEmail ? "Email chưa được xác thực" : "Đăng nhập thất bại",
        description: error.message,
      })
    }
  }, [error, toast])

  // Hiển thị thông báo và chuyển trang khi đăng nhập thành công
  useEffect(() => {
    if (data) {
      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng trở lại, ${data.fullName}!`,
      })
      
      // Chuyển hướng đến dashboard sau 1 giây
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    }
  }, [data, toast, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation cơ bản
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ email và mật khẩu!",
      })
      return
    }

    // Gọi API đăng nhập
    await signIn({
      email,
      password,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-input pl-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-input pl-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>
      </div>

      {/* Forgot Password Link */}
      <button
        type="button"
        onClick={onForgotClick}
        className="text-sm text-primary hover:text-primary/80 transition-colors"
      >
        Forgot password?
      </button>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 hover:bg-muted transition-colors"
        >
          <Github className="h-5 w-5" />
          <span className="text-sm font-medium">GitHub</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 hover:bg-muted transition-colors"
        >
          <Chrome className="h-5 w-5" />
          <span className="text-sm font-medium">Google</span>
        </button>
      </div>
    </form>
  )
}
