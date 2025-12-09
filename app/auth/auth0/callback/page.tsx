"use client"

import { useEffect, useRef } from "react"
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
    const { isAuthenticated, isLoading: isAuth0Loading, getIdTokenClaims, error: auth0Error } = useAuth0()
    const { signInWithAuth0, isLoading: isSigningIn } = useAuth0SignIn()
    const { toast } = useToast()
    const router = useRouter()
    const processedRef = useRef(false)

    useEffect(() => {
        // Only run once
        if (processedRef.current) {
            return
        }

        // Wait for Auth0 to finish loading
        if (isAuth0Loading) {
            return
        }

        // Handle Auth0 error - only show once and redirect
        if (auth0Error) {
            processedRef.current = true
            console.error("Auth0 error:", auth0Error)
            toast({
                variant: "destructive",
                title: t("login.failedTitle"),
                description: auth0Error.message || "Authentication failed",
            })
            // Use replace to prevent back button issues
            window.location.href = "/"
            return
        }

        // If authenticated, get ID token and authenticate with backend
        if (isAuthenticated) {
            processedRef.current = true

            const processAuth = async () => {
                try {
                    const claims = await getIdTokenClaims()
                    if (claims?.__raw) {
                        const response = await signInWithAuth0(claims.__raw)
                        if (response) {
                            toast({
                                title: t("login.successTitle"),
                                description: t("login.successDesc", { name: response.fullName }),
                            })
                            const redirectPath = response.role === "ADMIN" ? "/admin" : "/dashboard"
                            window.location.href = redirectPath
                        } else {
                            throw new Error("Failed to authenticate with backend")
                        }
                    } else {
                        throw new Error("Failed to get ID token")
                    }
                } catch (error) {
                    console.error("Auth0 callback error:", error)
                    toast({
                        variant: "destructive",
                        title: t("login.failedTitle"),
                        description: "Failed to complete authentication",
                    })
                    window.location.href = "/"
                }
            }

            processAuth()
            return
        }

        // Not authenticated and not loading - something went wrong
        if (!isAuthenticated && !isAuth0Loading) {
            processedRef.current = true
            window.location.href = "/login"
        }
    }, [isAuthenticated, isAuth0Loading, auth0Error, getIdTokenClaims, signInWithAuth0, toast, router, t])

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
