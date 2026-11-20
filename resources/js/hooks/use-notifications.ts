import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    destroy,
    destroyRead,
    index,
    read,
    readAll,
} from '@/routes/notifications';
import type {
    AppNotificationItem,
    NotificationCategory,
    NotificationFeedResponse,
} from '@/types/notification';

export type NotificationStatusFilter = 'all' | 'unread';

function getXsrfToken(): string {
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));

    return match ? decodeURIComponent(match.split('=')[1] ?? '') : '';
}

async function requestJson<T>(
    url: string,
    method: 'GET' | 'PATCH' | 'DELETE' = 'GET',
): Promise<T> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (method !== 'GET') {
        const token = getXsrfToken();

        if (token !== '') {
            headers['X-XSRF-TOKEN'] = token;
        }
    }

    const response = await fetch(url, {
        method,
        headers,
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
}

export function useNotifications(autoLoad: boolean) {
    const { notifications: sharedNotifications } = usePage().props;
    const sharedUnreadCount = sharedNotifications?.unread_count ?? 0;

    const [unreadCount, setUnreadCount] = useState(sharedUnreadCount);
    const [readCount, setReadCount] = useState(0);
    const [status, setStatus] = useState<NotificationStatusFilter>('all');
    const [category, setCategory] = useState<'' | NotificationCategory>('');
    const [items, setItems] = useState<AppNotificationItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [busyAction, setBusyAction] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setUnreadCount(sharedUnreadCount);
    }, [sharedUnreadCount]);

    const loadNotifications = async (
        targetPage: number,
        append: boolean,
        targetStatus: NotificationStatusFilter = status,
        targetCategory: '' | NotificationCategory = category,
    ) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        setErrorMessage(null);

        try {
            const url = index.url({
                query: {
                    page: targetPage > 1 ? targetPage : undefined,
                    status: targetStatus === 'unread' ? 'unread' : undefined,
                    category: targetCategory || undefined,
                },
            });

            const payload = await requestJson<NotificationFeedResponse>(
                url,
                'GET',
            );

            setItems((prev) =>
                append ? [...prev, ...payload.data] : payload.data,
            );
            setCurrentPage(payload.meta.current_page);
            setHasMore(payload.meta.has_more);
            setUnreadCount(payload.unread_count);
            setReadCount(payload.read_count);
        } catch {
            setErrorMessage(
                'Gagal memuat notifikasi. Silakan coba beberapa saat lagi.',
            );
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!autoLoad) {
            return;
        }

        void loadNotifications(1, false, status, category);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLoad, status, category]);

    const markAsRead = async (item: AppNotificationItem) => {
        if (item.is_read) {
            return;
        }

        try {
            const result = await requestJson<{
                unread_count: number;
                read_count: number;
            }>(read.url(item.id), 'PATCH');

            setUnreadCount(result.unread_count);
            setReadCount(result.read_count);
            setItems((prev) =>
                status === 'unread'
                    ? prev.filter((entry) => entry.id !== item.id)
                    : prev.map((entry) =>
                          entry.id === item.id
                              ? { ...entry, is_read: true }
                              : entry,
                      ),
            );
        } catch {
            setErrorMessage('Gagal menandai notifikasi sebagai dibaca.');
        }
    };

    const openNotification = async (
        item: AppNotificationItem,
        onBeforeNavigate?: () => void,
    ) => {
        if (!item.is_read) {
            await markAsRead(item);
        }

        if (item.action_url) {
            onBeforeNavigate?.();
            router.visit(item.action_url);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0 || busyAction) {
            return;
        }

        setBusyAction(true);

        try {
            const result = await requestJson<{
                unread_count: number;
                read_count: number;
            }>(readAll.url(), 'PATCH');

            setUnreadCount(result.unread_count);
            setReadCount(result.read_count);
            setItems((prev) =>
                status === 'unread'
                    ? []
                    : prev.map((entry) => ({ ...entry, is_read: true })),
            );
        } catch {
            setErrorMessage('Gagal menandai semua notifikasi sebagai dibaca.');
        } finally {
            setBusyAction(false);
        }
    };

    const deleteItem = async (item: AppNotificationItem) => {
        try {
            const result = await requestJson<{
                unread_count: number;
                read_count: number;
            }>(destroy.url(item.id), 'DELETE');

            setUnreadCount(result.unread_count);
            setReadCount(result.read_count);
            setItems((prev) => prev.filter((entry) => entry.id !== item.id));
        } catch {
            setErrorMessage('Gagal menghapus notifikasi.');
        }
    };

    const deleteRead = async () => {
        if (readCount === 0 || busyAction) {
            return;
        }

        setBusyAction(true);

        try {
            const result = await requestJson<{
                unread_count: number;
                read_count: number;
            }>(destroyRead.url(), 'DELETE');

            setUnreadCount(result.unread_count);
            setReadCount(result.read_count);
            setItems((prev) => prev.filter((entry) => !entry.is_read));
        } catch {
            setErrorMessage('Gagal menghapus notifikasi yang sudah dibaca.');
        } finally {
            setBusyAction(false);
        }
    };

    const loadMore = async () => {
        if (!hasMore || loadingMore) {
            return;
        }

        await loadNotifications(currentPage + 1, true);
    };

    return {
        items,
        unreadCount,
        readCount,
        status,
        setStatus,
        category,
        setCategory,
        hasMore,
        loading,
        loadingMore,
        busyAction,
        errorMessage,
        markAsRead,
        openNotification,
        markAllAsRead,
        deleteItem,
        deleteRead,
        loadMore,
    };
}
