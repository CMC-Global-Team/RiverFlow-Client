export type NotificationType =
    | 'PROJECT_LEFT'
    | 'PROJECT_INVITE'
    | 'CREDIT_TOPUP_SUCCESS'
    | 'PROJECT_REMOVED'
    | 'TICKET_RESPONSE'
    | 'TICKET_UPDATE'
    | 'INVITE_ACCEPTED'
    | 'INVITE_DECLINED';

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

export interface InvitationDetails {
    id: string;
    token: string;
    mindmapId: string;
    mindmapTitle: string;
    mindmapDescription?: string;
    invitedByUserId: number;
    inviterName: string;
    inviterEmail?: string;
    inviterAvatarUrl?: string;
    invitedEmail: string;
    role: string;
    status: string;
    message?: string;
    createdAt: string;
    expiresAt: string;
}
