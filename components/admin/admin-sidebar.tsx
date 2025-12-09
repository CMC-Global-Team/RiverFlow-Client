"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useLogout } from "@/hooks/auth/useLogout"
import { useAuth } from "@/hooks/auth/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    LayoutGrid,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    FileText,
} from "lucide-react"

export default function AdminSidebar() {
    const { t } = useTranslation("adminSideBar")
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { logout, isLoading } = useLogout()
    const { user } = useAuth()
    const router = useRouter()
    const [settingsOpen, setSettingsOpen] = useState(false)

    const isSuperAdmin = user?.role === "SUPER_ADMIN"

    const toggleSettings = () => {
        if (isCollapsed) return
        setSettingsOpen(!settingsOpen)
    }

    return (
        <aside
            className={`fixed left-0 top-0 h-screen border-r border-border bg-card transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                {!isCollapsed && (
                    <span className="text-lg font-bold text-foreground">
                        <Link href="/admin">{isSuperAdmin ? "RiverFlow Super Admin" : "RiverFlow Admin"}</Link>
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-lg p-2 hover:bg-muted transition-colors"
                >
                    <ChevronDown className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-90" : ""}`} />
                </button>
            </div>

            <nav className="space-y-2 p-4">
                {/* Navigation Items */}
                <div className="space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        <LayoutGrid className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm font-medium">{t("dashboard")}</span>}
                    </Link>

                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        <Users className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm font-medium">{t("userManage")}</span>}
                    </Link>

                    <Link
                        href="/admin/payments"
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        <CreditCard className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm font-medium">{t("paymentManage")}</span>}
                    </Link>

                    {/* Reports & Statistics - Only visible for Super Admin */}
                    {isSuperAdmin && (
                        <Link
                            href="/admin/reports"
                            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                            <BarChart3 className="h-5 w-5" />
                            {!isCollapsed && <span className="text-sm font-medium">{t("reports")}</span>}
                        </Link>
                    )}

                    {/* Logging System - Only visible for Super Admin */}
                    {isSuperAdmin && (
                        <Link
                            href="/admin/logging"
                            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                            <FileText className="h-5 w-5" />
                            {!isCollapsed && <span className="text-sm font-medium">{t("loggingSystem")}</span>}
                        </Link>
                    )}

                    <div className="space-y-1">
                        <button
                            onClick={toggleSettings}
                            className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="h-5 w-5" />
                                {!isCollapsed && <span className="text-sm font-medium">{t("settings")}</span>}
                            </div>

                            {!isCollapsed && (
                                <ChevronRight
                                    className={`h-4 w-4 transition-transform ${settingsOpen ? "rotate-90" : ""}`}
                                />
                            )}
                        </button>

                        {/* SUBMENU */}
                        {!isCollapsed && settingsOpen && (
                            <div className="ml-10 mt-1 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in">
                                <Link
                                    href="/admin/settings/general"
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    {t("generalSettings")}
                                </Link>
                                <Link
                                    href="/admin/settings/system"
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    {t("systemSettings")}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Logout */}
            <div className="absolute bottom-4 left-4 right-4">
                <button
                    onClick={() => logout()}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-all disabled:opacity-50"
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="text-sm font-medium">{isLoading ? t("loggingOut") : t("logout")}</span>}
                </button>
            </div>
        </aside>
    )
}
