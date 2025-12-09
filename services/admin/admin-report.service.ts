import apiClient from "@/lib/apiClient";
import {
    ReportStatisticsResponse,
    ReportTimeSeriesData,
    ReportExportRequest,
    TimePeriod,
} from "@/types/report.types";

/**
 * Admin Report Service
 * API calls for admin reports and statistics (SUPER_ADMIN only)
 */

/**
 * Get comprehensive statistics
 * GET /api/admin/reports/statistics
 */
export const getStatistics = async (): Promise<ReportStatisticsResponse> => {
    try {
        const response = await apiClient.get<ReportStatisticsResponse>('/admin/reports/statistics');
        return response.data;
    } catch (error) {
        console.error("Error fetching report statistics:", error);
        throw error;
    }
};

/**
 * Get time series data for charts
 * GET /api/admin/reports/time-series
 */
export const getTimeSeriesData = async (
    period: TimePeriod = 'DAILY',
    startDate?: string,
    endDate?: string
): Promise<ReportTimeSeriesData> => {
    try {
        const response = await apiClient.get<ReportTimeSeriesData>('/admin/reports/time-series', {
            params: {
                period,
                startDate,
                endDate,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching time series data:", error);
        throw error;
    }
};

/**
 * Export report as specified format
 * POST /api/admin/reports/export
 */
export const exportReport = async (request: ReportExportRequest): Promise<Blob> => {
    try {
        const response = await apiClient.post('/admin/reports/export', request, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error("Error exporting report:", error);
        throw error;
    }
};

/**
 * Download exported report file
 */
export const downloadReport = async (request: ReportExportRequest): Promise<void> => {
    try {
        const blob = await exportReport(request);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const reportType = request.reportType.toLowerCase();
        const extension = request.format.toLowerCase();
        link.download = `report_${reportType}_${date}.${extension}`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading report:", error);
        throw error;
    }
};
