"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Globe, Check } from "lucide-react"
import { locale } from "@/i18n/i18n"

export default function ChangeLanguage() {
    const { i18n, t } = useTranslation("settings")
    const [isOpen, setIsOpen] = useState(false)

    const currentLanguage = i18n.language

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang)
        setIsOpen(false)
        // Save to localStorage for persistence
        localStorage.setItem("preferredLanguage", lang)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
                <Globe className="h-4 w-4" />
                <span>{t("language")}</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 animate-in slide-in-from-top-2 fade-in">
                        <div className="p-1">
                            {Object.entries(locale).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => handleLanguageChange(code)}
                                    className="flex w-full items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    <span>{name}</span>
                                    {currentLanguage === code && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
