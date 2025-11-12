"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X, Loader2, User, Mail, Globe, Clock, Upload, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/hooks/auth/useAuth"
import { getUserProfile, updateUserProfile } from "@/services/auth/update-user.service"
import { uploadAvatar } from "@/services/auth/upload-avatar.service"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { useToast } from "@/hooks/use-toast"
import type { UpdateUserRequest } from "@/types/user.types"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
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
          if (profile.avatar) {
            // Convert relative path to absolute URL
            const absoluteUrl = getAvatarUrl(profile.avatar)
            if (absoluteUrl) {
              setAvatarPreview(absoluteUrl)
            }
          }
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
    } else if (!isOpen) {
      // Reset when modal closes
      setAvatarPreview(null)
    }
  }, [isOpen, user])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh",
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Kích thước file phải nhỏ hơn 5MB",
      })
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploadingAvatar(true)
    try {
      const response = await uploadAvatar(file)
      setFormData({ ...formData, avatar: response.url })
      
      // Update avatar in auth context immediately
      if (user) {
        updateUser({
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatar: response.url, // New avatar URL from server
        })
      }
      
      toast({
        title: "Thành công",
        description: "Upload avatar thành công",
      })
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể upload avatar",
      })
      setAvatarPreview(formData.avatar || null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName.trim()) {
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
        avatar: updatedProfile.avatar,
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

  if (!isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="relative w-full max-w-4xl mx-4 bg-card rounded-xl shadow-2xl border border-border"
        style={{ 
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Cập nhật thông tin cá nhân</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
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
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Avatar Upload */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                      <ImageIcon className="h-4 w-4" />
                      Avatar
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Avatar preview" 
                              className="h-full w-full object-cover"
                              onError={() => setAvatarPreview(null)}
                            />
                          ) : (
                            <User className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={isLoading || isUploadingAvatar}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading || isUploadingAvatar}
                          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                          <Upload className="h-4 w-4" />
                          {isUploadingAvatar ? "Đang upload..." : "Chọn ảnh"}
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG hoặc GIF (tối đa 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

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
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
                      maxLength={100}
                    />
                  </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  placeholder="Email"
                  disabled={true}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email không thể thay đổi
                </p>
              </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
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
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
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
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.fullName.trim()}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

  // Use portal to render modal to body, avoiding parent container constraints
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return null
}
