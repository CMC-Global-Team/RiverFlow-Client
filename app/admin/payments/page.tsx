"use client"

import { useTranslation } from "react-i18next"

export default function PaymentsManagePage() {
    const { t } = useTranslation("adminSideBar")

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">{t("paymentManage")}</h1>
                <p className="mt-2 text-muted-foreground">Payment Management - Coming Soon</p>
            </div>
        </div>
    )
}
