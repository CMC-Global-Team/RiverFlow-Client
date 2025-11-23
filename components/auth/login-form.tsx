"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, Lock, Github } from "lucide-react"
import { useSignIn } from "@/hooks/auth/useSignIn"
import { useGoogleSignIn } from "@/hooks/auth/useGoogleSignIn"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { useTranslation } from "react-i18next"
import type { CredentialResponse } from "@react-oauth/google"

interface LoginFormProps {
    onForgotClick: () => void
}

export default function LoginForm({ onForgotClick }: LoginFormProps) {
    const { t } = useTranslation("other")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { signIn, isLoading, error, data } = useSignIn()
    const { signInWithGoogle, isLoading: isGoogleLoading, error: googleError } = useGoogleSignIn()
    const { toast } = useToast()
    const router = useRouter()

    // GOOGLE ERROR
    useEffect(() => {
        if (googleError) {
            toast({
                variant: "destructive",
                title: t("login.failedTitle"),
                description: googleError.message || t("login.failedTitle"),
            })
        }
    }, [googleError, toast, t])

    // GOOGLE SUCCESS
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (credentialResponse.credential) {
                const response = await signInWithGoogle(credentialResponse.credential)
                if (response) {
                    toast({
                        title: t("login.successTitle"),
                        description: t("login.successDesc", { name: response.fullName }),
                    })
                    setTimeout(() => router.push("/dashboard"), 1000)
                }
            } else {
                toast({
                    variant: "destructive",
                    title: t("login.failedTitle"),
                    description: t("login.failedTitle"),
                })
            }
        } catch (err) {
            console.error("Google login error:", err)
        }
    }

    const handleGoogleError = () => {
        toast({
            variant: "destructive",
            title: t("login.failedTitle"),
            description: t("login.failedTitle"),
        })
    }

    // SIGN-IN ERROR
    useEffect(() => {
        if (error) {
            const isUnverified = error.status === 403

            toast({
                variant: "destructive",
                title: isUnverified ? t("login.unverifiedEmail") : t("login.failedTitle"),
                description: error.message,
            })
        }
    }, [error, t, toast])

    // SIGN-IN SUCCESS
    useEffect(() => {
        if (data) {
            toast({
                title: t("login.successTitle"),
                description: t("login.successDesc", { name: data.fullName }),
            })

            setTimeout(() => router.push("/dashboard"), 1000)
        }
    }, [data, toast, router, t])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            toast({
                variant: "destructive",
                title: t("login.failedTitle"),
                description: t("login.missingFields"),
            })
            return
        }

        await signIn({ email, password })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("login.email")}</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-border bg-input pl-10 py-2.5"
                        required
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("login.password")}</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-input pl-10 py-2.5"
                        required
                    />
                </div>
            </div>

            {/* Forgot Password */}
            <button
                type="button"
                onClick={onForgotClick}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
                {t("login.forgot")}
            </button>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
                {isLoading ? t("login.submitting") : t("login.submit")}
            </button>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">
            {t("login.divider")}
          </span>
                </div>
            </div>

            {/* Social login */}
            <div className="space-y-3">
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 hover:bg-muted transition-colors disabled:opacity-50"
                    disabled
                >
                    <Github className="h-5 w-5" />
                    <span className="text-sm font-medium">{t("login.github")}</span>
                </button>

                <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="signin_with"
                />
            </div>
        </form>
    )
}
