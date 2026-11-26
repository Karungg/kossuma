import {
    Calendar,
    ChevronDown,
    Download,
    FileSpreadsheet,
    FileText,
    RotateCcw,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
    ReportCompareMode,
    ReportExportFormat,
    ReportExportScope,
    ReportFilterOptions,
    ReportFilters,
    ReportPeriodType,
    ReportStatusScope,
    ReportTab,
} from '../types';

type Props = {
    activeTab: ReportTab;
    filters: ReportFilters;
    options: ReportFilterOptions;
    isLoading: boolean;
    isExporting: boolean;
    onApplyFilters: (nextFilters: ReportFilters) => void;
    onResetFilters: () => void;
    onExport: (format: ReportExportFormat, scope: ReportExportScope) => void;
};

const PERIOD_TYPE_OPTIONS: Array<{ value: ReportPeriodType; label: string }> = [
    { value: 'day', label: 'Harian' },
    { value: 'month', label: 'Bulanan' },
    { value: 'quarter', label: 'Kuartal (Q1–Q4)' },
    { value: 'year', label: 'Tahunan' },
    { value: 'range', label: 'Rentang Tanggal' },
];

const EXPORT_SCOPE_OPTIONS: Array<{ value: ReportExportScope; label: string }> =
    [
        { value: 'all', label: 'Laporan Lengkap (Semua Bagian)' },
        { value: 'sales', label: 'Penjualan & Keuangan' },
        { value: 'products', label: 'Produk & Stok' },
        { value: 'stores', label: 'Toko UMKM & Kategori' },
        { value: 'operations', label: 'Pelanggan, Pemenuhan & Ulasan' },
    ];

