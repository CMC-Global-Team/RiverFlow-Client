"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"

interface GoogleOAuthProviderWrapperProps {
  children: React.ReactNode
}

export function GoogleOAuthProviderWrapper({ children }: GoogleOAuthProviderWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  if (!clientId) {
    console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google login will not work.")
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}



