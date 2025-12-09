/**
 * Report Types for Admin Statistics Dashboard
 * Matches Java DTOs: ReportStatisticsResponse, ReportTimeSeriesData, ReportExportRequest
 */

// ==================== STATISTICS TYPES ====================

/**
 * User statistics
 */
export interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    deletedUsers: number;

    // New users by time period
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;

    // By role
    adminCount: number;
    superAdminCount: number;
    regularUserCount: number;

    // Growth percentage (compared to previous period)
    weeklyGrowthPercent: number;
    monthlyGrowthPercent: number;
}

/**
 * Mindmap statistics
 */
export interface MindmapStatistics {
    totalMindmaps: number;
    activeMindmaps: number;
    archivedMindmaps: number;
    deletedMindmaps: number;

    // New mindmaps by time period
    newMindmapsToday: number;
    newMindmapsThisWeek: number;
    newMindmapsThisMonth: number;

    // By visibility
    publicMindmaps: number;
    privateMindmaps: number;

    // By AI generation
    aiGeneratedMindmaps: number;

    // Growth percentage
    weeklyGrowthPercent: number;
    monthlyGrowthPercent: number;
}

/**
 * Revenue statistics
 */
export interface RevenueStatistics {
    totalRevenue: number;
    totalTransactions: number;

    // Revenue by time period
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;

    // Transactions by time period
    transactionsToday: number;
    transactionsThisWeek: number;
    transactionsThisMonth: number;

    // Average transaction value
    averageTransactionValue: number;

    // Growth percentage
    weeklyGrowthPercent: number;
    monthlyGrowthPercent: number;
}

/**
 * Combined report statistics response
 */
export interface ReportStatisticsResponse {
    userStats: UserStatistics;
    mindmapStats: MindmapStatistics;
    revenueStats: RevenueStatistics;
}

// ==================== TIME SERIES TYPES ====================

/**
 * Time series point for charts
 */
export interface TimeSeriesPoint {
    label: string;
    value: number;
    formattedValue: string;
}

/**
 * Time series data for charts
 */
export interface ReportTimeSeriesData {
    labels: string[];
    userRegistrations: TimeSeriesPoint[];
    revenue: TimeSeriesPoint[];
    mindmapCreations: TimeSeriesPoint[];
    transactions: TimeSeriesPoint[];
}

/**
 * Time period for data grouping
 */
export type TimePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

// ==================== EXPORT TYPES ====================

/**
 * Report type for export
 */
export type ReportType = 'USERS' | 'REVENUE' | 'MINDMAPS' | 'ALL';

/**
 * Export format
 */
export type ExportFormat = 'CSV' | 'JSON' | 'XLSX';

/**
 * Time granularity for export
 */
export type TimeGranularity = 'DAY' | 'WEEK' | 'MONTH';

/**
 * Report export request parameters
 */
export interface ReportExportRequest {
    reportType: ReportType;
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
    format: ExportFormat;
    granularity?: TimeGranularity;
}
