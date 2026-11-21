import { Bell, Check, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useNotifications } from '@/hooks/use-notifications';
import type {
    NotificationCategory,
    NotificationLevel,
} from '@/types/notification';

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

export function NotificationBellSheet() {
    const [open, setOpen] = useState(false);

    const {
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
    } = useNotifications(open);

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
                                onClick={() => void markAllAsRead()}
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
                                                        void openNotification(
                                                            item,
                                                            () =>
                                                                setOpen(false),
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
                                                            void markAsRead(
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
                                                        void deleteItem(item)
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
                                        onClick={() => void loadMore()}
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
                            onClick={() => void deleteRead()}
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
