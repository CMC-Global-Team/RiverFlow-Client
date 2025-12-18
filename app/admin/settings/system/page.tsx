"use client"

import { useTranslation } from "react-i18next"

export default function SystemSettingsPage() {
    const { t } = useTranslation("admin")

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("sidebar.systemSettings")}</h1>
                <p className="mt-2 text-muted-foreground">{t("sidebar.systemSettings")} - {t("settings.comingSoon")}</p>
            </div>
        </div>
    )
}
