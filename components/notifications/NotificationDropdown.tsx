"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, CheckCheck, Gift, UserPlus, UserMinus, LogOut, MessageSquare, RefreshCw, X, CheckCircle, XCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { Notification, NotificationType } from "@/types/notification.types"
import notificationService from "@/services/notification.service"
import NotificationModal from "./NotificationModal"

interface NotificationDropdownProps {
    className?: string;
}

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'PROJECT_INVITE':
            return <UserPlus className="h-4 w-4 text-blue-500" />;
        case 'PROJECT_LEFT':
            return <LogOut className="h-4 w-4 text-orange-500" />;
        case 'PROJECT_REMOVED':
            return <UserMinus className="h-4 w-4 text-red-500" />;
        case 'CREDIT_TOPUP_SUCCESS':
            return <Gift className="h-4 w-4 text-green-500" />;
        case 'TICKET_RESPONSE':
            return <MessageSquare className="h-4 w-4 text-purple-500" />;
        case 'TICKET_UPDATE':
            return <RefreshCw className="h-4 w-4 text-indigo-500" />;
        case 'INVITE_ACCEPTED':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'INVITE_DECLINED':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
};

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

export default function NotificationDropdown({ className = "" }: NotificationDropdownProps) {
    const { t } = useTranslation("dashboardHeader")
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        // Check if this notification type should open a modal
        const modalTypes = ['PROJECT_INVITE'];
        if (modalTypes.includes(notification.type)) {
            setSelectedNotification(notification);
            setIsModalOpen(true);
            setIsOpen(false);
        } else if (notification.actionUrl) {
            // Navigate if there's an action URL
            setIsOpen(false);
            router.push(notification.actionUrl);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Bell Icon Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 hover:bg-muted transition-colors relative"
                aria-label={t("notifications") || "Notifications"}
            >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                        <h3 className="font-semibold text-sm">{t("notifications") || "Notifications"}</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                >
                                    <CheckCheck className="h-3 w-3" />
                                    {t("markAllAsRead") || "Mark all as read"}
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-muted rounded"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Bell className="h-10 w-10 mb-2 opacity-50" />
                                <p className="text-sm">{t("noNotifications") || "No notifications"}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 ${!notification.isRead ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            <NotificationModal
                notification={selectedNotification}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedNotification(null);
                }}
                onActionComplete={() => {
                    fetchNotifications();
                    fetchUnreadCount();
                }}
            />
        </div>
    );
}
