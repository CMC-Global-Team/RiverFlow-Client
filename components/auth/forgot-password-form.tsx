"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { useForgotPassword } from "@/hooks/auth/useForgotPassword"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"

interface ForgotPasswordFormProps {
    onBack: () => void
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
    const { t } = useTranslation("other")
    const [email, setEmail] = useState("")

    const { sendResetLink, isLoading, error, data, clearError } = useForgotPassword()
    const { toast } = useToast()

    // Xóa lỗi khi user thay đổi email
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        if (error) clearError()
    }

    // Hiển thị lỗi
    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: t("forgot.failedTitle"),
                description: error.message,
            })
        }
    }, [error, toast, t])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast({
                variant: "destructive",
                title: t("forgot.failedTitle"),
                description: t("forgot.missingEmail"),
            })
            return
        }

        await sendResetLink({ email })
    }

    return (
        <div className="space-y-4">

            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
                <ArrowLeft className="h-4 w-4" />
                {t("forgot.back")}
            </button>

            {!data ? (
                <form onSubmit={handleSubmit} className="space-y-4">

                    <p className="text-sm text-muted-foreground">
                        {t("forgot.description")}
                    </p>

                    {/* Server Error */}
                    {error && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <p className="text-sm text-destructive font-medium">{error.message}</p>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("forgot.email")}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder={t("forgot.emailPlaceholder") as string}
                                className={`w-full rounded-lg border ${error ? "border-destructive" : "border-border"} bg-input pl-10 py-2.5`}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? t("forgot.submitting") : t("forgot.submit")}
                    </button>
                </form>
            ) : (
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{t("forgot.successTitle")}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{data.message}</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                        {t("forgot.back")}
                    </button>
                </div>
            )}
        </div>
    )
}
