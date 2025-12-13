import apiClient from "@/lib/apiClient";
import { Notification, NotificationUnreadCount } from "@/types/notification.types";

const NOTIFICATION_API = "/notifications";

export const notificationService = {
    /**
     * Get all notifications for the current user
     */
    async getNotifications(): Promise<Notification[]> {
        const response = await apiClient.get<Notification[]>(NOTIFICATION_API);
        return response.data;
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<NotificationUnreadCount>(`${NOTIFICATION_API}/unread-count`);
        return response.data.count;
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: number): Promise<Notification> {
        const response = await apiClient.put<Notification>(`${NOTIFICATION_API}/${notificationId}/read`);
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        await apiClient.put(`${NOTIFICATION_API}/read-all`);
    },
};

export default notificationService;
