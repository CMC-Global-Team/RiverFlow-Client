"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { adminSupportTicketService } from "@/services/admin/admin-support-ticket.service";
import {
    SupportTicket,
    TicketStatistics,
    Page,
    getStatusLabel,
    getStatusColor,
    getPriorityLabel,
    getPriorityColor,
    getCategoryLabel,
    TicketStatus,
    TicketPriority,
    TicketCategory,
} from "@/types/support.types";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    Ticket,
    Clock,
    CheckCircle,
    XCircle,
    User,
} from "lucide-react";

export default function AdminSupportRequestsPage() {
    const { t } = useTranslation("adminSupportRequests");
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<TicketStatistics | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        fetchTickets();
        fetchStatistics();
    }, [page, search, statusFilter, priorityFilter, categoryFilter]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await adminSupportTicketService.getAllTickets({
                search,
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                category: categoryFilter || undefined,
                page,
                size: 10,
                sortBy: "createdAt",
                sortDir: "desc",
            });
            setTickets(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            setError(err.message || "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await adminSupportTicketService.getStatistics();
            setStatistics(stats);
        } catch (err) {
            console.error("Failed to load statistics", err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchTickets();
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Support Requests</h1>
                <p className="text-muted-foreground mt-1">
                    Manage and respond to user support tickets
                </p>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Ticket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{statistics.totalTickets}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Open</p>
                                <p className="text-2xl font-bold">{statistics.openTickets}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Resolved</p>
                                <p className="text-2xl font-bold">{statistics.resolvedTickets}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Unassigned</p>
                                <p className="text-2xl font-bold">{statistics.unassignedTickets}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by ticket number, title, or email..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Status</option>
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="WAITING_FOR_RESPONSE">Waiting for Response</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
                        className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                        className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Categories</option>
                        <option value="BUG">Bug Report</option>
                        <option value="TECHNICAL_SUPPORT">Technical Support</option>
                        <option value="BILLING">Billing</option>
                        <option value="FEEDBACK">Feedback</option>
                        <option value="OTHER">Other</option>
                    </select>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Tickets Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <p className="text-muted-foreground">No tickets found</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ticket</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Assigned To</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    onClick={() => router.push(`/admin/support-requests/${ticket.id}`)}
                                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-mono">{ticket.ticketNumber}</p>
                                            <p className="font-medium text-foreground truncate max-w-[250px]">{ticket.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{ticket.userFullName}</p>
                                                <p className="text-xs text-muted-foreground">{ticket.userEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                            {getPriorityLabel(ticket.priority)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            {getCategoryLabel(ticket.category)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {ticket.assignedToFullName ? (
                                            <span className="text-sm">{ticket.assignedToFullName}</span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(ticket.createdAt)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-muted-foreground">
                        Showing {tickets.length} of {totalElements} tickets
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
