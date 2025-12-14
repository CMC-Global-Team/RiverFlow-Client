"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import {
    UserPlus,
    UserMinus,
    LogOut,
    MessageSquare,
    RefreshCw,
    Gift,
    Check,
    X,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    MapPin,
} from "lucide-react"
import { Notification, NotificationType, InvitationDetails } from "@/types/notification.types"
import notificationService from "@/services/notification.service"

interface NotificationModalProps {
    notification: Notification | null;
    isOpen: boolean;
    onClose: () => void;
    onActionComplete?: () => void;
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

export default function NotificationModal({
    notification,
    isOpen,
    onClose,
    onActionComplete
}: NotificationModalProps) {
    const { t } = useTranslation("notifications")
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [actionMessage, setActionMessage] = useState('')

    // Extract token from actionUrl (e.g., "/invitation/abc123" -> "abc123")
    const extractToken = (actionUrl?: string): string | null => {
        if (!actionUrl) return null;
        const match = actionUrl.match(/\/invitation\/([^/]+)$/);
        return match ? match[1] : null;
    };

    // Load invitation details when modal opens for PROJECT_INVITE type
    useEffect(() => {
        if (isOpen && notification?.type === 'PROJECT_INVITE' && notification.actionUrl) {
            const token = extractToken(notification.actionUrl);
            if (token) {
                loadInvitationDetails(token);
            }
        } else {
            setInvitationDetails(null);
            setActionStatus('idle');
            setActionMessage('');
        }
    }, [isOpen, notification]);

    const loadInvitationDetails = async (token: string) => {
        setIsLoading(true);
        try {
            const details = await notificationService.getInvitationDetails(token);
            setInvitationDetails(details);
        } catch (error) {
            console.error('Failed to load invitation details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptInvitation = async () => {
        if (!invitationDetails?.token) return;

        setActionStatus('loading');
        try {
            const response = await notificationService.acceptInvitation(invitationDetails.token);
            if (response.success) {
                setActionStatus('success');
                setActionMessage(response.message || 'Invitation accepted!');

                // If requires auth, show message and redirect to login
                if (response.requiresAuth) {
                    setTimeout(() => {
                        onClose();
                        router.push('/auth/signin');
                    }, 2000);
                } else if (response.mindmapId) {
                    setTimeout(() => {
                        onClose();
                        onActionComplete?.();
                        router.push(`/editor?id=${response.mindmapId}`);
                    }, 1500);
                }
            } else {
                setActionStatus('error');
                setActionMessage(response.message || 'Failed to accept invitation');
            }
        } catch (error: any) {
            setActionStatus('error');
            setActionMessage(error.response?.data?.message || 'Failed to accept invitation');
        }
    };

    const handleDeclineInvitation = async () => {
        if (!invitationDetails?.token) return;

        setActionStatus('loading');
        try {
            const response = await notificationService.declineInvitation(invitationDetails.token);
            if (response.success) {
                setActionStatus('success');
                setActionMessage(response.message || 'Invitation declined');
                setTimeout(() => {
                    onClose();
                    onActionComplete?.();
                }, 1500);
            } else {
                setActionStatus('error');
                setActionMessage(response.message || 'Failed to decline invitation');
            }
        } catch (error: any) {
            setActionStatus('error');
            setActionMessage(error.response?.data?.message || 'Failed to decline invitation');
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'PROJECT_INVITE':
                return <UserPlus className="h-8 w-8 text-blue-500" />;
            case 'PROJECT_LEFT':
                return <LogOut className="h-8 w-8 text-orange-500" />;
            case 'PROJECT_REMOVED':
                return <UserMinus className="h-8 w-8 text-red-500" />;
            case 'CREDIT_TOPUP_SUCCESS':
                return <Gift className="h-8 w-8 text-green-500" />;
            case 'TICKET_RESPONSE':
                return <MessageSquare className="h-8 w-8 text-purple-500" />;
            case 'TICKET_UPDATE':
                return <RefreshCw className="h-8 w-8 text-indigo-500" />;
            case 'INVITE_ACCEPTED':
                return <CheckCircle className="h-8 w-8 text-green-500" />;
            case 'INVITE_DECLINED':
                return <XCircle className="h-8 w-8 text-red-500" />;
            default:
                return <MapPin className="h-8 w-8 text-muted-foreground" />;
        }
    };

    const renderInvitationContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        if (actionStatus === 'success') {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">Success!</p>
                    <p className="text-muted-foreground">{actionMessage}</p>
                </div>
            );
        }

        if (actionStatus === 'error') {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                        <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">Error</p>
                    <p className="text-muted-foreground">{actionMessage}</p>
                    <button
                        onClick={() => setActionStatus('idle')}
                        className="mt-4 text-primary hover:underline"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        if (!invitationDetails) {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">Unable to load invitation details</p>
                </div>
            );
        }

        return (
            <>
                <div className="space-y-4 py-4">
                    {/* Mindmap Info */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Project</p>
                        <p className="text-lg font-semibold text-foreground">
                            {invitationDetails.mindmapTitle}
                        </p>
                        {invitationDetails.mindmapDescription && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {invitationDetails.mindmapDescription}
                            </p>
                        )}
                    </div>

                    {/* Inviter Info */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                            {invitationDetails.inviterName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{invitationDetails.inviterName}</p>
                            <p className="text-sm text-muted-foreground">{invitationDetails.inviterEmail}</p>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">Role</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${invitationDetails.role === 'EDITOR'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                            {invitationDetails.role === 'EDITOR' ? 'Editor' : 'Viewer'}
                        </span>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                            Expires {formatTimeAgo(invitationDetails.expiresAt)}
                        </span>
                    </div>

                    {/* Message */}
                    {invitationDetails.message && (
                        <div className="border-t border-border pt-4">
                            <p className="text-sm text-muted-foreground mb-1">Message</p>
                            <p className="text-foreground italic">"{invitationDetails.message}"</p>
                        </div>
                    )}
                </div>

                <SheetFooter className="flex gap-3 mt-4">
                    <button
                        onClick={handleDeclineInvitation}
                        disabled={actionStatus === 'loading'}
                        className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                    >
                        {actionStatus === 'loading' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <X className="h-4 w-4" />
                        )}
                        Decline
                    </button>
                    <button
                        onClick={handleAcceptInvitation}
                        disabled={actionStatus === 'loading'}
                        className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                    >
                        {actionStatus === 'loading' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        Accept
                    </button>
                </SheetFooter>
            </>
        );
    };

    const renderDefaultContent = () => (
        <div className="space-y-4 py-4">
            <p className="text-foreground">{notification?.message}</p>

            {notification?.entityType && notification?.entityId && (
                <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                        Related to: {notification.entityType} • {notification.entityId}
                    </p>
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                {notification?.createdAt && formatTimeAgo(notification.createdAt)}
            </p>

            {notification?.actionUrl && notification?.actionLabel && (
                <SheetFooter className="mt-4">
                    <button
                        onClick={() => {
                            onClose();
                            router.push(notification.actionUrl!);
                        }}
                        className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                    >
                        {notification.actionLabel}
                    </button>
                </SheetFooter>
            )}
        </div>
    );

    const renderContent = () => {
        if (!notification) return null;

        switch (notification.type) {
            case 'PROJECT_INVITE':
                return renderInvitationContent();
            // Other notification types can be added here
            default:
                return renderDefaultContent();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-4 border-b border-border">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            {notification && getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-lg font-semibold">
                                {notification?.title || 'Notification'}
                            </SheetTitle>
                            <SheetDescription className="text-sm text-muted-foreground mt-1">
                                {notification?.type === 'PROJECT_INVITE'
                                    ? 'You have received a collaboration invitation'
                                    : 'Notification details'}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {renderContent()}
            </SheetContent>
        </Sheet>
    );
}
