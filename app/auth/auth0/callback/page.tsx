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
    const { isAuthenticated, isLoading: isAuth0Loading, getIdTokenClaims, error: auth0Error } = useAuth0()
    const { signInWithAuth0, isLoading: isSigningIn } = useAuth0SignIn()
    const { toast } = useToast()
    const router = useRouter()
    const [hasProcessed, setHasProcessed] = useState(false)
    const [status, setStatus] = useState("Processing login...")

    useEffect(() => {
        const handleCallback = async () => {
            // Prevent multiple executions
            if (hasProcessed) {
                return
            }

            // Wait for Auth0 to finish loading
            if (isAuth0Loading) {
                setStatus("Verifying authentication...")
                return
            }

            // Handle Auth0 error
            if (auth0Error) {
                console.error("Auth0 error:", auth0Error)
                toast({
                    variant: "destructive",
                    title: t("login.failedTitle"),
                    description: auth0Error.message || "Authentication failed",
                })
                router.push("/auth")
                return
            }

            // If authenticated, get ID token and authenticate with backend
            if (isAuthenticated) {
                setHasProcessed(true)
                setStatus("Completing authentication...")

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
                            router.push(redirectPath)
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
                    router.push("/auth")
                }
            } else if (!isAuth0Loading) {
                // Not authenticated and not loading, redirect to auth page
                router.push("/auth")
            }
        }

        handleCallback()
    }, [isAuthenticated, isAuth0Loading, auth0Error, hasProcessed, getIdTokenClaims, signInWithAuth0, toast, router, t])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">
                    {status}
                </p>
            </div>
        </div>
    )
}
