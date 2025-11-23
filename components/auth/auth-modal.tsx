"use client"

import { useState } from "react"
import { X } from "lucide-react"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"
import ForgotPasswordForm from "./forgot-password-form"
import { useTranslation } from "react-i18next"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialTab?: "login" | "signup"
}

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">(initialTab)

    // i18n
    const { t } = useTranslation("other")

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md animate-scale-in rounded-2xl bg-card p-8 shadow-2xl">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Logo + Slogan */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        RiverFlow
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t("slogan")}
                    </p>
                </div>

                {/* Tabs */}
                {activeTab !== "forgot" && (
                    <div className="mb-6 flex gap-2 rounded-lg bg-muted p-1">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`flex-1 rounded-md py-2 px-4 font-medium transition-all ${
                                activeTab === "login"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("tabs.login")}
                        </button>

                        <button
                            onClick={() => setActiveTab("signup")}
                            className={`flex-1 rounded-md py-2 px-4 font-medium transition-all ${
                                activeTab === "signup"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("tabs.signup")}
                        </button>
                    </div>
                )}

                {/* Forms */}
                <div className="space-y-4">
                    {activeTab === "login" && (
                        <LoginForm onForgotClick={() => setActiveTab("forgot")} />
                    )}

                    {activeTab === "signup" && <SignupForm />}

                    {activeTab === "forgot" && (
                        <ForgotPasswordForm onBack={() => setActiveTab("login")} />
                    )}
                </div>
            </div>
        </div>
    )
}
