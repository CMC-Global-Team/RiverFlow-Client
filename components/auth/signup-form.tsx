"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mail, Lock, User, Github } from "lucide-react"
import { useRegister } from "@/hooks/auth/useRegister"
import { useGoogleSignIn } from "@/hooks/auth/useGoogleSignIn"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { useTranslation } from "react-i18next"
import type { CredentialResponse } from "@react-oauth/google"

export default function SignupForm() {
    const { t } = useTranslation("other")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const { register, isLoading, error, data } = useRegister()
    const { signInWithGoogle, isLoading: isGoogleLoading, error: googleError } = useGoogleSignIn()
    const { toast } = useToast()
    const router = useRouter()

    // GOOGLE ERROR
    useEffect(() => {
        if (googleError) {
            toast({
                variant: "destructive",
                title: t("signup.googleFailed"),
                description: googleError.message || t("signup.googleMissing"),
            })
        }
    }, [googleError, toast, t])

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
                    title: t("signup.googleFailed"),
                    description: t("signup.googleMissing"),
                })
            }
        } catch (err) {
            console.error("Google login error:", err)
        }
    }

    const handleGoogleError = () => {
        toast({
            variant: "destructive",
            title: t("signup.googleFailed"),
            description: t("signup.googleMissing"),
        })
    }

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: t("signup.failedTitle"),
                description: error.message,
            })
        }
    }, [error, toast, t])

    useEffect(() => {
        if (data) {
            toast({
                title: t("signup.successTitle"),
                description: t("signup.successDesc", { name: data.fullName }),
            })
            setFullName("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")
        }
    }, [data, toast, t])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: t("signup.failedTitle"),
                description: t("signup.passwordMismatch"),
            })
            return
        }

        if (password.length < 6) {
            toast({
                variant: "destructive",
                title: t("signup.failedTitle"),
                description: t("signup.passwordTooShort"),
            })
            return
        }

        await register({ fullName, email, password })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* FULL NAME */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("signup.fullName")}</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t("signup.fullNamePlaceholder") as string}
                        className="w-full rounded-lg border border-border bg-input pl-10 py-2.5"
                        required
                    />
                </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("signup.email")}</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("signup.emailPlaceholder") as string}
                        className="w-full rounded-lg border border-border bg-input pl-10 py-2.5"
                        required
                    />
                </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("signup.password")}</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("signup.passwordPlaceholder") as string}
                        className="w-full rounded-lg border border-border bg-input pl-10 py-2.5"
                        required
                    />
                </div>
                <p className="text-xs text-muted-foreground">{t("signup.passwordHint")}</p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("signup.confirmPassword")}</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("signup.passwordPlaceholder") as string}
                        className="w-full rounded-lg border border-border bg-input pl-10 py-2.5"
                        required
                    />
                </div>
            </div>

            {/* BUTTON */}
            <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white">
                {isLoading ? t("signup.submitting") : t("signup.submit")}
            </button>

            {/* DIVIDER */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">{t("signup.divider")}</span>
                </div>
            </div>

            {/* SOCIAL */}
            <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 rounded-lg border py-2.5" disabled>
                    <Github className="h-5 w-5" />
                    <span>{t("signup.github")}</span>
                </button>

                <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signup_with" />
            </div>
        </form>
    )
}
