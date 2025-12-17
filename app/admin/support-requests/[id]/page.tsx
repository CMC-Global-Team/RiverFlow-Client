"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
import { useTranslation } from "react-i18next";
import { adminSupportTicketService } from "@/services/admin/admin-support-ticket.service";
import {
    SupportTicket,
    TicketMessageRequest,
    AdminTicketUpdateRequest,
    getStatusLabel,
    getStatusColor,
    getPriorityLabel,
    getPriorityColor,
    getCategoryLabel,
    TicketStatus,
    TicketPriority,
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
    Download,
    Lock,
    RefreshCw,
    CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";

export default function AdminTicketDetailPage() {
    const { t } = useTranslation("admin");
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const ticketId = Number(params.id);

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reply form
    const [replyMessage, setReplyMessage] = useState("");
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [sending, setSending] = useState(false);

    // Update state
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const data = await adminSupportTicketService.getTicketById(ticketId);
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
            const request: TicketMessageRequest = {
                message: replyMessage,
                isInternalNote,
            };
            await adminSupportTicketService.replyToTicket(ticketId, request, attachments);
            setReplyMessage("");
            setIsInternalNote(false);
            setAttachments([]);
            fetchTicket();
        } catch (err: any) {
            setError(err.message || t("support.detail.replyError"));
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (status: TicketStatus) => {
        try {
            setUpdating(true);
            await adminSupportTicketService.updateTicket(ticketId, { status });
            fetchTicket();
        } catch (err: any) {
            setError(err.message || t("support.detail.updateError"));
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePriority = async (priority: TicketPriority) => {
        try {
            setUpdating(true);
            await adminSupportTicketService.updateTicket(ticketId, { priority });
            fetchTicket();
        } catch (err: any) {
            setError(err.message || t("support.detail.updateError"));
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignToMe = async () => {
        if (!user) return;
        try {
            setUpdating(true);
            await adminSupportTicketService.updateTicket(ticketId, { assignedToId: user.userId });
            fetchTicket();
        } catch (err: any) {
            setError(err.message || t("support.detail.updateError"));
        } finally {
            setUpdating(false);
        }
    };

    const handleCloseTicket = async () => {
        try {
            setUpdating(true);
            await adminSupportTicketService.closeTicket(ticketId);
            fetchTicket();
        } catch (err: any) {
            setError(err.message || t("support.detail.updateError"));
        } finally {
            setUpdating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files).slice(0, 5));
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error || t("support.detail.notFound")}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
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
                    title="Refresh"
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
                            {ticket.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-3 rounded-lg ${message.isInternalNote
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                        : message.senderRole === "USER"
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
                                            {message.senderRole}
                                        </span>
                                        {message.isInternalNote && (
                                            <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                <Lock className="h-3 w-3" /> {t("support.detail.internalNote")}
                                            </span>
                                        )}
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
                        </div>
                    </div>

                    {/* Reply Form */}
                    {ticket.status !== "CLOSED" && (
                        <form onSubmit={handleSendReply} className="bg-card border border-border rounded-lg p-4">
                            <h3 className="font-medium mb-3">{t("support.detail.reply")}</h3>
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder={t("support.detail.replyPlaceholder")}
                                rows={4}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isInternalNote}
                                            onChange={(e) => setIsInternalNote(e.target.checked)}
                                            className="rounded border-border"
                                        />
                                        <span className="text-sm flex items-center gap-1">
                                            <Lock className="h-3 w-3" /> {t("support.detail.internalNote")}
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                                        <Paperclip className="h-4 w-4" />
                                        <span className="text-sm">
                                            {attachments.length > 0 ? `${attachments.length} files` : t("support.detail.attachFiles")}
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={sending || !replyMessage.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {t("support.detail.sendReply")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Ticket Info */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-medium mb-3">{t("support.detail.ticketInfo")}</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("support.table.category")}</span>
                                <span>{t(`support.category.${ticket.category}`)}</span>
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
                                    <span className="text-muted-foreground">{t("support.status.RESOLVED")}</span>
                                    <span>{formatDate(ticket.resolvedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-medium mb-3">{t("support.detail.postedBy")}</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">{ticket.userFullName}</p>
                                <p className="text-sm text-muted-foreground">{ticket.userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-medium mb-3">{t("support.detail.actions")}</h3>
                        <div className="space-y-3">
                            {/* Status */}
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">{t("support.table.status")}</label>
                                <select
                                    value={ticket.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                                    disabled={updating}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                >
                                    <option value="NEW">{t("support.status.NEW")}</option>
                                    <option value="IN_PROGRESS">{t("support.status.IN_PROGRESS")}</option>
                                    <option value="ON_HOLD">{t("support.status.ON_HOLD")}</option>
                                    <option value="WAITING_FOR_RESPONSE">{t("support.status.WAITING_FOR_RESPONSE")}</option>
                                    <option value="RESOLVED">{t("support.status.RESOLVED")}</option>
                                    <option value="CLOSED">{t("support.status.CLOSED")}</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">{t("support.table.priority")}</label>
                                <select
                                    value={ticket.priority}
                                    onChange={(e) => handleUpdatePriority(e.target.value as TicketPriority)}
                                    disabled={updating}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                >
                                    <option value="LOW">{t("support.priority.LOW")}</option>
                                    <option value="MEDIUM">{t("support.priority.MEDIUM")}</option>
                                    <option value="HIGH">{t("support.priority.HIGH")}</option>
                                    <option value="URGENT">{t("support.priority.URGENT")}</option>
                                </select>
                            </div>

                            {/* Assignment */}
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">{t("support.table.assignedTo")}</label>
                                <p className="text-sm mb-2">
                                    {ticket.assignedToFullName || <span className="text-muted-foreground italic">{t("support.detail.unassigned")}</span>}
                                </p>
                                {!ticket.assignedToId && (
                                    <button
                                        onClick={handleAssignToMe}
                                        disabled={updating}
                                        className="w-full px-3 py-2 bg-muted text-sm rounded-lg hover:bg-muted/80"
                                    >
                                        {t("support.detail.assignToMe")}
                                    </button>
                                )}
                            </div>

                            {/* Close Button */}
                            {ticket.status !== "CLOSED" && (
                                <button
                                    onClick={handleCloseTicket}
                                    disabled={updating}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    {t("support.detail.closeTicket")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
