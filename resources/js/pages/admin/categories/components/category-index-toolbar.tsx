import { Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Columns3,
    Download,
    Loader2,
    Plus,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { create, index } from '@/routes/admin/categories';
import {
    CATEGORY_COLUMN_LABELS,
    CATEGORY_COLUMN_ORDER,
    DEFAULT_CATEGORY_COLUMN_VISIBILITY,
} from '../types';
import type {
    CategoryColumnKey,
    CategoryColumnVisibility,
    CategoryFilters,
    DescriptionStatusFilter,
    ExportFormat,
    ProductStatusFilter,
} from '../types';

type Props = {
    filters: CategoryFilters;
    visibleColumns: CategoryColumnVisibility;
    onToggleColumn: (column: CategoryColumnKey) => void;
    onResetColumns: () => void;
    onExportAll: (format: ExportFormat) => void;
    onApplyQuery: (overrides: Partial<CategoryFilters>) => void;
    onResetFilters: () => void;
};

const PRODUCT_STATUS_OPTIONS: Array<{
    value: '' | ProductStatusFilter;
    label: string;
}> = [
    { value: '', label: 'Semua' },
    { value: 'with_products', label: 'Memiliki Produk' },
    { value: 'without_products', label: 'Belum Ada Produk' },
];

const DESCRIPTION_STATUS_OPTIONS: Array<{
    value: '' | DescriptionStatusFilter;
    label: string;
}> = [
    { value: '', label: 'Semua' },
    { value: 'filled', label: 'Ada Deskripsi' },
    { value: 'empty', label: 'Tanpa Deskripsi' },
];

const PRODUCT_STATUS_LABELS: Record<ProductStatusFilter, string> = {
    with_products: 'Memiliki Produk',
    without_products: 'Belum Ada Produk',
};

const DESCRIPTION_STATUS_LABELS: Record<DescriptionStatusFilter, string> = {
    filled: 'Ada Deskripsi',
    empty: 'Tanpa Deskripsi',
};

export function CategoryIndexToolbar({
    filters,
    visibleColumns,
    onToggleColumn,
    onResetColumns,
    onExportAll,
    onApplyQuery,
    onResetFilters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const currentFilterSearch = filters.search ?? '';

        if (search.trim() === currentFilterSearch.trim()) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                index.url({
                    query: {
                        search: search.trim() || undefined,
                        product_status: filters.product_status ?? undefined,
                        description_status:
                            filters.description_status ?? undefined,
                        sort: filters.sort ?? undefined,
                        direction: filters.direction ?? undefined,
                    },
                }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['categories', 'filters'],
                    onStart: () => setIsSearching(true),
                    onFinish: () => setIsSearching(false),
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [
        search,
        filters.search,
        filters.product_status,
        filters.description_status,
        filters.sort,
        filters.direction,
    ]);

    const handleClearSearch = () => {
        setSearch('');
        onApplyQuery({ search: null });
    };

    const activeFilterCount = [
        filters.product_status,
        filters.description_status,
    ].filter(Boolean).length;

    const visibleColumnCount = CATEGORY_COLUMN_ORDER.filter(
        (key) => visibleColumns[key],
    ).length;

    const isCustomColumns = CATEGORY_COLUMN_ORDER.some(
        (key) =>
            visibleColumns[key] !== DEFAULT_CATEGORY_COLUMN_VISIBILITY[key],
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape' && search !== '') {
                                handleClearSearch();
                            }
                        }}
                        placeholder="Cari nama, slug, atau deskripsi kategori..."
                        aria-label="Cari kategori"
                        data-test="category-search-input"
                        className="h-11 rounded-xl border-gray-200 bg-white pr-16 pl-10 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                    />
                    <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5">
                        {isSearching && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#7D3394]" />
                        )}
                        {search !== '' && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                aria-label="Hapus pencarian"
                                className="cursor-pointer text-gray-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Dropdown Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                data-test="open-category-filter-button"
                                className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
                                    activeFilterCount > 0
                                        ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                        : 'border-gray-200 bg-white text-gray-700'
                                }`}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7D3394] px-1.5 text-[11px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-72 rounded-xl border-gray-100 bg-white p-3.5 shadow-md"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-gray-700">
                                        Status Produk
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRODUCT_STATUS_OPTIONS.map(
                                            (option) => {
                                                const isActive =
                                                    (filters.product_status ??
                                                        '') === option.value;

                                                return (
                                                    <button
                                                        key={
                                                            option.value ||
                                                            'all'
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            onApplyQuery({
                                                                product_status:
                                                                    option.value ||
                                                                    null,
                                                            })
                                                        }
                                                        className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                                                            isActive
                                                                ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                                                : 'border-gray-200 bg-white text-gray-700'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                                    <span className="text-xs font-semibold text-gray-700">
                                        Kelengkapan Deskripsi
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {DESCRIPTION_STATUS_OPTIONS.map(
                                            (option) => {
                                                const isActive =
                                                    (filters.description_status ??
                                                        '') === option.value;

                                                return (
                                                    <button
                                                        key={
                                                            option.value ||
                                                            'all'
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            onApplyQuery({
                                                                description_status:
                                                                    option.value ||
                                                                    null,
                                                            })
                                                        }
                                                        className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                                                            isActive
                                                                ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                                                : 'border-gray-200 bg-white text-gray-700'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                {activeFilterCount > 0 && (
                                    <div className="border-t border-gray-100 pt-2.5">
                                        <button
                                            type="button"
                                            onClick={onResetFilters}
                                            className="w-full cursor-pointer rounded-lg bg-gray-100 py-1.5 text-center text-xs font-semibold text-gray-700"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Dropdown Visibilitas Kolom */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                data-test="column-visibility-trigger"
                                className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
                                    isCustomColumns
                                        ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                        : 'border-gray-200 bg-white text-gray-700'
                                }`}
                            >
                                <Columns3 className="h-4 w-4" />
                                <span>Kolom</span>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl border-gray-100 bg-white p-1.5 shadow-md"
                        >
                            <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold text-gray-500">
                                Tampilkan Kolom & Ekspor
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1 bg-gray-100" />
                            {CATEGORY_COLUMN_ORDER.map((columnKey) => {
                                const isChecked = visibleColumns[columnKey];
                                const isLastVisible =
                                    isChecked && visibleColumnCount <= 1;

                                return (
                                    <DropdownMenuCheckboxItem
                                        key={columnKey}
                                        checked={isChecked}
                                        disabled={isLastVisible}
                                        onSelect={(e) => e.preventDefault()}
                                        onCheckedChange={() =>
                                            onToggleColumn(columnKey)
                                        }
                                        data-test={`toggle-column-${columnKey}`}
                                        className="cursor-pointer rounded-lg py-2 text-xs font-medium text-gray-700"
                                    >
                                        {CATEGORY_COLUMN_LABELS[columnKey]}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                            {isCustomColumns && (
                                <>
                                    <DropdownMenuSeparator className="my-1 bg-gray-100" />
                                    <DropdownMenuItem
                                        onClick={onResetColumns}
                                        className="cursor-pointer justify-center rounded-lg py-1.5 text-xs font-semibold text-[#7D3394]"
                                    >
                                        Reset ke Default
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Dropdown Ekspor */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                data-test="export-all-trigger"
                                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700"
                            >
                                <Download className="h-4 w-4" />
                                <span>Ekspor</span>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl border-gray-100 bg-white p-1.5 shadow-md"
                        >
                            <DropdownMenuItem
                                onClick={() => onExportAll('xlsx')}
                                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-gray-700"
                            >
                                Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onExportAll('pdf')}
                                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-gray-700"
                            >
                                Dokumen PDF (.pdf)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onExportAll('csv')}
                                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-gray-700"
                            >
                                File CSV (.csv)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link
                        href={create()}
                        className="inline-flex h-11 flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-5 text-sm font-bold text-white sm:flex-none"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Kategori</span>
                    </Link>
                </div>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {filters.product_status && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2C9EB] bg-[#F0E6F5] px-2.5 py-1 text-xs font-medium text-[#7D3394]">
                            <span>
                                Produk:{' '}
                                {PRODUCT_STATUS_LABELS[filters.product_status]}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onApplyQuery({ product_status: null })
                                }
                                aria-label="Hapus filter status produk"
                                className="cursor-pointer"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    )}

                    {filters.description_status && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2C9EB] bg-[#F0E6F5] px-2.5 py-1 text-xs font-medium text-[#7D3394]">
                            <span>
                                Deskripsi:{' '}
                                {
                                    DESCRIPTION_STATUS_LABELS[
                                        filters.description_status
                                    ]
                                }
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onApplyQuery({
                                        description_status: null,
                                    })
                                }
                                aria-label="Hapus filter deskripsi"
                                className="cursor-pointer"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="cursor-pointer px-1.5 py-1 text-xs font-medium text-gray-500"
                    >
                        Reset Filter
                    </button>
                </div>
            )}
        </div>
    );
}
