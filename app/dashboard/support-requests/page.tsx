"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { supportTicketService } from "@/services/support/support-ticket.service";
import {
    SupportTicket,
    Page,
    getStatusLabel,
    getStatusColor,
    getPriorityLabel,
    getPriorityColor,
    getCategoryLabel,
    TicketCategory,
    TicketPriority,
    CreateTicketRequest,
} from "@/types/support.types";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    Tag,
    AlertCircle,
    X,
    Paperclip,
    Loader2,
} from "lucide-react";

function SupportRequestsContent() {
    const { t } = useTranslation("dashboard");
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateTicketRequest>({
        title: "",
        description: "",
        category: "OTHER",
        priority: "MEDIUM",
    });
    const [attachments, setAttachments] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, [page]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await supportTicketService.getMyTickets(page, 10);
            setTickets(response.content);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.message || t("support.toasts.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await supportTicketService.createTicket(formData, attachments);
            setShowCreateModal(false);
            setFormData({ title: "", description: "", category: "OTHER", priority: "MEDIUM" });
            setAttachments([]);
            fetchTickets();
        } catch (err: any) {
            setError(err.message || t("support.toasts.createFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 5);
            setAttachments(files);
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

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64">
                <DashboardHeader />

                <main className="flex-1 overflow-auto">
                    <div className="p-6 max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{t("support.title")}</h1>
                                <p className="text-muted-foreground mt-1">
                                    {t("support.subtitle")}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                {t("support.newTicket")}
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {error}
                            </div>
                        )}

                        {/* Tickets List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-12 bg-card rounded-lg border border-border">
                                <p className="text-muted-foreground">{t("support.list.noTickets")}</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 text-primary hover:underline"
                                >
                                    {t("support.list.createFirst")}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => router.push(`/dashboard/support-requests/${ticket.id}`)}
                                        className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {ticket.ticketNumber}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                        {getStatusLabel(ticket.status)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                                        {getPriorityLabel(ticket.priority)}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {ticket.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {ticket.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {getCategoryLabel(ticket.category)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(ticket.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm text-muted-foreground">
                                    {t("billing.history.pagination.page")} {page + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Create Modal */}
                        {showCreateModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center p-4 border-b border-border">
                                        <h2 className="text-xl font-semibold">{t("support.create.title")}</h2>
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="p-2 hover:bg-muted rounded-lg"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateTicket} className="p-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">{t("support.create.titleLabel")}</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder={t("support.create.titlePlaceholder")}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">{t("support.create.descLabel")}</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                required
                                                rows={4}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                                placeholder={t("support.create.descPlaceholder")}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">{t("support.create.categoryLabel")}</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    {Object.keys(t("support.category", { returnObjects: true })).map((key) => (
                                                        <option key={key} value={key}>
                                                            {t(`support.category.${key}`)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">{t("support.create.priorityLabel")}</label>
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    {Object.keys(t("support.priority", { returnObjects: true })).map((key) => (
                                                        <option key={key} value={key}>
                                                            {t(`support.priority.${key}`)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">{t("support.create.attachmentsLabel")}</label>
                                            <label className="flex items-center gap-2 px-3 py-2 bg-background border border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50">
                                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {attachments.length > 0
                                                        ? `${attachments.length} ${t("support.create.filesSelected")}`
                                                        : t("support.create.attachFiles")}
                                                </span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateModal(false)}
                                                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                            >
                                                {t("support.create.cancel")}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {t("support.create.submit")}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function SupportRequestsPage() {
    return (
        <ProtectedRoute>
            <SupportRequestsContent />
        </ProtectedRoute>
    );
}
