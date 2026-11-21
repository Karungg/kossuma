import { AlertTriangle, CheckCircle2, Clock, Package } from 'lucide-react';
import type { ProductStats } from '../types';

type Props = {
    stats: ProductStats;
};

export function ProductStatCards({ stats }: Props) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Total Produk
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                        {stats.total.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394] sm:h-11 sm:w-11">
                    <Package className="h-5 w-5" />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Produk Aktif
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                        {stats.active.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Stok Habis
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                        {stats.out_of_stock.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#DC2626] sm:h-11 sm:w-11">
                    <AlertTriangle className="h-5 w-5" />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Pre-order
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                        {stats.preorder.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-11 sm:w-11">
                    <Clock className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
