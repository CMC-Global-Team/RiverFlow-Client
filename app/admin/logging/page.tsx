"use client"

import { useTranslation } from "react-i18next"
import { FileText, Shield } from "lucide-react"

export default function LoggingPage() {
    const { t } = useTranslation("adminSideBar")

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">{t("loggingSystem")}</h1>
                </div>
                <p className="text-muted-foreground">
                    View and monitor system activity logs. This page is only accessible to Super Administrators.
                </p>
            </div>

            {/* Placeholder content */}
            <div className="rounded-lg border bg-card p-8 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Logging System</h2>
                <p className="text-muted-foreground mb-4">
                    System activity logs will be displayed here. This feature requires server-side implementation
                    of the LoggingService and LoggingController.
                </p>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Shield className="h-4 w-4 mr-2" />
                    Super Admin Only
                </div>
            </div>
        </div>
    )
}
