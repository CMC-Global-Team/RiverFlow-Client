import apiClient from "@/lib/apiClient";
import { Notification, NotificationUnreadCount, InvitationDetails } from "@/types/notification.types";

const NOTIFICATION_API = "/notifications";
const INVITATION_API = "/invitations";

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

    /**
     * Get invitation details by token
     */
    async getInvitationDetails(token: string): Promise<InvitationDetails> {
        const response = await apiClient.get<InvitationDetails>(`${INVITATION_API}/${token}`, {
            headers: { 'X-Allow-Public-Auth': '1' }
        });
        return response.data;
    },

    /**
     * Accept invitation by token
     */
    async acceptInvitation(token: string): Promise<{ success: boolean; message: string; mindmapId?: string; mindmapTitle?: string; requiresAuth?: boolean }> {
        const response = await apiClient.post(`${INVITATION_API}/${token}/accept`, null, {
            headers: { 'X-Allow-Public-Auth': '1' }
        });
        return response.data;
    },

    /**
     * Decline invitation by token
     */
    async declineInvitation(token: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post(`${INVITATION_API}/${token}/decline`, null, {
            headers: { 'X-Allow-Public-Auth': '1' }
        });
        return response.data;
    },
};

export default notificationService;
