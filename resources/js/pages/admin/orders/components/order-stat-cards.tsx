import { AlertCircle, Banknote, ReceiptText, Truck } from 'lucide-react';
import type { AdminOrderStats } from '../types';

type Props = {
    stats: AdminOrderStats;
    onSelectNeedsAttention: () => void;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function OrderStatCards({ stats, onSelectNeedsAttention }: Props) {
    const activeOperationalCount = stats.pending_payment + stats.processing;

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Total Transaksi
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                        {stats.total.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        {stats.completed.toLocaleString('id-ID')} selesai
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394] sm:h-11 sm:w-11">
                    <ReceiptText className="h-5 w-5" />
                </div>
            </div>

            <button
                type="button"
                onClick={onSelectNeedsAttention}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-xs sm:p-5"
            >
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Perlu Diproses
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                        {activeOperationalCount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-amber-600">
                        {stats.needs_attention > 0
                            ? `${stats.needs_attention} butuh tindak lanjut`
                            : `${stats.processing} siap dikirim`}
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-11 sm:w-11">
                    <AlertCircle className="h-5 w-5" />
                </div>
            </button>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Sedang Dikirim
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                        {stats.shipped.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        Dalam perjalanan kurir
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
                    <Truck className="h-5 w-5" />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Omzet Selesai
                    </span>
                    <span className="truncate text-lg font-extrabold tracking-tight text-[#DC2626] tabular-nums sm:text-xl">
                        {formatRupiah(stats.completed_revenue)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        Dari pesanan selesai
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                    <Banknote className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
