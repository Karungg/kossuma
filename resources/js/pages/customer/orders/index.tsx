import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HomeLayout } from '@/layouts/home-layout';
import { home } from '@/routes';
import {
    buyAgain as buyAgainOrder,
    confirmReceived as confirmReceivedOrder,
    index as ordersIndex,
} from '@/routes/customer/orders';
import { OrderCancelDialog } from './components/order-cancel-dialog';
import { OrderCard } from './components/order-card';
import { OrderDetailDialog } from './components/order-detail-dialog';
import { OrderFiltersBar } from './components/order-filters-bar';
import { OrderReviewDialog } from './components/order-review-dialog';
import { OrderTrackingDialog } from './components/order-tracking-dialog';
import type {
    CustomerOrder,
    OrderDatePreset,
    OrderFiltersState,
    OrderStatusCounts,
    OrderStatusFilter,
    PaginatedOrders,
} from './types';

interface CustomerOrdersPageProps {
    orders: PaginatedOrders;
    statusCounts: OrderStatusCounts;
    filters: OrderFiltersState;
}

export default function CustomerOrdersPage({
    orders,
    statusCounts,
    filters,
}: CustomerOrdersPageProps) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [detailOrder, setDetailOrder] = useState<CustomerOrder | null>(null);
    const [trackingOrder, setTrackingOrder] = useState<CustomerOrder | null>(
        null,
    );
    const [reviewOrder, setReviewOrder] = useState<CustomerOrder | null>(null);
    const [cancelOrder, setCancelOrder] = useState<CustomerOrder | null>(null);
    const [buyingAgainId, setBuyingAgainId] = useState<number | null>(null);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setSearchInput(filters.search);
    }, [filters.search]);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    const navigateWithFilters = (
        next: Partial<OrderFiltersState>,
        page = 1,
    ) => {
        const merged: OrderFiltersState = {
            ...filters,
            ...next,
        };

        const query: Record<string, string | number> = {};

        if (merged.status !== 'all') {
            query.status = merged.status;
        }

        if (merged.search.trim() !== '') {
            query.search = merged.search.trim();
        }

        if (merged.preset !== 'all') {
            query.preset = merged.preset;
        }

        if (merged.preset === 'custom') {
            if (merged.date_from !== '') {
                query.date_from = merged.date_from;
            }
            if (merged.date_to !== '') {
                query.date_to = merged.date_to;
            }
        }

        if (page > 1) {
            query.page = page;
        }

        router.get(
            ordersIndex.url({ query }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSearchChange = (value: string) => {
        setSearchInput(value);

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = setTimeout(() => {
            navigateWithFilters({ search: value });
        }, 350);
    };

    const handleStatusChange = (status: OrderStatusFilter) => {
        navigateWithFilters({ status });
    };

    const handlePresetChange = (preset: OrderDatePreset) => {
        if (preset !== 'custom') {
            navigateWithFilters({ preset, date_from: '', date_to: '' });

            return;
        }

        navigateWithFilters({ preset });
    };

    const handleDateChange = (
        field: 'date_from' | 'date_to',
        value: string,
    ) => {
        navigateWithFilters({
            preset: 'custom',
            [field]: value,
        });
    };

    const handleResetFilters = () => {
        setSearchInput('');
        router.get(
            ordersIndex.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleBuyAgain = (order: CustomerOrder) => {
        if (buyingAgainId !== null) {
            return;
        }

        setBuyingAgainId(order.id);
        router.post(
            buyAgainOrder.url(order.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setBuyingAgainId(null),
            },
        );
    };

    const handleConfirmReceived = (order: CustomerOrder) => {
        if (confirmingId !== null) {
            return;
        }

        setConfirmingId(order.id);
        router.post(
            confirmReceivedOrder.url(order.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setConfirmingId(null),
            },
        );
    };

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.search.trim() !== '' ||
        filters.preset !== 'all' ||
        filters.date_from !== '' ||
        filters.date_to !== '';

    return (
        <HomeLayout>
            <Head title="Daftar Pembelian - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Pantau riwayat pembelian, lacak pengiriman, tulis ulasan, dan belanja kembali produk UMKM Kossuma Kota Bogor."
                />
            </Head>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <Link
                            href={home()}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-[#7D3394]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                        <div className="h-4 w-px bg-gray-200" />
                        <h1 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
                            Daftar Pembelian
                        </h1>
                    </div>

                    <span className="text-xs font-medium text-gray-500 tabular-nums sm:text-sm">
                        {statusCounts.all} total transaksi
                    </span>
                </div>

                <OrderFiltersBar
                    filters={filters}
                    searchInput={searchInput}
                    statusCounts={statusCounts}
                    hasActiveFilters={hasActiveFilters}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    onPresetChange={handlePresetChange}
                    onDateChange={handleDateChange}
                    onReset={handleResetFilters}
                />

                {orders.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E6F5] text-[#7D3394]">
                            <ShoppingBag className="h-7 w-7" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {hasActiveFilters
                                ? 'Tidak Ada Pesanan yang Cocok'
                                : 'Belum Ada Riwayat Pembelian'}
                        </h2>
                        <p className="max-w-md text-sm text-gray-500">
                            {hasActiveFilters
                                ? 'Coba ubah kata kunci pencarian, status pesanan, atau rentang tanggal yang dipilih.'
                                : 'Yuk mulai belanja kuliner halal dan aneka produk segar dari UMKM binaan Kossuma Kota Bogor.'}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#7D3394] px-5 py-2.5 text-sm font-bold text-white"
                            >
                                <span>Tampilkan Semua Pesanan</span>
                            </button>
                        ) : (
                            <Link
                                href={home()}
                                className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#7D3394] px-5 py-2.5 text-sm font-bold text-white"
                            >
                                <span>Mulai Belanja</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.data.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                isBuyingAgain={buyingAgainId === order.id}
                                isConfirming={confirmingId === order.id}
                                onOpenDetail={setDetailOrder}
                                onOpenTracking={setTrackingOrder}
                                onOpenReview={setReviewOrder}
                                onOpenCancel={setCancelOrder}
                                onBuyAgain={handleBuyAgain}
                                onConfirmReceived={handleConfirmReceived}
                            />
                        ))}

                        {orders.lastPage > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 text-xs text-gray-600 shadow-xs sm:text-sm">
                                <span className="tabular-nums">
                                    Menampilkan {orders.from ?? 0}–
                                    {orders.to ?? 0} dari {orders.total} pesanan
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={orders.currentPage <= 1}
                                        onClick={() =>
                                            navigateWithFilters(
                                                {},
                                                orders.currentPage - 1,
                                            )
                                        }
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>Sebelumnya</span>
                                    </button>
                                    <span className="px-2 text-xs font-semibold text-gray-900 tabular-nums">
                                        {orders.currentPage} / {orders.lastPage}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={
                                            orders.currentPage >=
                                            orders.lastPage
                                        }
                                        onClick={() =>
                                            navigateWithFilters(
                                                {},
                                                orders.currentPage + 1,
                                            )
                                        }
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <span>Berikutnya</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <OrderDetailDialog
                order={detailOrder}
                onClose={() => setDetailOrder(null)}
            />
            <OrderTrackingDialog
                order={trackingOrder}
                onClose={() => setTrackingOrder(null)}
            />
            <OrderReviewDialog
                order={reviewOrder}
                onClose={() => setReviewOrder(null)}
            />
            <OrderCancelDialog
                order={cancelOrder}
                onClose={() => setCancelOrder(null)}
            />
        </HomeLayout>
    );
}
