"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
    Terminal,
    Search,
    Filter,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    User,
    CreditCard,
    Settings,
    AlertCircle,
    CheckCircle2,
    Clock,
    Activity,
    Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    getLogs,
    getLogStatistics,
    getCategories,
    getActions,
    type ActivityLog,
    type LogStatistics,
    type LogSearchParams
} from "@/services/admin/admin-logging.service"

// Helper function to format relative time
function formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
}

// Get icon for action category
function getCategoryIcon(category: string) {
    switch (category?.toUpperCase()) {
        case "USER_MANAGEMENT":
            return <User className="h-4 w-4" />
        case "PAYMENT":
            return <CreditCard className="h-4 w-4" />
        case "SYSTEM":
            return <Settings className="h-4 w-4" />
        default:
            return <Activity className="h-4 w-4" />
    }
}

// Get color for actor role
function getRoleColor(role: string): string {
    switch (role?.toUpperCase()) {
        case "SUPER_ADMIN":
            return "text-purple-400"
        case "ADMIN":
            return "text-blue-400"
        case "USER":
            return "text-green-400"
        default:
            return "text-gray-400"
    }
}

// Get color for action type
function getActionColor(action: string): string {
    if (action?.includes("DELETE") || action?.includes("REMOVE")) {
        return "text-red-400"
    }
    if (action?.includes("CREATE") || action?.includes("SUCCESS") || action?.includes("ADD")) {
        return "text-green-400"
    }
    if (action?.includes("UPDATE") || action?.includes("CHANGE") || action?.includes("MODIFY")) {
        return "text-yellow-400"
    }
    return "text-cyan-400"
}

