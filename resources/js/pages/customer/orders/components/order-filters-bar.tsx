import { Calendar, RotateCcw, Search, X } from 'lucide-react';
import type {
    OrderDatePreset,
    OrderFiltersState,
    OrderStatusCounts,
    OrderStatusFilter,
} from '../types';

interface OrderFiltersBarProps {
    filters: OrderFiltersState;
    searchInput: string;
    statusCounts: OrderStatusCounts;
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (status: OrderStatusFilter) => void;
    onPresetChange: (preset: OrderDatePreset) => void;
    onDateChange: (field: 'date_from' | 'date_to', value: string) => void;
    onReset: () => void;
}

const STATUS_TABS: Array<{ value: OrderStatusFilter; label: string }> = [
    { value: 'all', label: 'Semua' },
    { value: 'pending_payment', label: 'Menunggu Pembayaran' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

const DATE_PRESETS: Array<{ value: OrderDatePreset; label: string }> = [
    { value: 'all', label: 'Semua Tanggal' },
    { value: '30d', label: '30 Hari Terakhir' },
    { value: '90d', label: '90 Hari Terakhir' },
    { value: 'custom', label: 'Pilih Rentang Tanggal' },
];

export function OrderFiltersBar({
    filters,
    searchInput,
    statusCounts,
    hasActiveFilters,
    onSearchChange,
    onStatusChange,
    onPresetChange,
    onDateChange,
    onReset,
}: OrderFiltersBarProps) {
    return (
        <section className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Cari nomor pesanan, nama produk, atau toko UMKM..."
                        data-test="orders-search-input"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pr-9 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:bg-white focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                    />
                    {searchInput !== '' && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            aria-label="Hapus pencarian"
                            className="absolute top-1/2 right-3 inline-flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-500"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative flex items-center">
                        <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
                        <select
                            value={filters.preset}
                            onChange={(event) =>
                                onPresetChange(
                                    event.target.value as OrderDatePreset,
                                )
                            }
                            aria-label="Filter rentang tanggal"
                            data-test="orders-date-preset"
                            className="h-11 cursor-pointer rounded-xl border border-gray-200 bg-white pr-8 pl-9 text-sm text-gray-700 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        >
                            {DATE_PRESETS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onReset}
                            data-test="orders-reset-filters"
                            className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 text-xs font-semibold text-gray-700 sm:text-sm"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset Filter</span>
                        </button>
                    )}
                </div>
            </div>

            {filters.preset === 'custom' && (
                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="orders-date-from"
                            className="text-xs font-medium text-gray-600"
                        >
                            Dari
                        </label>
                        <input
                            id="orders-date-from"
                            type="date"
                            value={filters.date_from}
                            max={filters.date_to || undefined}
                            onChange={(event) =>
                                onDateChange('date_from', event.target.value)
                            }
                            data-test="orders-date-from"
                            className="h-10 cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none sm:text-sm"
                        />
                    </div>
                    <span className="text-xs text-gray-400">s.d.</span>
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="orders-date-to"
                            className="text-xs font-medium text-gray-600"
                        >
                            Sampai
                        </label>
                        <input
                            id="orders-date-to"
                            type="date"
                            value={filters.date_to}
                            min={filters.date_from || undefined}
                            onChange={(event) =>
                                onDateChange('date_to', event.target.value)
                            }
                            data-test="orders-date-to"
                            className="h-10 cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none sm:text-sm"
                        />
                    </div>
                </div>
            )}

            <div className="-mx-1 flex items-center gap-2 overflow-x-auto border-t border-gray-100 px-1 pt-3.5">
                {STATUS_TABS.map((tab) => {
                    const isActive = filters.status === tab.value;
                    const count = statusCounts[tab.value] ?? 0;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onStatusChange(tab.value)}
                            data-test={`orders-status-tab-${tab.value}`}
                            className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs transition-colors sm:text-sm ${
                                isActive
                                    ? 'border border-[#E2C9EB] bg-[#F0E6F5] font-bold text-[#7D3394]'
                                    : 'border border-gray-200 bg-white font-medium text-gray-600'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                                    isActive
                                        ? 'bg-white text-[#7D3394]'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
