"use client"

import { useTranslation } from "react-i18next"

export default function GeneralSettingsPage() {
    const { t } = useTranslation("adminSideBar")

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("generalSettings")}</h1>
                <p className="mt-2 text-muted-foreground">General Settings - Coming Soon</p>
            </div>
        </div>
    )
}
