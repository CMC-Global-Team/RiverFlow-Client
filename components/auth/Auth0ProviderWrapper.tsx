"use client"

import { Auth0Provider } from "@auth0/auth0-react"
import { useRouter } from "next/navigation"

interface Auth0ProviderWrapperProps {
    children: React.ReactNode
}

/**
 * Auth0 Provider wrapper component for Next.js App Router.
 * Wraps children with Auth0Provider for authentication context.
 */
export function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
    const router = useRouter()

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ""
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ""
    const redirectUri = typeof window !== "undefined"
        ? `${window.location.origin}/auth/auth0/callback`
        : ""

    if (!domain || !clientId) {
        console.warn("Auth0 credentials are not set. Auth0 login will not work.")
        return <>{children}</>
    }

    const onRedirectCallback = (appState?: { returnTo?: string }) => {
        router.push(appState?.returnTo || "/dashboard")
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                scope: "openid profile email",
            }}
            onRedirectCallback={onRedirectCallback}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider>
    )
}
