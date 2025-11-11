"use client"

import { GoogleLogin, CredentialResponse } from "@react-oauth/google"
import { Chrome } from "lucide-react"

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void
  onError: () => void
  text?: "signin_with" | "signup_with"
}

export function GoogleLoginButton({ onSuccess, onError, text = "signin_with" }: GoogleLoginButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  // Nếu không có clientId, hiển thị button disabled thay vì GoogleLogin component
  if (!clientId) {
    return (
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 hover:bg-muted transition-colors disabled:opacity-50"
        disabled
        title="Google Client ID chưa được cấu hình"
      >
        <Chrome className="h-5 w-5" />
        <span className="text-sm font-medium">Google</span>
      </button>
    )
  }

  return (
    <div className="w-full flex items-center justify-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap={false}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        locale="vi"
      />
    </div>
  )
}

