"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { GoogleOAuthProviderWrapper } from "@/components/auth/GoogleOAuthProvider"
import { AuthProvider } from "@/contexts/auth/AuthContext"
import "@/i18n/i18n"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <GoogleOAuthProviderWrapper>
        <AuthProvider>
          {children}
        </AuthProvider>
      </GoogleOAuthProviderWrapper>
    </ThemeProvider>
  )
}



