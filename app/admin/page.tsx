"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/auth/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Users,
    FileText,
    CreditCard,
    TrendingUp,
    Activity,
    Clock,
    ArrowUpRight,
    Loader2,
    AlertCircle,
    BarChart3,
    Wallet,
    UserPlus,
    Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getDashboardData, formatCurrency, formatNumber } from "@/services/admin/admin-dashboard.service"
import { AdminDashboardResponse } from "@/types/dashboard.types"

export default function AdminDashboardPage() {
    const { t } = useTranslation("adminSideBar")
    const { user } = useAuth()
    const router = useRouter()
    const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isSuperAdmin = user?.role === "SUPER_ADMIN"

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const data = await getDashboardData()
                setDashboard(data)
            } catch (err) {
                console.error("Failed to fetch dashboard:", err)
                setError("Failed to load dashboard data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4 text-destructive">
                    <AlertCircle className="h-10 w-10" />
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {t("dashboard")}
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Welcome back, {user?.fullName || "Admin"}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Zap className="h-4 w-4" />
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-muted-foreground font-medium">Total Users</CardDescription>
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {formatNumber(dashboard?.overviewStats.totalUsers || 0)}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>+{formatNumber(dashboard?.quickStats.newUsersToday || 0)} today</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Mindmaps */}
                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-muted-foreground font-medium">Total Mindmaps</CardDescription>
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <FileText className="h-4 w-4 text-purple-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {formatNumber(dashboard?.overviewStats.totalMindmaps || 0)}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>+{formatNumber(dashboard?.quickStats.newMindmapsToday || 0)} today</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-muted-foreground font-medium">Total Revenue</CardDescription>
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Wallet className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {formatCurrency(dashboard?.overviewStats.totalRevenue || 0)}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>+{formatCurrency(dashboard?.quickStats.revenueToday || 0)} today</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Transactions */}
                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-muted-foreground font-medium">Total Transactions</CardDescription>
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <CreditCard className="h-4 w-4 text-orange-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {formatNumber(dashboard?.overviewStats.totalTransactions || 0)}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>+{formatNumber(dashboard?.quickStats.transactionsToday || 0)} today</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats & Actions Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Stats */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Today&apos;s Activity
                        </CardTitle>
                        <CardDescription>Quick overview of today&apos;s metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <UserPlus className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{formatNumber(dashboard?.quickStats.newUsersToday || 0)}</p>
                                        <p className="text-xs text-muted-foreground">New Users</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <Activity className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{formatNumber(dashboard?.quickStats.activeUsersToday || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Active Users</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <FileText className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{formatNumber(dashboard?.quickStats.activeMindmaps || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Active Mindmaps</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-yellow-500/10">
                                        <Clock className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{formatNumber(dashboard?.quickStats.pendingPayments || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Pending Payments</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Navigate to common admin tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/admin/users"
                                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">Manage Users</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <Link
                                href="/admin/payments"
                                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5" />
                                    <span className="font-medium">Payments</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            {isSuperAdmin && (
                                <>
                                    <Link
                                        href="/admin/reports"
                                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="h-5 w-5" />
                                            <span className="font-medium">Reports</span>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                    <Link
                                        href="/admin/logging"
                                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5" />
                                            <span className="font-medium">System Logs</span>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity - Super Admin Only */}
            {isSuperAdmin && dashboard?.recentActivity && dashboard.recentActivity.length > 0 && (
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>Latest system activities</CardDescription>
                            </div>
                            <Link
                                href="/admin/logging"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                View All
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboard.recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Activity className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">{activity.action}</span>
                                            <span className="text-muted-foreground text-sm">by {activity.actor}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Target: {activity.target}
                                            {activity.details && ` - ${activity.details}`}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
