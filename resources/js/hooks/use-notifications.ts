import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export type NotificationFilterValue = 'all' | 'unread' | NotificationCategory;

type CachedTabFeed = {
    items: AppNotificationItem[];
    currentPage: number;
    hasMore: boolean;
};

function getXsrfToken(): string {
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));

    return match ? decodeURIComponent(match.split('=')[1] ?? '') : '';
}

async function requestJson<T>(
    url: string,
    method: 'GET' | 'PATCH' | 'DELETE' = 'GET',
    signal?: AbortSignal,
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
        signal,
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
    const [activeFilter, setActiveFilter] =
        useState<NotificationFilterValue>('all');
    const [items, setItems] = useState<AppNotificationItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [busyAction, setBusyAction] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const cacheRef = useRef<
        Partial<Record<NotificationFilterValue, CachedTabFeed>>
    >({});
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);
    const hasLoadedOnceRef = useRef(false);

    useEffect(() => {
        setUnreadCount(sharedUnreadCount);
    }, [sharedUnreadCount]);

    const loadNotifications = useCallback(
        async (
            targetPage: number,
            append: boolean,
            targetFilter: NotificationFilterValue,
        ) => {
            if (!append) {
                abortControllerRef.current?.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;
            const requestId = ++requestIdRef.current;

            const cached = !append ? cacheRef.current[targetFilter] : undefined;

            if (append) {
                setLoadingMore(true);
            } else if (cached) {
                setItems(cached.items);
                setCurrentPage(cached.currentPage);
                setHasMore(cached.hasMore);
                setLoading(false);
                setRefreshing(false);
            } else if (!hasLoadedOnceRef.current) {
                setLoading(true);
                setRefreshing(false);
            } else {
                setLoading(false);
                setRefreshing(true);
            }

            setErrorMessage(null);

            try {
                const statusParam =
                    targetFilter === 'unread' ? 'unread' : undefined;
                const categoryParam =
                    targetFilter !== 'all' && targetFilter !== 'unread'
                        ? targetFilter
                        : undefined;

                const url = index.url({
                    query: {
                        page: targetPage > 1 ? targetPage : undefined,
                        status: statusParam,
                        category: categoryParam,
                    },
                });

                const payload = await requestJson<NotificationFeedResponse>(
                    url,
                    'GET',
                    controller.signal,
                );

                if (requestId !== requestIdRef.current) {
                    return;
                }

                setItems((prev) => {
                    const nextItems = append
                        ? [...prev, ...payload.data]
                        : payload.data;

                    cacheRef.current[targetFilter] = {
                        items: nextItems,
                        currentPage: payload.meta.current_page,
                        hasMore: payload.meta.has_more,
                    };

                    return nextItems;
                });

                hasLoadedOnceRef.current = true;
                setHasLoadedOnce(true);
                setCurrentPage(payload.meta.current_page);
                setHasMore(payload.meta.has_more);
                setUnreadCount(payload.unread_count);
                setReadCount(payload.read_count);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                if (requestId !== requestIdRef.current) {
                    return;
                }

                setErrorMessage(
                    'Gagal memuat notifikasi. Silakan coba beberapa saat lagi.',
                );
            } finally {
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                    setLoadingMore(false);
                }
            }
        },
        [],
    );

    useEffect(() => {
        if (!autoLoad) {
            abortControllerRef.current?.abort();
            return;
        }

        void loadNotifications(1, false, activeFilter);

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [autoLoad, activeFilter, loadNotifications]);

    const invalidateCache = () => {
        cacheRef.current = {};
    };

    const markAsRead = async (item: AppNotificationItem) => {
        if (item.is_read) {
            return;
        }

        try {
            const result = await requestJson<{
                unread_count: number;
                read_count: number;
            }>(read.url(item.id), 'PATCH');

            invalidateCache();
            setUnreadCount(result.unread_count);
            setReadCount(result.read_count);
            setItems((prev) =>
                activeFilter === 'unread'
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

    const downloadNotification = (item: AppNotificationItem) => {
        if (!item.download_url) {
            return;
        }

        if (!item.is_read) {
            invalidateCache();
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setReadCount((prev) => prev + 1);
            setItems((prev) =>
                activeFilter === 'unread'
                    ? prev.filter((entry) => entry.id !== item.id)
                    : prev.map((entry) =>
                          entry.id === item.id
                              ? { ...entry, is_read: true }
                              : entry,
                      ),
            );
        }

        window.location.assign(item.download_url);
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

            invalidateCache();
            setUnreadCount(result.unread_count);
            setReadCount(result.read_count);
            setItems((prev) =>
                activeFilter === 'unread'
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

            invalidateCache();
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

            invalidateCache();
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

        await loadNotifications(currentPage + 1, true, activeFilter);
    };

    return {
        items,
        unreadCount,
        readCount,
        activeFilter,
        setActiveFilter,
        hasMore,
        hasLoadedOnce,
        loading,
        refreshing,
        loadingMore,
        busyAction,
        errorMessage,
        markAsRead,
        openNotification,
        downloadNotification,
        markAllAsRead,
        deleteItem,
        deleteRead,
        loadMore,
    };
}
