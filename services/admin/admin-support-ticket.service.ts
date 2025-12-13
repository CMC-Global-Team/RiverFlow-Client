import {
    SupportTicket,
    TicketMessageRequest,
    AdminTicketUpdateRequest,
    SupportTicketMessage,
    TicketStatistics,
    Page
} from '@/types/support.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Admin Support Ticket Service
 */
class AdminSupportTicketService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Get all tickets with filtering, sorting, and pagination
     */
    async getAllTickets(params: {
        search?: string;
        status?: string;
        priority?: string;
        category?: string;
        assignedToId?: number;
        sortBy?: string;
        sortDir?: string;
        page?: number;
        size?: number;
    } = {}): Promise<Page<SupportTicket>> {
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.priority) queryParams.append('priority', params.priority);
        if (params.category) queryParams.append('category', params.category);
        if (params.assignedToId !== undefined) queryParams.append('assignedToId', params.assignedToId.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDir) queryParams.append('sortDir', params.sortDir);
        queryParams.append('page', (params.page || 0).toString());
        queryParams.append('size', (params.size || 10).toString());

        const response = await fetch(
            `${API_BASE_URL}/admin/support-tickets?${queryParams.toString()}`,
            {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch tickets');
        }

        return response.json();
    }

    /**
     * Get a specific ticket by ID (includes internal notes)
     */
    async getTicketById(ticketId: number): Promise<SupportTicket> {
        const response = await fetch(`${API_BASE_URL}/admin/support-tickets/${ticketId}`, {
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch ticket');
        }

        return response.json();
    }

    /**
     * Update ticket (status, priority, assignment)
     */
    async updateTicket(ticketId: number, request: AdminTicketUpdateRequest): Promise<SupportTicket> {
        const response = await fetch(`${API_BASE_URL}/admin/support-tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update ticket');
        }

        return response.json();
    }

    /**
     * Reply to ticket (with optional internal note)
     */
    async replyToTicket(
        ticketId: number,
        request: TicketMessageRequest,
        attachments?: File[]
    ): Promise<SupportTicketMessage> {
        const formData = new FormData();
        formData.append('message', new Blob([JSON.stringify(request)], { type: 'application/json' }));

        if (attachments) {
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
        }

        const response = await fetch(`${API_BASE_URL}/admin/support-tickets/${ticketId}/messages`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send reply');
        }

        return response.json();
    }

    /**
     * Close a ticket
     */
    async closeTicket(ticketId: number): Promise<SupportTicket> {
        const response = await fetch(`${API_BASE_URL}/admin/support-tickets/${ticketId}/close`, {
            method: 'PUT',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to close ticket');
        }

        return response.json();
    }

    /**
     * Get ticket statistics for dashboard
     */
    async getStatistics(): Promise<TicketStatistics> {
        const response = await fetch(`${API_BASE_URL}/admin/support-tickets/statistics`, {
            method: 'GET',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch statistics');
        }

        return response.json();
    }

    /**
     * Download an attachment
     */
    async downloadAttachment(attachmentId: number): Promise<Blob> {
        const response = await fetch(
            `${API_BASE_URL}/admin/support-tickets/attachments/${attachmentId}`,
            {
                method: 'GET',
                headers: this.getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to download attachment');
        }

        return response.blob();
    }
}

export const adminSupportTicketService = new AdminSupportTicketService();
