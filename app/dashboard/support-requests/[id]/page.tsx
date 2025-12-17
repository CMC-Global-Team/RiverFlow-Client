"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { supportTicketService } from "@/services/support/support-ticket.service";
import {
    SupportTicket,
    TicketMessageRequest,
    getStatusLabel,
    getStatusColor,
    getPriorityLabel,
    getPriorityColor,
    getCategoryLabel,
} from "@/types/support.types";
import {
    ArrowLeft,
    Send,
    User,
    Clock,
    Tag,
    AlertCircle,
    Loader2,
    Paperclip,
    RefreshCw,
} from "lucide-react";

function TicketDetailContent() {
    const { t, i18n } = useTranslation("dashboard");
    const params = useParams();
    const router = useRouter();
    const ticketId = Number(params.id);

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reply form
    const [replyMessage, setReplyMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const data = await supportTicketService.getTicketById(ticketId);
            setTicket(data);
        } catch (err: any) {
            setError(err.message || t("support.detail.loadError"));
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            setSending(true);
            await supportTicketService.replyToTicket(ticketId, { message: replyMessage }, attachments);
            setReplyMessage("");
            setAttachments([]);
            fetchTicket();
        } catch (err: any) {
            setError(err.message || t("support.detail.replyError"));
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files).slice(0, 5));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64">
                    <DashboardHeader />
                    <main className="flex-1 overflow-auto">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64">
                    <DashboardHeader />
                    <main className="flex-1 overflow-auto">
                        <div className="p-6">
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {error || t("support.detail.notFound")}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <DashboardHeader />
                <main className="flex-1 overflow-auto">
                    <div className="p-6 max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => router.push("/dashboard/support-requests")}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-muted-foreground font-mono">
                                        {ticket.ticketNumber}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                        {t(`support.status.${ticket.status}`)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                        {t(`support.priority.${ticket.priority}`)}
                                    </span>
                                </div>
                                <h1 className="text-xl font-bold text-foreground">{ticket.title}</h1>
                            </div>
                            <button
                                onClick={fetchTicket}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                title={t("common.retry") || "Refresh"}
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Description */}
                                <div className="bg-card border border-border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">{t("support.detail.description")}</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                                </div>

                                {/* Messages */}
                                <div className="bg-card border border-border rounded-lg p-4">
                                    <h3 className="font-medium mb-4">{t("support.detail.conversation")}</h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                        {ticket.messages.filter(m => !m.isInternalNote).map((message) => (
                                            <div
                                                key={message.id}
                                                className={`p-3 rounded-lg ${message.senderRole === "USER"
                                                    ? "bg-muted/50"
                                                    : "bg-primary/5 border border-primary/20"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-3 w-3" />
                                                    </div>
                                                    <span className="text-sm font-medium">{message.senderFullName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {message.senderRole === "USER" ? t("support.detail.you") : t("support.detail.support")}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        {formatDate(message.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                                {message.attachments.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {message.attachments.map((att) => (
                                                            <a
                                                                key={att.id}
                                                                href={`${API_BASE_URL}${att.downloadUrl?.replace('/api', '')}`}
                                                                className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                                                            >
                                                                <Paperclip className="h-3 w-3" />
                                                                {att.fileName}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {ticket.messages.filter(m => !m.isInternalNote).length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                {t("support.detail.noMessages")}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Reply Form */}
                                {ticket.status !== "CLOSED" && (
                                    <form onSubmit={handleSendReply} className="bg-card border border-border rounded-lg p-4">
                                        <h3 className="font-medium mb-3">{t("support.detail.sendReply")}</h3>
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder={t("support.detail.replyPlaceholder")}
                                            rows={4}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                                        />
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                                                <Paperclip className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {attachments.length > 0 ? t("support.detail.attachFilesCount", { count: attachments.length }) : t("support.detail.attachFiles")}
                                                </span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            <button
                                                type="submit"
                                                disabled={sending || !replyMessage.trim()}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                {t("support.detail.reply")}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {ticket.status === "CLOSED" && (
                                    <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                                        <p className="text-muted-foreground">
                                            {t("support.detail.closedMessage")}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4">
                                {/* Ticket Info */}
                                <div className="bg-card border border-border rounded-lg p-4">
                                    <h3 className="font-medium mb-3">{t("support.detail.ticketDetails")}</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("support.table.category")}</span>
                                            <span>{t(`support.category.${ticket.category}`)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("support.table.priority")}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                                {t(`support.priority.${ticket.priority}`)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("support.table.status")}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                {t(`support.status.${ticket.status}`)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("support.detail.created")}</span>
                                            <span>{formatDate(ticket.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("support.detail.updated")}</span>
                                            <span>{formatDate(ticket.updatedAt)}</span>
                                        </div>
                                        {ticket.resolvedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t("support.detail.resolved")}</span>
                                                <span>{formatDate(ticket.resolvedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Assigned Staff */}
                                {ticket.assignedToFullName && (
                                    <div className="bg-card border border-border rounded-lg p-4">
                                        <h3 className="font-medium mb-3">{t("support.detail.supportAgent")}</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{ticket.assignedToFullName}</p>
                                                <p className="text-sm text-muted-foreground">{t("support.detail.handlingRequest")}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function TicketDetailPage() {
    return (
        <ProtectedRoute>
            <TicketDetailContent />
        </ProtectedRoute>
    );
}