export function ReportFilterBar({
    activeTab,
    filters,
    options,
    isLoading,
    isExporting,
    onApplyFilters,
    onResetFilters,
    onExport,
}: Props) {
    const [draft, setDraft] = useState<ReportFilters>(filters);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [exportScope, setExportScope] = useState<ReportExportScope>('all');
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDraft(filters);
    }, [filters]);

    useEffect(() => {
        if (activeTab === 'overview') {
            setExportScope('all');
        } else {
            setExportScope(activeTab);
        }
    }, [activeTab]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                exportMenuRef.current &&
                !exportMenuRef.current.contains(event.target as Node)
            ) {
                setIsExportMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsExportMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const updateAndApply = (patch: Partial<ReportFilters>) => {
        const next = { ...draft, ...patch };
        setDraft(next);
        onApplyFilters(next);
    };

    const handleTriggerExport = (format: ReportExportFormat) => {
        setIsExportMenuOpen(false);
        onExport(format, exportScope);
    };

    const hasCustomDimensions =
        draft.store_id !== '' ||
        draft.category_id !== '' ||
        draft.payment_method !== '' ||
        draft.status_scope !== 'valid' ||
        draft.compare_mode !== 'previous';

    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div
                        role="tablist"
                        aria-label="Mode periode laporan"
                        className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-[#F8F9FB] p-1"
                    >
                        {PERIOD_TYPE_OPTIONS.map((option) => {
                            const isActive = draft.period_type === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() =>
                                        updateAndApply({
                                            period_type: option.value,
                                        })
                                    }
                                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-[#7D3394] text-white'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {hasCustomDimensions && (
                            <button
                                type="button"
                                onClick={onResetFilters}
                                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset Filter
                            </button>
                        )}

                        <div className="relative" ref={exportMenuRef}>
                            <button
                                type="button"
                                disabled={isExporting}
                                onClick={() =>
                                    setIsExportMenuOpen((prev) => !prev)
                                }
                                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#7D3394] px-4 text-xs font-bold text-white disabled:opacity-60"
                            >
                                <Download className="h-4 w-4" />
                                <span>
                                    {isExporting
                                        ? 'Memproses Ekspor...'
                                        : 'Ekspor Laporan'}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>

                            {isExportMenuOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <label
                                                htmlFor="report-export-scope"
                                                className="text-xs font-medium text-gray-700"
                                            >
                                                Cakupan Data Ekspor
                                            </label>
                                            <select
                                                id="report-export-scope"
                                                value={exportScope}
                                                onChange={(event) =>
                                                    setExportScope(
                                                        event.target
                                                            .value as ReportExportScope,
                                                    )
                                                }
                                                className="h-9 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                            >
                                                {EXPORT_SCOPE_OPTIONS.map(
                                                    (scopeOption) => (
                                                        <option
                                                            key={
                                                                scopeOption.value
                                                            }
                                                            value={
                                                                scopeOption.value
                                                            }
                                                        >
                                                            {scopeOption.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
                                            <span className="text-xs text-gray-500">
                                                Pilih format file (diproses di
                                                latar belakang):
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleTriggerExport('pdf')
                                                }
                                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 px-3 py-2 text-left text-xs text-gray-800"
                                            >
                                                <FileText className="h-4 w-4 text-[#DC2626]" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        Dokumen PDF (.pdf)
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        Siap cetak untuk rapat
                                                        &amp; arsip
                                                    </span>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleTriggerExport('xlsx')
                                                }
                                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 px-3 py-2 text-left text-xs text-gray-800"
                                            >
                                                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        Excel Workbook (.xlsx)
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        Multi-sheet untuk
                                                        Laporan Lengkap
                                                    </span>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleTriggerExport('csv')
                                                }
                                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 px-3 py-2 text-left text-xs text-gray-800"
                                            >
                                                <FileSpreadsheet className="h-4 w-4 text-[#7D3394]" />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        Data Mentah (.csv)
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        Format tabel UTF-8 siap
                                                        olah
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-6">
                    {draft.period_type === 'day' && (
                        <div className="flex flex-col gap-1 lg:col-span-2">
                            <label
                                htmlFor="report-date"
                                className="text-xs font-medium text-gray-600"
                            >
                                Pilih Tanggal
                            </label>
                            <div className="relative flex items-center">
                                <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
                                <input
                                    id="report-date"
                                    type="date"
                                    value={draft.date}
                                    onChange={(event) =>
                                        updateAndApply({
                                            date: event.target.value,
                                        })
                                    }
                                    className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white pr-3 pl-9 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {draft.period_type === 'month' && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="report-month"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    Bulan
                                </label>
                                <select
                                    id="report-month"
                                    value={draft.month}
                                    onChange={(event) =>
                                        updateAndApply({
                                            month: Number(event.target.value),
                                        })
                                    }
                                    className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                >
                                    {options.months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="report-month-year"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    Tahun
                                </label>
                                <select
                                    id="report-month-year"
                                    value={draft.year}
                                    onChange={(event) =>
                                        updateAndApply({
                                            year: Number(event.target.value),
                                        })
                                    }
                                    className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                >
                                    {options.years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {draft.period_type === 'quarter' && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="report-quarter"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    Kuartal Fiskal
                                </label>
                                <select
                                    id="report-quarter"
                                    value={draft.quarter}
                                    onChange={(event) =>
                                        updateAndApply({
                                            quarter: Number(event.target.value),
                                        })
                                    }
                                    className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                >
                                    {options.quarters.map((q) => (
                                        <option key={q.value} value={q.value}>
                                            {q.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="report-quarter-year"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    Tahun Fiskal
                                </label>
                                <select
                                    id="report-quarter-year"
                                    value={draft.year}
                                    onChange={(event) =>
                                        updateAndApply({
                                            year: Number(event.target.value),
                                        })
                                    }
                                    className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                >
                                    {options.years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {draft.period_type === 'year' && (
                        <div className="flex flex-col gap-1 lg:col-span-2">
                            <label
                                htmlFor="report-year"
                                className="text-xs font-medium text-gray-600"
                            >
                                Tahun Fiskal (Januari – Desember)
                            </label>
                            <select
                                id="report-year"
                                value={draft.year}
                                onChange={(event) =>
                                    updateAndApply({
                                        year: Number(event.target.value),
                                    })
                                }
                                className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                            >
                                {options.years.map((y) => (
                                    <option key={y} value={y}>
                                        Tahun {y} (Q1 – Q4)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {draft.period_type === 'range' && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="report-date-from"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    Dari Tanggal
                                </label>
                                <input
                                    id="report-date-from"
                                    type="date"
                                    value={draft.date_from}
                                    onChange={(event) =>
                                        updateAndApply({
                                            date_from: event.target.value,
                                        })
                                    }
                                    className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="report-date-to"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    Sampai Tanggal
                                </label>
                                <input
                                    id="report-date-to"
                                    type="date"
                                    value={draft.date_to}
                                    onChange={(event) =>
                                        updateAndApply({
                                            date_to: event.target.value,
                                        })
                                    }
                                    className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="report-compare-mode"
                            className="text-xs font-medium text-gray-600"
                        >
                            Pembanding
                        </label>
                        <select
                            id="report-compare-mode"
                            value={draft.compare_mode}
                            disabled={draft.period_type === 'year'}
                            onChange={(event) =>
                                updateAndApply({
                                    compare_mode: event.target
                                        .value as ReportCompareMode,
                                })
                            }
                            className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="previous">Periode Sebelumnya</option>
                            <option value="yoy">Tahun Lalu (YoY)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="report-store-id"
                            className="text-xs font-medium text-gray-600"
                        >
                            Toko UMKM
                        </label>
                        <select
                            id="report-store-id"
                            value={draft.store_id}
                            onChange={(event) =>
                                updateAndApply({
                                    store_id: event.target.value,
                                })
                            }
                            className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                        >
                            <option value="">Semua Toko UMKM</option>
                            {options.stores.map((store) => (
                                <option key={store.id} value={String(store.id)}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="report-category-id"
                            className="text-xs font-medium text-gray-600"
                        >
                            Kategori Produk
                        </label>
                        <select
                            id="report-category-id"
                            value={draft.category_id}
                            onChange={(event) =>
                                updateAndApply({
                                    category_id: event.target.value,
                                })
                            }
                            className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                        >
                            <option value="">Semua Kategori</option>
                            {options.categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="report-status-scope"
                            className="text-xs font-medium text-gray-600"
                        >
                            Cakupan Pesanan
                        </label>
                        <select
                            id="report-status-scope"
                            value={draft.status_scope}
                            onChange={(event) =>
                                updateAndApply({
                                    status_scope: event.target
                                        .value as ReportStatusScope,
                                })
                            }
                            className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-[#7D3394] focus:outline-none"
                        >
                            {options.statusScopes.map((scopeItem) => (
                                <option
                                    key={scopeItem.value}
                                    value={scopeItem.value}
                                >
                                    {scopeItem.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">
                            Metode Pembayaran:
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                updateAndApply({ payment_method: '' })
                            }
                            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${
                                draft.payment_method === ''
                                    ? 'bg-[#F0E6F5] text-[#7D3394]'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            Semua
                        </button>
                        {options.paymentMethods.map((method) => (
                            <button
                                key={method.value}
                                type="button"
                                onClick={() =>
                                    updateAndApply({
                                        payment_method: method.value,
                                    })
                                }
                                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${
                                    draft.payment_method === method.value
                                        ? 'bg-[#F0E6F5] text-[#7D3394]'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>

                    {isLoading && (
                        <span className="text-xs text-[#7D3394]">
                            Memperbarui data laporan...
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}
