import { AlertTriangle, EyeOff, MessageSquareText, Star } from 'lucide-react';
import type { AdminReviewStats } from '../types';

type Props = {
    stats: AdminReviewStats;
    onFilterLowRating: () => void;
    onFilterHidden: () => void;
};

export function ReviewStatCards({
    stats,
    onFilterLowRating,
    onFilterHidden,
}: Props) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Total Ulasan
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                        {stats.total.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        {stats.unreplied.toLocaleString('id-ID')} belum dibalas
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394] sm:h-11 sm:w-11">
                    <MessageSquareText className="h-5 w-5" />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Rata-rata Rating
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                        {stats.average_rating.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        Dari {stats.visible.toLocaleString('id-ID')} ulasan
                        tampil
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 sm:h-11 sm:w-11">
                    <Star className="h-5 w-5 fill-amber-400" />
                </div>
            </div>

            <button
                type="button"
                onClick={onFilterLowRating}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-xs sm:p-5"
            >
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Perlu Perhatian
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                        {stats.low_rating.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-[#DC2626]">
                        Rating 1–2 bintang
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#DC2626] sm:h-11 sm:w-11">
                    <AlertTriangle className="h-5 w-5" />
                </div>
            </button>

            <button
                type="button"
                onClick={onFilterHidden}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-xs sm:p-5"
            >
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Disembunyikan
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                        {stats.hidden.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        Dimoderasi oleh Admin
                    </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 sm:h-11 sm:w-11">
                    <EyeOff className="h-5 w-5" />
                </div>
            </button>
        </div>
    );
}
