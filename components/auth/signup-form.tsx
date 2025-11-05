"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, Lock, User, Github, Chrome } from "lucide-react"
import { useRegister } from "@/hooks/auth/useRegister"
import { useToast } from "@/hooks/use-toast"

export default function SignupForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const { register, isLoading, error, data } = useRegister()
  const { toast } = useToast()

  // Hiển thị thông báo khi có lỗi
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.message,
      })
    }
  }, [error, toast])

  // Hiển thị thông báo khi đăng ký thành công
  useEffect(() => {
    if (data) {
      toast({
        title: "Đăng ký thành công!",
        description: data.message || `Chào mừng ${data.fullName}! Vui lòng kiểm tra email để xác thực tài khoản.`,
      })
      // Reset form
      setFullName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    }
  }, [data, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp!",
      })
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự!",
      })
      return;
    }

    // Gọi API đăng ký
    await register({
      fullName,
      email,
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border border-border bg-input pl-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            required
            minLength={3}
            maxLength={100}
          />
        </div>
      </div>

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
            minLength={6}
            maxLength={100}
          />
        </div>
        <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 6 ký tự</p>
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-input pl-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
        {isLoading ? "Creating account..." : "Create Account"}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
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
