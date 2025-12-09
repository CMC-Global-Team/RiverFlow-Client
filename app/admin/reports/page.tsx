"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/auth/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    Brain,
    DollarSign,
    Calendar,
    RefreshCw,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
} from "lucide-react"
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    getStatistics,
    getTimeSeriesData,
    downloadReport,
} from "@/services/admin/admin-report.service"
import {
    ReportStatisticsResponse,
    ReportTimeSeriesData,
    TimePeriod,
    ReportType,
    ExportFormat,
} from "@/types/report.types"

// Chart colors
const COLORS = {
    primary: "#3b82f6",
    secondary: "#10b981",
    tertiary: "#f59e0b",
    quaternary: "#ef4444",
    purple: "#8b5cf6",
    pink: "#ec4899",
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function ReportsPage() {
    const { t } = useTranslation("adminSideBar")
    const { user: currentUser } = useAuth()
    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN"

    // State
    const [statistics, setStatistics] = useState<ReportStatisticsResponse | null>(null)
    const [timeSeriesData, setTimeSeriesData] = useState<ReportTimeSeriesData | null>(null)
    const [statsLoading, setStatsLoading] = useState(true)
    const [chartLoading, setChartLoading] = useState(true)
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("DAILY")
    const [exportLoading, setExportLoading] = useState(false)

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            setStatsLoading(true)
            const data = await getStatistics()
            setStatistics(data)
        } catch (error) {
            console.error("Error fetching statistics:", error)
            toast.error(t("reportFetchError"))
        } finally {
            setStatsLoading(false)
        }
    }, [t])

    // Fetch time series data
    const fetchTimeSeriesData = useCallback(async () => {
        try {
            setChartLoading(true)
            const data = await getTimeSeriesData(timePeriod)
            setTimeSeriesData(data)
        } catch (error) {
            console.error("Error fetching time series data:", error)
            toast.error(t("reportFetchError"))
        } finally {
            setChartLoading(false)
        }
    }, [timePeriod, t])

    useEffect(() => {
        if (isSuperAdmin) {
            fetchStatistics()
            fetchTimeSeriesData()
        }
    }, [isSuperAdmin, fetchStatistics, fetchTimeSeriesData])

    // Handle export
    const handleExport = async (reportType: ReportType, format: ExportFormat) => {
        try {
            setExportLoading(true)
            await downloadReport({
                reportType,
                format,
            })
            toast.success(t("exportSuccess"))
        } catch (error) {
            console.error("Export error:", error)
            toast.error(t("exportError"))
        } finally {
            setExportLoading(false)
        }
    }

    // Format number with Vietnamese locale
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num)
    }

    // Format currency
    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num) + " VND"
    }

    // Format growth percentage
    const formatGrowth = (growth: number) => {
        const sign = growth >= 0 ? "+" : ""
        return `${sign}${growth.toFixed(1)}%`
    }

    // Get growth indicator
    const GrowthIndicator = ({ value }: { value: number }) => {
        if (value >= 0) {
            return (
                <span className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {formatGrowth(value)}
                </span>
            )
        }
        return (
            <span className="flex items-center text-red-600 text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                {formatGrowth(value)}
            </span>
        )
    }

    // Access denied for non-super admins
    if (!isSuperAdmin) {
        return (
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle className="text-center text-destructive">
                                {t("accessDenied")}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {t("superAdminOnly")}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        )
    }

    // Prepare chart data
    const userChartData = timeSeriesData?.userRegistrations?.map((point, index) => ({
        name: point.label,
        users: point.value,
        mindmaps: timeSeriesData.mindmapCreations?.[index]?.value || 0,
    })) || []

    const revenueChartData = timeSeriesData?.revenue?.map((point, index) => ({
        name: point.label,
        revenue: point.value,
        transactions: timeSeriesData.transactions?.[index]?.value || 0,
    })) || []

    const userRolePieData = statistics ? [
        { name: t("user"), value: statistics.userStats.regularUserCount },
        { name: t("admin"), value: statistics.userStats.adminCount },
        { name: t("super_admin"), value: statistics.userStats.superAdminCount },
    ] : []

    const mindmapVisibilityPieData = statistics ? [
        { name: t("publicMindmaps"), value: statistics.mindmapStats.publicMindmaps },
        { name: t("privateMindmaps"), value: statistics.mindmapStats.privateMindmaps },
    ] : []

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t("reports")}</h1>
                    <p className="mt-2 text-muted-foreground">{t("reportsDescription")}</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            fetchStatistics()
                            fetchTimeSeriesData()
                        }}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("refresh")}
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Users className="h-4 w-4" />
                            {t("totalUsers")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {formatNumber(statistics?.userStats.totalUsers || 0)}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                        {t("activeUsers")}: {formatNumber(statistics?.userStats.activeUsers || 0)}
                                    </span>
                                    <GrowthIndicator value={statistics?.userStats.weeklyGrowthPercent || 0} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Total Mindmaps Card */}
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                            <Brain className="h-4 w-4" />
                            {t("totalMindmaps")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                    {formatNumber(statistics?.mindmapStats.totalMindmaps || 0)}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                        AI: {formatNumber(statistics?.mindmapStats.aiGeneratedMindmaps || 0)}
                                    </span>
                                    <GrowthIndicator value={statistics?.mindmapStats.weeklyGrowthPercent || 0} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Total Revenue Card */}
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
                            <DollarSign className="h-4 w-4" />
                            {t("totalRevenue")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                    {formatCurrency(statistics?.revenueStats.totalRevenue || 0)}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-amber-600 dark:text-amber-400">
                                        {t("revenueThisMonth")}: {formatCurrency(statistics?.revenueStats.revenueThisMonth || 0)}
                                    </span>
                                    <GrowthIndicator value={statistics?.revenueStats.weeklyGrowthPercent || 0} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Transactions Card */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <BarChart3 className="h-4 w-4" />
                            {t("totalTransactions")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                    {formatNumber(statistics?.revenueStats.totalTransactions || 0)}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-purple-600 dark:text-purple-400">
                                        {t("avgTransaction")}: {formatCurrency(statistics?.revenueStats.averageTransactionValue || 0)}
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* User Stats Detail */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            {t("userStatistics")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {statsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("newUsersToday")}</span>
                                    <span className="font-medium">{statistics?.userStats.newUsersToday}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("newUsersThisWeek")}</span>
                                    <span className="font-medium">{statistics?.userStats.newUsersThisWeek}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("newUsersThisMonth")}</span>
                                    <span className="font-medium">{statistics?.userStats.newUsersThisMonth}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("suspended")}</span>
                                    <span className="font-medium text-yellow-600">{statistics?.userStats.suspendedUsers}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Mindmap Stats Detail */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="h-5 w-5 text-emerald-500" />
                            {t("mindmapStatistics")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {statsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("newMindmapsToday")}</span>
                                    <span className="font-medium">{statistics?.mindmapStats.newMindmapsToday}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("newMindmapsThisWeek")}</span>
                                    <span className="font-medium">{statistics?.mindmapStats.newMindmapsThisWeek}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("publicMindmaps")}</span>
                                    <span className="font-medium">{statistics?.mindmapStats.publicMindmaps}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("aiGenerated")}</span>
                                    <span className="font-medium text-purple-600">{statistics?.mindmapStats.aiGeneratedMindmaps}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue Stats Detail */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                            {t("revenueStatistics")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {statsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("revenueToday")}</span>
                                    <span className="font-medium">{formatCurrency(statistics?.revenueStats.revenueToday || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("revenueThisWeek")}</span>
                                    <span className="font-medium">{formatCurrency(statistics?.revenueStats.revenueThisWeek || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("transactionsToday")}</span>
                                    <span className="font-medium">{statistics?.revenueStats.transactionsToday}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("transactionsThisWeek")}</span>
                                    <span className="font-medium">{statistics?.revenueStats.transactionsThisWeek}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="space-y-6">
                {/* Time Period Selector */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <LineChartIcon className="h-5 w-5" />
                        {t("trendCharts")}
                    </h2>
                    <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
                        <SelectTrigger className="w-[150px]">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAILY">{t("daily")}</SelectItem>
                            <SelectItem value="WEEKLY">{t("weekly")}</SelectItem>
                            <SelectItem value="MONTHLY">{t("monthly")}</SelectItem>
                            <SelectItem value="YEARLY">{t("yearly")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="users">{t("usersChart")}</TabsTrigger>
                        <TabsTrigger value="revenue">{t("revenueChart")}</TabsTrigger>
                        <TabsTrigger value="distribution">{t("distributionChart")}</TabsTrigger>
                        <TabsTrigger value="overview">{t("overviewChart")}</TabsTrigger>
                    </TabsList>

                    {/* Users & Mindmaps Chart */}
                    <TabsContent value="users" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("usersAndMindmapsTrend")}</CardTitle>
                                <CardDescription>{t("usersAndMindmapsDescription")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {chartLoading ? (
                                    <Skeleton className="h-[400px] w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <AreaChart data={userChartData}>
                                            <defs>
                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorMindmaps" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="users"
                                                name={t("newUsers")}
                                                stroke={COLORS.primary}
                                                fillOpacity={1}
                                                fill="url(#colorUsers)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="mindmaps"
                                                name={t("newMindmaps")}
                                                stroke={COLORS.secondary}
                                                fillOpacity={1}
                                                fill="url(#colorMindmaps)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Revenue Chart */}
                    <TabsContent value="revenue" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("revenueTrend")}</CardTitle>
                                <CardDescription>{t("revenueDescription")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {chartLoading ? (
                                    <Skeleton className="h-[400px] w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={revenueChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" orientation="left" stroke={COLORS.tertiary} />
                                            <YAxis yAxisId="right" orientation="right" stroke={COLORS.purple} />
                                            <Tooltip
                                                formatter={(value: number, name: string) => [
                                                    name === t("revenue") ? formatCurrency(value) : value,
                                                    name
                                                ]}
                                            />
                                            <Legend />
                                            <Bar
                                                yAxisId="left"
                                                dataKey="revenue"
                                                name={t("revenue")}
                                                fill={COLORS.tertiary}
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="transactions"
                                                name={t("transactions")}
                                                stroke={COLORS.purple}
                                                strokeWidth={2}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Distribution Charts */}
                    <TabsContent value="distribution" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5" />
                                        {t("userRoleDistribution")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {statsLoading ? (
                                        <Skeleton className="h-[300px] w-full" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={userRolePieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {userRolePieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5" />
                                        {t("mindmapVisibility")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {statsLoading ? (
                                        <Skeleton className="h-[300px] w-full" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={mindmapVisibilityPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {mindmapVisibilityPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Overview Chart */}
                    <TabsContent value="overview" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("overviewTrend")}</CardTitle>
                                <CardDescription>{t("overviewDescription")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {chartLoading ? (
                                    <Skeleton className="h-[400px] w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={userChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="users"
                                                name={t("newUsers")}
                                                stroke={COLORS.primary}
                                                strokeWidth={2}
                                                dot={{ fill: COLORS.primary }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="mindmaps"
                                                name={t("newMindmaps")}
                                                stroke={COLORS.secondary}
                                                strokeWidth={2}
                                                dot={{ fill: COLORS.secondary }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Export Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        {t("exportReports")}
                    </CardTitle>
                    <CardDescription>{t("exportDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">{t("userReport")}</h4>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('USERS', 'CSV')}
                                    disabled={exportLoading}
                                >
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('USERS', 'JSON')}
                                    disabled={exportLoading}
                                >
                                    JSON
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('USERS', 'XLSX')}
                                    disabled={exportLoading}
                                >
                                    XLSX
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">{t("revenueReport")}</h4>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('REVENUE', 'CSV')}
                                    disabled={exportLoading}
                                >
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('REVENUE', 'JSON')}
                                    disabled={exportLoading}
                                >
                                    JSON
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('REVENUE', 'XLSX')}
                                    disabled={exportLoading}
                                >
                                    XLSX
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">{t("fullReport")}</h4>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('ALL', 'CSV')}
                                    disabled={exportLoading}
                                >
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('ALL', 'JSON')}
                                    disabled={exportLoading}
                                >
                                    JSON
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('ALL', 'XLSX')}
                                    disabled={exportLoading}
                                >
                                    XLSX
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
