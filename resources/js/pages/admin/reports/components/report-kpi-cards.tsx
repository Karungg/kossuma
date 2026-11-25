import {
    CheckCircle2,
    ReceiptText,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import type { ReportKpis } from '../types';

type Props = {
    kpis: ReportKpis;
    comparisonLabel: string;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

function GrowthBadge({
    percent,
    suffix = '%',
}: {
    percent: number | null;
    suffix?: string;
}) {
    if (percent === null) {
        return <span className="text-xs text-gray-400">Data baru</span>;
    }

    if (percent === 0) {
        return <span className="text-xs text-gray-500">0{suffix}</span>;
    }

    const isPositive = percent > 0;

    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-[#DC2626]'
            }`}
        >
            {isPositive ? (
                <TrendingUp className="h-3 w-3" />
            ) : (
                <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? '+' : ''}
            {percent.toLocaleString('id-ID')}
            {suffix}
        </span>
    );
}

export function ReportKpiCards({ kpis, comparisonLabel }: Props) {
    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">
                        Total Omzet
                    </span>
                    <Wallet className="h-4 w-4 text-[#7D3394]" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-[#DC2626]">
                        {formatRupiah(kpis.gross_sales.current)}
                    </span>
                    <span className="text-xs text-gray-500">
                        Bersih: {formatRupiah(kpis.net_revenue.current)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                    <GrowthBadge percent={kpis.gross_sales.growth_percent} />
                    <span className="truncate text-[11px] text-gray-400">
                        {comparisonLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">
                        Pesanan Terhitung
                    </span>
                    <ReceiptText className="h-4 w-4 text-[#7D3394]" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-gray-900">
                        {kpis.orders.current.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-gray-500">
                        Selesai {kpis.orders.completed_count} • Batal{' '}
                        {kpis.orders.cancelled_count}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                    <GrowthBadge percent={kpis.orders.growth_percent} />
                    <span className="truncate text-[11px] text-gray-400">
                        {comparisonLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">
                        Rata-rata Pesanan
                    </span>
                    <ShoppingBag className="h-4 w-4 text-[#7D3394]" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-[#DC2626]">
                        {formatRupiah(kpis.average_order_value.current)}
                    </span>
                    <span className="text-xs text-gray-500">
                        Per transaksi valid
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                    <GrowthBadge
                        percent={kpis.average_order_value.growth_percent}
                    />
                    <span className="truncate text-[11px] text-gray-400">
                        {comparisonLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">
                        Tingkat Penyelesaian
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-gray-900">
                        {kpis.completion_rate.current.toLocaleString('id-ID')}%
                    </span>
                    <span className="text-xs text-gray-500">
                        Pembatalan:{' '}
                        {kpis.orders.cancellation_rate.toLocaleString('id-ID')}%
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                    <GrowthBadge
                        percent={kpis.completion_rate.delta_points}
                        suffix=" poin"
                    />
                    <span className="truncate text-[11px] text-gray-400">
                        {comparisonLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">
                        Pembeli Aktif
                    </span>
                    <Users className="h-4 w-4 text-[#7D3394]" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-gray-900">
                        {kpis.active_buyers.current.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-gray-500">
                        Pelanggan bertransaksi
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                    <GrowthBadge percent={kpis.active_buyers.growth_percent} />
                    <span className="truncate text-[11px] text-gray-400">
                        {comparisonLabel}
                    </span>
                </div>
            </div>
        </section>
    );
}
