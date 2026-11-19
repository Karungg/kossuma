import { Tag } from 'lucide-react';
import type { CategoryStats } from '../types';

type Props = {
    stats: CategoryStats;
};

export function CategoryStatCards({ stats }: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">
                        Total Kategori
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                        {stats.total.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]">
                    <Tag className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
