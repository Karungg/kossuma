import { router } from '@inertiajs/react';
import {
    DataTableActiveFilterChips,
    DataTableColumnToggle,
    DataTableExportDropdown,
    DataTableFilterDropdown,
    DataTableSearch,
} from '@/components/data-table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/admin/reviews';
import type {
    DataTableActiveChip,
    DataTableFilterGroup,
} from '@/types/data-table';
import { REVIEW_COLUMNS } from '../types';
import type {
    AdminReviewFilterOptions,
    AdminReviewFilters,
    ExportFormat,
    ReviewColumnKey,
    ReviewColumnVisibility,
    ReviewRatingFilter,
    ReviewReplyStatusFilter,
    ReviewVisibilityFilter,
} from '../types';

type Props = {
    filters: AdminReviewFilters;
    options: AdminReviewFilterOptions;
    visibleColumns: ReviewColumnVisibility;
    isCustomColumns: boolean;
    onToggleColumn: (column: ReviewColumnKey) => void;
    onResetColumns: () => void;
    onExportAll: (format: ExportFormat) => void;
    onApplyQuery: (overrides: Partial<AdminReviewFilters>) => void;
    onResetFilters: () => void;
};

const RATING_LABELS: Record<ReviewRatingFilter, string> = {
    low: 'Rating Rendah (1–2)',
    '5': 'Bintang 5',
    '4': 'Bintang 4',
    '3': 'Bintang 3',
    '2': 'Bintang 2',
    '1': 'Bintang 1',
};

const VISIBILITY_LABELS: Record<ReviewVisibilityFilter, string> = {
    visible: 'Tampil',
    hidden: 'Disembunyikan',
};

const REPLY_STATUS_LABELS: Record<ReviewReplyStatusFilter, string> = {
    replied: 'Sudah Dibalas',
    unreplied: 'Belum Dibalas',
};