// Log entry component
function LogEntry({ log, isExpanded, onToggle }: { log: ActivityLog; isExpanded: boolean; onToggle: () => void }) {
    const timeStr = formatRelativeTime(log.timestamp)

    return (
        <div
            className="font-mono text-sm border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
            onClick={onToggle}
        >
            <div className="flex items-start gap-2 px-4 py-2">
                {/* Timestamp */}
                <span className="text-gray-500 whitespace-nowrap min-w-[60px]">
                    {timeStr}
                </span>

                {/* Category Icon */}
                <span className="text-gray-400">
                    {getCategoryIcon(log.category)}
                </span>

                {/* Actor */}
                <span className={`${getRoleColor(log.actorRole)} whitespace-nowrap`}>
                    [{log.actorRole}]
                </span>
                <span className="text-blue-300 max-w-[200px] truncate">
                    {log.actorEmail || `User#${log.actorId}`}
                </span>

                {/* Action */}
                <span className={`${getActionColor(log.action)} font-medium`}>
                    {log.action?.replace(/_/g, " ")}
                </span>

                {/* Target */}
                {log.targetType && (
                    <>
                        <span className="text-gray-500">→</span>
                        <span className="text-orange-300">
                            {log.targetType}#{log.targetId}
                        </span>
                    </>
                )}

                {/* Expand indicator */}
                <span className="ml-auto text-gray-500">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
            </div>

            {/* Expanded details */}
            {isExpanded && (
                <div className="px-4 pb-3 pl-20 text-gray-400 text-xs space-y-1 bg-gray-900/50">
                    <div><span className="text-gray-500">ID:</span> {log.id}</div>
                    <div><span className="text-gray-500">Timestamp:</span> {log.formattedTimestamp || log.timestamp}</div>
                    {log.ipAddress && <div><span className="text-gray-500">IP:</span> {log.ipAddress}</div>}
                    {log.details && (
                        <div className="mt-2">
                            <span className="text-gray-500">Details:</span>
                            <pre className="mt-1 p-2 bg-black/50 rounded text-xs overflow-x-auto">
                                {typeof log.details === 'string'
                                    ? log.details
                                    : JSON.stringify(JSON.parse(log.details || '{}'), null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Statistics card component
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">{label}</p>
            </div>
        </div>
    )
}

export default function LoggingPage() {
    const { t } = useTranslation("adminSideBar")

    // State
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [stats, setStats] = useState<LogStatistics | null>(null)
    const [categories, setCategories] = useState<string[]>([])
    const [actions, setActions] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(false)

    // Filter state
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [selectedAction, setSelectedAction] = useState<string>("all")
    const [selectedRole, setSelectedRole] = useState<string>("all")
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Fetch logs
    const fetchLogs = useCallback(async () => {
        try {
            setError(null)
            const params: LogSearchParams = {
                page,
                size: 50,
                sortDir: 'desc'
            }
            if (search) params.search = search
            if (selectedCategory !== "all") params.category = selectedCategory
            if (selectedAction !== "all") params.action = selectedAction
            if (selectedRole !== "all") params.actorRole = selectedRole

            const response = await getLogs(params)
            setLogs(response.content)
            setTotalPages(response.totalPages)
        } catch (err) {
            setError("Failed to fetch logs. Please check your connection and try again.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [page, search, selectedCategory, selectedAction, selectedRole])

    // Fetch filter options and stats
    const fetchMetadata = useCallback(async () => {
        try {
            const [categoriesData, actionsData, statsData] = await Promise.all([
                getCategories(),
                getActions(),
                getLogStatistics()
            ])
            setCategories(categoriesData)
            setActions(actionsData)
            setStats(statsData)
        } catch (err) {
            console.error("Error fetching metadata:", err)
        }
    }, [])

    // Initial load
    useEffect(() => {
        fetchLogs()
        fetchMetadata()
    }, [fetchLogs, fetchMetadata])

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return
        const interval = setInterval(() => {
            fetchLogs()
        }, 5000)
        return () => clearInterval(interval)
    }, [autoRefresh, fetchLogs])

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0)
            fetchLogs()
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const handleRefresh = () => {
        setLoading(true)
        fetchLogs()
        fetchMetadata()
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal className="h-6 w-6 text-green-400" />
                        <h1 className="text-xl font-bold text-white">System Activity Logs</h1>
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`border-gray-700 ${autoRefresh ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'text-gray-400'}`}
                        >
                            <Clock className="h-4 w-4 mr-1" />
                            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="border-gray-700 text-gray-400"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                    <StatCard
                        label="Total Logs"
                        value={stats.totalLogs}
                        icon={Activity}
                        color="bg-blue-600"
                    />
                    <StatCard
                        label="Last 24 Hours"
                        value={stats.logsLast24h}
                        icon={Clock}
                        color="bg-green-600"
                    />
                    <StatCard
                        label="Last 7 Days"
                        value={stats.logsLast7d}
                        icon={CheckCircle2}
                        color="bg-purple-600"
                    />
                    <StatCard
                        label="Categories"
                        value={Object.keys(stats.byCategory).length}
                        icon={Filter}
                        color="bg-orange-600"
                    />
                </div>
            )}

            {/* Filters */}
            <div className="bg-gray-900 border-y border-gray-800 px-6 py-3">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <Search className="h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 flex-1"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(0) }}>
                        <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat.replace(/_/g, " ")}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedAction} onValueChange={(v) => { setSelectedAction(v); setPage(0) }}>
                        <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="all">All Actions</SelectItem>
                            {actions.map(action => (
                                <SelectItem key={action} value={action}>{action.replace(/_/g, " ")}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedRole} onValueChange={(v) => { setSelectedRole(v); setPage(0) }}>
                        <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Log entries - Terminal style */}
            <div className="bg-black/50">
                {/* Terminal header */}
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-gray-400 text-sm font-mono ml-2">
                        activity.log — {logs.length} entries
                    </span>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="h-8 w-8 text-green-400 animate-spin" />
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="flex items-center justify-center py-20 text-red-400">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Terminal className="h-12 w-12 mb-4" />
                        <p>No activity logs found</p>
                        <p className="text-sm">Adjust your filters or check back later</p>
                    </div>
                )}

                {/* Log entries */}
                {!loading && !error && logs.length > 0 && (
                    <div className="max-h-[600px] overflow-y-auto">
                        {logs.map(log => (
                            <LogEntry
                                key={log.id}
                                log={log}
                                isExpanded={expandedLogId === log.id}
                                onToggle={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-900 px-4 py-3 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                            Page {page + 1} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                                className="border-gray-700 text-gray-400"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                className="border-gray-700 text-gray-400"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
