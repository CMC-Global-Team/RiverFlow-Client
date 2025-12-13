import {
    SupportTicket,
    CreateTicketRequest,
    TicketMessageRequest,
    SupportTicketMessage,
    Page
} from '@/types/support.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * User Support Ticket Service
 */
class SupportTicketService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Create a new support ticket
     */
    async createTicket(
        request: CreateTicketRequest,
        attachments?: File[]
    ): Promise<SupportTicket> {
        const formData = new FormData();
        formData.append('ticket', new Blob([JSON.stringify(request)], { type: 'application/json' }));

        if (attachments) {
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
        }

        const response = await fetch(`${API_BASE_URL}/support-tickets`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create ticket');
        }

        return response.json();
    }

    /**
     * Get user's tickets with pagination
     */
    async getMyTickets(page: number = 0, size: number = 10): Promise<Page<SupportTicket>> {
        const response = await fetch(
            `${API_BASE_URL}/support-tickets?page=${page}&size=${size}`,
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
     * Get a specific ticket by ID
     */
    async getTicketById(ticketId: number): Promise<SupportTicket> {
        const response = await fetch(`${API_BASE_URL}/support-tickets/${ticketId}`, {
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
     * Reply to a ticket
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

        const response = await fetch(`${API_BASE_URL}/support-tickets/${ticketId}/messages`, {
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
     * Download an attachment
     */
    async downloadAttachment(attachmentId: number): Promise<Blob> {
        const response = await fetch(
            `${API_BASE_URL}/support-tickets/attachments/${attachmentId}`,
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

export const supportTicketService = new SupportTicketService();
