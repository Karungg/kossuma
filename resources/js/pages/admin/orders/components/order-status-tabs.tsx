import type { AdminOrderStatusCounts, AdminOrderStatusFilter } from '../types';

type Props = {
    activeStatus: AdminOrderStatusFilter;
    counts: AdminOrderStatusCounts;
    onSelectStatus: (status: AdminOrderStatusFilter) => void;
};

const STATUS_TABS: Array<{ key: AdminOrderStatusFilter; label: string }> = [
    { key: 'all', label: 'Semua' },
    { key: 'pending_payment', label: 'Menunggu Pembayaran' },
    { key: 'processing', label: 'Diproses' },
    { key: 'shipped', label: 'Dikirim' },
    { key: 'completed', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
];

export function OrderStatusTabs({
    activeStatus,
    counts,
    onSelectStatus,
}: Props) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => {
                const isActive = activeStatus === tab.key;
                const count = counts[tab.key] ?? 0;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onSelectStatus(tab.key)}
                        data-test={`order-status-tab-${tab.key}`}
                        className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold sm:text-sm ${
                            isActive
                                ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                : 'border-gray-200 bg-white text-gray-600'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span
                            className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                                isActive
                                    ? 'bg-[#7D3394] text-white'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
