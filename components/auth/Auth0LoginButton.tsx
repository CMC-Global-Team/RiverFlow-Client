"use client"

import { useAuth0 } from "@auth0/auth0-react"
import { useTranslation } from "react-i18next"
import { Shield } from "lucide-react"

interface Auth0LoginButtonProps {
    text?: "signin_with" | "signup_with"
    disabled?: boolean
}

/**
 * Auth0 Login Button component.
 * Uses Auth0 SDK to trigger redirect-based login flow.
 */
export function Auth0LoginButton({
    text = "signin_with",
    disabled = false
}: Auth0LoginButtonProps) {
    const { t } = useTranslation("other")
    const { loginWithRedirect, isLoading } = useAuth0()

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ""
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ""

    // If Auth0 is not configured, show disabled button
    if (!domain || !clientId) {
        return (
            <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 hover:bg-muted transition-colors disabled:opacity-50"
                disabled
                title="Auth0 credentials are not configured"
            >
                <Shield className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">
                    {text === "signin_with" ? t("login.auth0", "Sign in with SSO") : t("signup.auth0", "Sign up with SSO")}
                </span>
            </button>
        )
    }

    const handleClick = async () => {
        try {
            // Use redirect-based login (more reliable than popup)
            await loginWithRedirect({
                authorizationParams: {
                    scope: "openid profile email",
                },
                appState: {
                    returnTo: "/dashboard",
                },
            })
        } catch (error) {
            console.error("Auth0 login error:", error)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 hover:bg-muted transition-colors disabled:opacity-50"
        >
            <Shield className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">
                {isLoading
                    ? t("common.loading", "Loading...")
                    : text === "signin_with"
                        ? t("login.auth0", "Sign in with SSO")
                        : t("signup.auth0", "Sign up with SSO")
                }
            </span>
        </button>
    )
}
