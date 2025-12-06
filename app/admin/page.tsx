"use client"

import { useTranslation } from "react-i18next"

export default function AdminDashboardPage() {
    const { t } = useTranslation("adminSideBar")

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("dashboard")}</h1>
                <p className="mt-2 text-muted-foreground">Admin Dashboard - Coming Soon</p>
            </div>
        </div>
    )
}
