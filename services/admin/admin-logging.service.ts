import apiClient from "@/lib/apiClient"

/**
 * Admin Logging Service
 * API calls for super admin activity log viewing
 */

export interface ActivityLog {
    id: string
    actorId: number
    actorEmail: string
    actorRole: string
    action: string
    category: string
    targetId: string
    targetType: string
    details: string
    ipAddress: string
    timestamp: string
    formattedTimestamp: string
    actionDescription: string
}

export interface LogStatistics {
    totalLogs: number
    logsLast24h: number
    logsLast7d: number
    byCategory: Record<string, number>
    byAction: Record<string, number>
    byActorRole: Record<string, number>
}

export interface LogsResponse {
    content: ActivityLog[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}

export interface LogSearchParams {
    search?: string
    category?: string
    action?: string
    actorRole?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
    sortDir?: 'asc' | 'desc'
}

/**
 * Get activity logs with search and filter
 * GET /api/super-admin/logs
 */
export const getLogs = async (params: LogSearchParams = {}): Promise<LogsResponse> => {
    try {
        const {
            search,
            category,
            action,
            actorRole,
            startDate,
            endDate,
            page = 0,
            size = 50,
            sortDir = 'desc'
        } = params

        const response = await apiClient.get<LogsResponse>('/super-admin/logs', {
            params: {
                search,
                category,
                action,
                actorRole,
                startDate,
                endDate,
                page,
                size,
                sortDir
            }
        })

        return response.data
    } catch (error) {
        console.error("Error fetching logs:", error)
        throw error
    }
}

/**
 * Get log by ID
 * GET /api/super-admin/logs/{id}
 */
export const getLogById = async (id: string): Promise<ActivityLog> => {
    try {
        const response = await apiClient.get<ActivityLog>(`/super-admin/logs/${id}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching log ${id}:`, error)
        throw error
    }
}

/**
 * Get log statistics
 * GET /api/super-admin/logs/statistics
 */
export const getLogStatistics = async (): Promise<LogStatistics> => {
    try {
        const response = await apiClient.get<LogStatistics>('/super-admin/logs/statistics')
        return response.data
    } catch (error) {
        console.error("Error fetching log statistics:", error)
        throw error
    }
}

/**
 * Get available categories
 * GET /api/super-admin/logs/categories
 */
export const getCategories = async (): Promise<string[]> => {
    try {
        const response = await apiClient.get<string[]>('/super-admin/logs/categories')
        return response.data
    } catch (error) {
        console.error("Error fetching categories:", error)
        throw error
    }
}

/**
 * Get available actions
 * GET /api/super-admin/logs/actions
 */
export const getActions = async (): Promise<string[]> => {
    try {
        const response = await apiClient.get<string[]>('/super-admin/logs/actions')
        return response.data
    } catch (error) {
        console.error("Error fetching actions:", error)
        throw error
    }
}
