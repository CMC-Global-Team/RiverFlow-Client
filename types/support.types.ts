/**
 * Support Ticket Types
 */

// Enums
export type TicketCategory = 'BUG' | 'TECHNICAL_SUPPORT' | 'BILLING' | 'FEEDBACK' | 'OTHER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'WAITING_FOR_RESPONSE' | 'RESOLVED' | 'CLOSED';

// Attachment
export interface SupportTicketAttachment {
    id: number;
    fileName: string;
    mimeType: string;
    fileSize: number;
    downloadUrl: string;
    createdAt: string;
}

// Message
export interface SupportTicketMessage {
    id: number;
    message: string;
    isInternalNote: boolean;
    senderId: number;
    senderEmail: string;
    senderFullName: string;
    senderRole: string;
    senderAvatarUrl: string | null;
    attachments: SupportTicketAttachment[];
    createdAt: string;
}

// Ticket
export interface SupportTicket {
    id: number;
    ticketNumber: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    userId: number;
    userEmail: string;
    userFullName: string;
    assignedToId: number | null;
    assignedToEmail: string | null;
    assignedToFullName: string | null;
    messages: SupportTicketMessage[];
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    closedAt: string | null;
}

// Request DTOs
export interface CreateTicketRequest {
    title: string;
    description: string;
    category?: TicketCategory;
    priority?: TicketPriority;
}

export interface TicketMessageRequest {
    message: string;
    isInternalNote?: boolean;
}

export interface AdminTicketUpdateRequest {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToId?: number | null;
}

// Statistics
export interface TicketStatistics {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    ticketsByStatus: Record<string, number>;
    ticketsByPriority: Record<string, number>;
    ticketsByCategory: Record<string, number>;
    unassignedTickets: number;
}

// Paginated response
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Helper functions
export const getStatusLabel = (status: TicketStatus): string => {
    const labels: Record<TicketStatus, string> = {
        'NEW': 'New',
        'IN_PROGRESS': 'In Progress',
        'ON_HOLD': 'On Hold',
        'WAITING_FOR_RESPONSE': 'Waiting for Response',
        'RESOLVED': 'Resolved',
        'CLOSED': 'Closed'
    };
    return labels[status] || status;
};

export const getStatusColor = (status: TicketStatus): string => {
    const colors: Record<TicketStatus, string> = {
        'NEW': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'ON_HOLD': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'WAITING_FOR_RESPONSE': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        'RESOLVED': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'CLOSED': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    };
    return colors[status] || '';
};

export const getPriorityLabel = (priority: TicketPriority): string => {
    const labels: Record<TicketPriority, string> = {
        'LOW': 'Low',
        'MEDIUM': 'Medium',
        'HIGH': 'High',
        'URGENT': 'Urgent'
    };
    return labels[priority] || priority;
};

export const getPriorityColor = (priority: TicketPriority): string => {
    const colors: Record<TicketPriority, string> = {
        'LOW': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'MEDIUM': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'HIGH': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        'URGENT': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || '';
};

export const getCategoryLabel = (category: TicketCategory): string => {
    const labels: Record<TicketCategory, string> = {
        'BUG': 'Bug Report',
        'TECHNICAL_SUPPORT': 'Technical Support',
        'BILLING': 'Billing',
        'FEEDBACK': 'Feedback',
        'OTHER': 'Other'
    };
    return labels[category] || category;
};
