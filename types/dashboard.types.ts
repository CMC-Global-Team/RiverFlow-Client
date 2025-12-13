/**
 * Dashboard Types for Admin/Super Admin Dashboard
 * Matches Java DTO: AdminDashboardResponse.java
 */

// ==================== OVERVIEW STATS ====================

/**
 * High-level overview statistics
 */
export interface OverviewStats {
    totalUsers: number;
    totalMindmaps: number;
    totalRevenue: number;
    totalTransactions: number;
}

// ==================== QUICK STATS ====================

/**
 * Quick statistics - today/recent metrics
 */
export interface QuickStats {
    // User stats
    newUsersToday: number;
    activeUsersToday: number;

    // Mindmap stats
    newMindmapsToday: number;
    activeMindmaps: number;

    // Payment stats
    pendingPayments: number;
    revenueToday: number;
    transactionsToday: number;
}

// ==================== RECENT ACTIVITY ====================

/**
 * Recent activity item (SUPER_ADMIN only)
 */
export interface RecentActivityItem {
    id: number;
    action: string;
    actor: string;
    target: string;
    details: string | null;
    timestamp: string; // ISO date string
}

// ==================== DASHBOARD RESPONSE ====================

/**
 * Complete admin dashboard response
 */
export interface AdminDashboardResponse {
    overviewStats: OverviewStats;
    quickStats: QuickStats;
    userRole: string;
    recentActivity: RecentActivityItem[] | null; // null for regular admin
}
