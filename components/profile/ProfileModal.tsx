"use client"

import { useState, useEffect } from "react"
import { X, Loader2, User, Mail, Image, Globe, Clock } from "lucide-react"
import { useAuth } from "@/hooks/auth/useAuth"
import { getUserProfile, updateUserProfile } from "@/services/auth/update-user.service"
import { useToast } from "@/hooks/use-toast"
import type { UpdateUserRequest } from "@/types/user.types"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  const [formData, setFormData] = useState<UpdateUserRequest>({
    fullName: "",
    email: "",
    avatar: "",
    preferredLanguage: "en",
    timezone: "UTC",
  })

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setIsLoadingProfile(true)
      getUserProfile()
        .then((profile) => {
          setFormData({
            fullName: profile.fullName || "",
            email: profile.email || "",
            avatar: profile.avatar || "",
            preferredLanguage: profile.preferredLanguage || "en",
            timezone: profile.timezone || "UTC",
          })
        })
        .catch((error) => {
          console.error("Error loading profile:", error)
          // Fallback to current user data
          setFormData({
            fullName: user.fullName || "",
            email: user.email || "",
            avatar: "",
            preferredLanguage: "en",
            timezone: "UTC",
          })
        })
        .finally(() => {
          setIsLoadingProfile(false)
        })
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
      })
      return
    }

    setIsLoading(true)
    try {
      const updatedProfile = await updateUserProfile(formData)
      
      // Update auth context
      updateUser({
        userId: updatedProfile.userId,
        email: updatedProfile.email,
        fullName: updatedProfile.fullName,
        role: user?.role || "USER",
      })

      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      })
      
      onClose()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="relative w-full max-w-2xl mx-4 bg-card rounded-xl shadow-2xl border border-border animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cập nhật thông tin cá nhân</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Họ và tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  maxLength={100}
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập email"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Image className="h-4 w-4" />
                  URL Avatar
                </label>
                <input
                  type="url"
                  value={formData.avatar || ""}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  maxLength={500}
                />
                {formData.avatar && (
                  <div className="mt-2">
                    <img 
                      src={formData.avatar} 
                      alt="Avatar preview" 
                      className="h-20 w-20 rounded-full object-cover border border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Preferred Language */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Globe className="h-4 w-4" />
                  Ngôn ngữ ưa thích
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  Múi giờ
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.fullName.trim() || !formData.email.trim()}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

