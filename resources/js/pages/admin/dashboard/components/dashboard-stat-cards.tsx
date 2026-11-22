import { Link } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    ReceiptText,
    ShoppingBag,
    Star,
} from 'lucide-react';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import type { DashboardKpis } from '../types';

type Props = {
    kpis: DashboardKpis;
    comparisonLabel: string;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

function GrowthBadge({
    growth,
    comparisonLabel,
}: {
    growth: number | null;
    comparisonLabel: string;
}) {
    if (growth === null) {
        return (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <ArrowUpRight className="h-3 w-3" />
                Baru
            </span>
        );
    }

    if (growth > 0) {
        return (
            <span
                title={comparisonLabel}
                className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 tabular-nums"
            >
                <ArrowUpRight className="h-3 w-3" />+
                {growth.toLocaleString('id-ID')}%
            </span>
        );
    }

    if (growth < 0) {
        return (
            <span
                title={comparisonLabel}
                className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-[#DC2626] tabular-nums"
            >
                <ArrowDownRight className="h-3 w-3" />
                {growth.toLocaleString('id-ID')}%
            </span>
        );
    }

    return (
        <span
            title={comparisonLabel}
            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 tabular-nums"
        >
            0%
        </span>
    );
}

export function DashboardStatCards({ kpis, comparisonLabel }: Props) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <Link
                href={ordersIndex.url({ query: { status: 'completed' } })}
                className="flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs text-gray-500 sm:text-sm">
                            Omzet Penjualan
                        </span>
                        <span className="truncate text-xl font-extrabold tracking-tight text-[#DC2626] tabular-nums sm:text-2xl">
                            {formatRupiah(kpis.revenue.current)}
                        </span>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                        <Banknote className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <GrowthBadge
                        growth={kpis.revenue.growth_percent}
                        comparisonLabel={comparisonLabel}
                    />
                    <span className="text-[11px] text-gray-500 tabular-nums">
                        Hari ini: {formatRupiah(kpis.revenue.today)}
                    </span>
                </div>
            </Link>

            <Link
                href={ordersIndex.url()}
                className="flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs text-gray-500 sm:text-sm">
                            Pesanan Valid
                        </span>
                        <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                            {kpis.orders.current.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394] sm:h-11 sm:w-11">
                        <ReceiptText className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <GrowthBadge
                        growth={kpis.orders.growth_percent}
                        comparisonLabel={comparisonLabel}
                    />
                    <span className="text-[11px] text-gray-500 tabular-nums">
                        {kpis.orders.completed.toLocaleString('id-ID')} selesai
                        • Batal {kpis.orders.cancellation_rate}%
                    </span>
                </div>
            </Link>

            <Link
                href={ordersIndex.url({
                    query: { sort: 'total_amount', direction: 'desc' },
                })}
                className="flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs text-gray-500 sm:text-sm">
                            Rata-rata Nilai Pesanan
                        </span>
                        <span className="truncate text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                            {formatRupiah(kpis.average_order_value.current)}
                        </span>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <GrowthBadge
                        growth={kpis.average_order_value.growth_percent}
                        comparisonLabel={comparisonLabel}
                    />
                    <span className="text-[11px] text-gray-500 tabular-nums">
                        Selesai: {formatRupiah(kpis.revenue.completed)}
                    </span>
                </div>
            </Link>

            <Link
                href={reviewsIndex.url()}
                className="flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs text-gray-500 sm:text-sm">
                            Pembeli Aktif & Rating
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                                {kpis.customers_and_rating.active_buyers.toLocaleString(
                                    'id-ID',
                                )}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 tabular-nums">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                {kpis.customers_and_rating.average_rating.toFixed(
                                    2,
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 sm:h-11 sm:w-11">
                        <Star className="h-5 w-5 fill-amber-400" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <GrowthBadge
                        growth={kpis.customers_and_rating.growth_percent}
                        comparisonLabel={comparisonLabel}
                    />
                    <span className="text-[11px] text-gray-500 tabular-nums">
                        {kpis.customers_and_rating.total_customers.toLocaleString(
                            'id-ID',
                        )}{' '}
                        pelanggan •{' '}
                        {kpis.customers_and_rating.visible_reviews.toLocaleString(
                            'id-ID',
                        )}{' '}
                        ulasan
                    </span>
                </div>
            </Link>
        </div>
    );
}
