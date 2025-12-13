export type NotificationType =
    | 'PROJECT_LEFT'
    | 'PROJECT_INVITE'
    | 'CREDIT_TOPUP_SUCCESS'
    | 'PROJECT_REMOVED'
    | 'TICKET_RESPONSE'
    | 'TICKET_UPDATE';

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    actionUrl?: string;
    actionLabel?: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationUnreadCount {
    count: number;
}
