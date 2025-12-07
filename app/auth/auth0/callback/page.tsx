"use client"

import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useRouter } from "next/navigation"
import { useAuth0SignIn } from "@/hooks/auth/useAuth0SignIn"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"

/**
 * Auth0 callback page.
 * Handles the redirect after Auth0 login and exchanges the ID token with the backend.
 */
export default function Auth0CallbackPage() {
    const { t } = useTranslation("other")
    const { isAuthenticated, isLoading: isAuth0Loading, getIdTokenClaims } = useAuth0()
    const { signInWithAuth0, isLoading: isSigningIn } = useAuth0SignIn()
    const { toast } = useToast()
    const router = useRouter()
    const [hasProcessed, setHasProcessed] = useState(false)

    useEffect(() => {
        const handleCallback = async () => {
            if (hasProcessed || isAuth0Loading) {
                return
            }

            if (isAuthenticated) {
                try {
                    const claims = await getIdTokenClaims()
                    if (claims?.__raw) {
                        setHasProcessed(true)
                        const response = await signInWithAuth0(claims.__raw)
                        if (response) {
                            toast({
                                title: t("login.successTitle"),
                                description: t("login.successDesc", { name: response.fullName }),
                            })
                            const redirectPath = response.role === "ADMIN" ? "/admin" : "/dashboard"
                            router.push(redirectPath)
                        } else {
                            throw new Error("Failed to authenticate with backend")
                        }
                    }
                } catch (error) {
                    console.error("Auth0 callback error:", error)
                    toast({
                        variant: "destructive",
                        title: t("login.failedTitle"),
                        description: "Failed to complete authentication",
                    })
                    router.push("/auth")
                }
            } else if (!isAuth0Loading) {
                // Not authenticated and not loading, redirect to auth page
                router.push("/auth")
            }
        }

        handleCallback()
    }, [isAuthenticated, isAuth0Loading, hasProcessed, getIdTokenClaims, signInWithAuth0, toast, router, t])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">
                    {isSigningIn ? "Completing authentication..." : "Processing login..."}
                </p>
            </div>
        </div>
    )
}