export function ReviewIndexToolbar({
    filters,
    options,
    visibleColumns,
    isCustomColumns,
    onToggleColumn,
    onResetColumns,
    onExportAll,
    onApplyQuery,
    onResetFilters,
}: Props) {
    const filterGroups: DataTableFilterGroup[] = [
        {
            key: 'rating',
            label: 'Rating Bintang',
            value: filters.rating ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'low', label: '1–2 Bintang' },
                { value: '5', label: 'Bintang 5' },
                { value: '4', label: 'Bintang 4' },
                { value: '3', label: 'Bintang 3' },
                { value: '2', label: 'Bintang 2' },
                { value: '1', label: 'Bintang 1' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    rating: (value as ReviewRatingFilter) || null,
                }),
        },
        {
            key: 'visibility',
            label: 'Status Moderasi',
            value: filters.visibility ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'visible', label: 'Tampil' },
                { value: 'hidden', label: 'Disembunyikan' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    visibility: (value as ReviewVisibilityFilter) || null,
                }),
        },
        {
            key: 'reply_status',
            label: 'Balasan Kossuma',
            value: filters.reply_status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'unreplied', label: 'Belum Dibalas' },
                { value: 'replied', label: 'Sudah Dibalas' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    reply_status: (value as ReviewReplyStatusFilter) || null,
                }),
        },
        {
            key: 'store_id',
            label: 'Toko UMKM',
            value: filters.store_id ? String(filters.store_id) : '',
            options: [
                { value: '', label: 'Semua' },
                ...options.stores.map((store) => ({
                    value: String(store.id),
                    label: store.name,
                })),
            ],
            onChange: (value) =>
                onApplyQuery({
                    store_id: value || null,
                }),
        },
    ];

    const activeChips: DataTableActiveChip[] = [];

    if (filters.product_id) {
        const matchedProduct = options.products.find(
            (product) => String(product.id) === String(filters.product_id),
        );
        activeChips.push({
            key: 'product_id',
            label: `Produk: ${matchedProduct?.name ?? filters.product_id}`,
            ariaLabel: 'Hapus filter produk',
            onRemove: () => onApplyQuery({ product_id: null }),
        });
    }

    if (filters.store_id) {
        const matchedStore = options.stores.find(
            (store) => String(store.id) === String(filters.store_id),
        );
        activeChips.push({
            key: 'store_id',
            label: `Toko: ${matchedStore?.name ?? filters.store_id}`,
            ariaLabel: 'Hapus filter toko',
            onRemove: () => onApplyQuery({ store_id: null }),
        });
    }

    if (filters.rating) {
        activeChips.push({
            key: 'rating',
            label: RATING_LABELS[filters.rating],
            ariaLabel: 'Hapus filter rating',
            onRemove: () => onApplyQuery({ rating: null }),
        });
    }

    if (filters.visibility) {
        activeChips.push({
            key: 'visibility',
            label: `Status: ${VISIBILITY_LABELS[filters.visibility]}`,
            ariaLabel: 'Hapus filter status moderasi',
            onRemove: () => onApplyQuery({ visibility: null }),
        });
    }

    if (filters.reply_status) {
        activeChips.push({
            key: 'reply_status',
            label: `Balasan: ${REPLY_STATUS_LABELS[filters.reply_status]}`,
            ariaLabel: 'Hapus filter status balasan',
            onRemove: () => onApplyQuery({ reply_status: null }),
        });
    }

    if (filters.date_from) {
        activeChips.push({
            key: 'date_from',
            label: `Dari: ${filters.date_from}`,
            ariaLabel: 'Hapus filter tanggal mulai',
            onRemove: () => onApplyQuery({ date_from: null }),
        });
    }

    if (filters.date_to) {
        activeChips.push({
            key: 'date_to',
            label: `Sampai: ${filters.date_to}`,
            ariaLabel: 'Hapus filter tanggal akhir',
            onRemove: () => onApplyQuery({ date_to: null }),
        });
    }

    const dropdownActiveCount = [
        filters.rating,
        filters.visibility,
        filters.reply_status,
        filters.store_id,
    ].filter(Boolean).length;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <DataTableSearch
                    value={filters.search ?? ''}
                    placeholder="Cari isi ulasan, nama pembeli, produk, atau nomor pesanan..."
                    ariaLabel="Cari ulasan"
                    dataTest="review-search-input"
                    onSearch={(term, callbacks) => {
                        router.get(
                            index.url({
                                query: {
                                    search: term || undefined,
                                    product_id: filters.product_id
                                        ? String(filters.product_id)
                                        : undefined,
                                    store_id: filters.store_id
                                        ? String(filters.store_id)
                                        : undefined,
                                    rating: filters.rating ?? undefined,
                                    visibility: filters.visibility ?? undefined,
                                    reply_status:
                                        filters.reply_status ?? undefined,
                                    date_from: filters.date_from ?? undefined,
                                    date_to: filters.date_to ?? undefined,
                                    sort: filters.sort ?? undefined,
                                    direction: filters.direction ?? undefined,
                                },
                            }),
                            {},
                            {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                                only: ['reviews', 'filters'],
                                onStart: callbacks.onStart,
                                onFinish: callbacks.onFinish,
                            },
                        );
                    }}
                    onClear={() => onApplyQuery({ search: null })}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={
                            filters.product_id
                                ? String(filters.product_id)
                                : 'all'
                        }
                        onValueChange={(value) =>
                            onApplyQuery({
                                product_id: value === 'all' ? null : value,
                            })
                        }
                    >
                        <SelectTrigger
                            aria-label="Filter berdasarkan produk"
                            data-test="review-product-filter"
                            className="h-11 w-full cursor-pointer rounded-xl border-gray-200 bg-white text-sm text-gray-700 sm:w-52"
                        >
                            <SelectValue placeholder="Semua Produk" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 rounded-xl border-gray-100 bg-white">
                            <SelectItem
                                value="all"
                                className="cursor-pointer text-sm"
                            >
                                Semua Produk
                            </SelectItem>
                            {options.products.map((product) => (
                                <SelectItem
                                    key={product.id}
                                    value={String(product.id)}
                                    className="cursor-pointer text-sm"
                                >
                                    {product.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DataTableFilterDropdown
                        groups={filterGroups}
                        activeCount={dropdownActiveCount}
                        onReset={onResetFilters}
                        dataTest="open-review-filter-button"
                    />

                    <DataTableColumnToggle
                        columns={REVIEW_COLUMNS}
                        visibleColumns={visibleColumns}
                        isCustomColumns={isCustomColumns}
                        onToggleColumn={onToggleColumn}
                        onResetColumns={onResetColumns}
                        dataTest="review-column-visibility-trigger"
                    />

                    <DataTableExportDropdown
                        onExport={onExportAll}
                        dataTest="review-export-all-trigger"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className="font-medium text-gray-500">
                    Rentang Tanggal:
                </span>
                <input
                    type="date"
                    aria-label="Tanggal mulai ulasan"
                    value={filters.date_from ?? ''}
                    onChange={(event) =>
                        onApplyQuery({
                            date_from: event.target.value || null,
                        })
                    }
                    className="h-9 cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 focus-visible:border-[#7D3394] focus-visible:ring-2 focus-visible:ring-[#7D3394]/20 focus-visible:outline-none"
                />
                <span className="text-gray-400">s/d</span>
                <input
                    type="date"
                    aria-label="Tanggal akhir ulasan"
                    value={filters.date_to ?? ''}
                    onChange={(event) =>
                        onApplyQuery({
                            date_to: event.target.value || null,
                        })
                    }
                    className="h-9 cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 focus-visible:border-[#7D3394] focus-visible:ring-2 focus-visible:ring-[#7D3394]/20 focus-visible:outline-none"
                />
            </div>

            <DataTableActiveFilterChips
                chips={activeChips}
                onReset={onResetFilters}
            />
        </div>
    );
}
