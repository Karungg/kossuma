import { router, usePage } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
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
    NotificationLevel,
} from '@/types/notification';

type StatusFilter = 'all' | 'unread';

const CATEGORY_OPTIONS: Array<{
    value: '' | NotificationCategory;
    label: string;
}> = [
    { value: '', label: 'Semua' },
    { value: 'order', label: 'Pesanan' },
    { value: 'product', label: 'Produk' },
    { value: 'category', label: 'Kategori' },
    { value: 'system', label: 'Sistem' },
    { value: 'account', label: 'Akun' },
];

const LEVEL_DOT_STYLES: Record<NotificationLevel, string> = {
    info: 'bg-[#7D3394]',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-[#DC2626]',
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

export function NotificationBellSheet() {
    const { notifications: sharedNotifications } = usePage().props;
    const sharedUnreadCount = sharedNotifications?.unread_count ?? 0;

    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(sharedUnreadCount);
    const [readCount, setReadCount] = useState(0);
    const [status, setStatus] = useState<StatusFilter>('all');
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
        targetStatus: StatusFilter = status,
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
        if (!open) {
            return;
        }

        void loadNotifications(1, false, status, category);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, status, category]);

    const handleMarkAsRead = async (item: AppNotificationItem) => {
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

    const handleOpenNotification = async (item: AppNotificationItem) => {
        if (!item.is_read) {
            await handleMarkAsRead(item);
        }

        if (item.action_url) {
            setOpen(false);
            router.visit(item.action_url);
        }
    };

    const handleMarkAllAsRead = async () => {
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

    const handleDelete = async (item: AppNotificationItem) => {
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

    const handleDeleteRead = async () => {
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

    const formattedBadge = unreadCount > 99 ? '99+' : String(unreadCount);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="Notifikasi"
                    data-test="notification-bell-button"
                    className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394]"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span
                            data-test="notification-unread-badge"
                            className="absolute top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[11px] leading-none font-bold text-white shadow-xs"
                        >
                            {formattedBadge}
                        </span>
                    )}
                </button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 bg-white p-0 sm:max-w-md"
            >
                <SheetHeader className="border-b border-gray-100 px-5 py-4 pr-12">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                            <SheetTitle className="text-lg font-bold text-gray-900">
                                Notifikasi
                            </SheetTitle>
                            <SheetDescription className="text-xs text-gray-500">
                                {unreadCount > 0
                                    ? `${unreadCount} notifikasi belum dibaca`
                                    : 'Semua notifikasi sudah dibaca'}
                            </SheetDescription>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={busyAction}
                                data-test="mark-all-notifications-read"
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#F0E6F5] px-2.5 py-1.5 text-xs font-semibold text-[#7D3394] disabled:opacity-50"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                <span>Tandai semua</span>
                            </button>
                        )}
                    </div>
                </SheetHeader>

                {/* Filter Status & Kategori */}
                <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setStatus('all')}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                status === 'all'
                                    ? 'bg-[#7D3394] text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('unread')}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                status === 'unread'
                                    ? 'bg-[#7D3394] text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            <span>Belum dibaca</span>
                            {unreadCount > 0 && (
                                <span
                                    className={`rounded-full px-1.5 py-0.25 text-[10px] font-bold ${
                                        status === 'unread'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-[#DC2626] text-white'
                                    }`}
                                >
                                    {formattedBadge}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                        {CATEGORY_OPTIONS.map((option) => {
                            const isActive = category === option.value;

                            return (
                                <button
                                    key={option.value || 'all'}
                                    type="button"
                                    onClick={() => setCategory(option.value)}
                                    className={`shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium ${
                                        isActive
                                            ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                            : 'border-gray-200 bg-white text-gray-600'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Daftar Notifikasi */}
                <div className="flex-1 overflow-y-auto">
                    {errorMessage && (
                        <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs text-[#DC2626]">
                            {errorMessage}
                        </div>
                    )}

                    {loading ? (
                        <div className="divide-y divide-gray-100">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col gap-2 px-5 py-4"
                                >
                                    <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                                    <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                                    <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                <Bell className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {status === 'unread'
                                    ? 'Tidak ada notifikasi belum dibaca'
                                    : 'Belum ada notifikasi'}
                            </p>
                            <p className="text-xs leading-relaxed text-gray-500">
                                Pembaruan pesanan, produk, kategori, dan sistem
                                akan tampil di sini.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        data-test={`notification-item-${item.id}`}
                                        className={`flex gap-3 px-5 py-4 ${
                                            item.is_read
                                                ? 'bg-white'
                                                : 'bg-[#F9F5FB]/70'
                                        }`}
                                    >
                                        <span
                                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                                item.is_read
                                                    ? 'bg-gray-200'
                                                    : LEVEL_DOT_STYLES[
                                                          item.level
                                                      ]
                                            }`}
                                        />

                                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="inline-flex items-center rounded bg-[#F0E6F5] px-2 py-0.5 text-[11px] font-medium text-[#7D3394]">
                                                    {item.category_label}
                                                </span>
                                                <span className="shrink-0 text-[11px] text-gray-400">
                                                    {item.created_at_human}
                                                </span>
                                            </div>

                                            {item.action_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleOpenNotification(
                                                            item,
                                                        )
                                                    }
                                                    className="flex cursor-pointer flex-col gap-1 text-left"
                                                >
                                                    <span className="text-sm leading-snug font-medium break-words text-gray-900">
                                                        {item.title}
                                                    </span>
                                                    {item.message !== '' && (
                                                        <span className="text-xs leading-relaxed break-words text-gray-600">
                                                            {item.message}
                                                        </span>
                                                    )}
                                                    <span className="pt-0.5 text-xs font-semibold text-[#7D3394]">
                                                        {item.action_label ??
                                                            'Lihat detail'}
                                                    </span>
                                                </button>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm leading-snug font-medium break-words text-gray-900">
                                                        {item.title}
                                                    </span>
                                                    {item.message !== '' && (
                                                        <p className="text-xs leading-relaxed break-words text-gray-600">
                                                            {item.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-end gap-2 pt-1">
                                                {!item.is_read && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleMarkAsRead(
                                                                item,
                                                            )
                                                        }
                                                        aria-label="Tandai notifikasi dibaca"
                                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        <span>Dibaca</span>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleDelete(item)
                                                    }
                                                    aria-label="Hapus notifikasi"
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-[#DC2626]"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span>Hapus</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="border-t border-gray-100 p-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void loadNotifications(
                                                currentPage + 1,
                                                true,
                                            )
                                        }
                                        disabled={loadingMore}
                                        className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 disabled:opacity-50"
                                    >
                                        {loadingMore && (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        )}
                                        <span>
                                            {loadingMore
                                                ? 'Memuat...'
                                                : 'Muat lebih banyak'}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {readCount > 0 && (
                    <SheetFooter className="border-t border-gray-100 px-5 py-3">
                        <button
                            type="button"
                            onClick={handleDeleteRead}
                            disabled={busyAction}
                            data-test="clear-read-notifications"
                            className="h-9 w-full cursor-pointer rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 disabled:opacity-50"
                        >
                            Hapus notifikasi yang sudah dibaca ({readCount})
                        </button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
