import { Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import {
    DataTableActiveFilterChips,
    DataTableColumnToggle,
    DataTableExportDropdown,
    DataTableFilterDropdown,
    DataTableSearch,
} from '@/components/data-table';
import { create, index } from '@/routes/admin/categories';
import type {
    DataTableActiveChip,
    DataTableFilterGroup,
} from '@/types/data-table';
import { CATEGORY_COLUMNS } from '../types';
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
    isCustomColumns: boolean;
    onToggleColumn: (column: CategoryColumnKey) => void;
    onResetColumns: () => void;
    onExportAll: (format: ExportFormat) => void;
    onApplyQuery: (overrides: Partial<CategoryFilters>) => void;
    onResetFilters: () => void;
};

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
    isCustomColumns,
    onToggleColumn,
    onResetColumns,
    onExportAll,
    onApplyQuery,
    onResetFilters,
}: Props) {
    const filterGroups: DataTableFilterGroup[] = [
        {
            key: 'product_status',
            label: 'Status Produk',
            value: filters.product_status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'with_products', label: 'Memiliki Produk' },
                { value: 'without_products', label: 'Belum Ada Produk' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    product_status: (value as ProductStatusFilter) || null,
                }),
        },
        {
            key: 'description_status',
            label: 'Kelengkapan Deskripsi',
            value: filters.description_status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'filled', label: 'Ada Deskripsi' },
                { value: 'empty', label: 'Tanpa Deskripsi' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    description_status:
                        (value as DescriptionStatusFilter) || null,
                }),
        },
    ];

    const activeChips: DataTableActiveChip[] = [];

    if (filters.product_status) {
        activeChips.push({
            key: 'product_status',
            label: `Produk: ${PRODUCT_STATUS_LABELS[filters.product_status]}`,
            ariaLabel: 'Hapus filter status produk',
            onRemove: () => onApplyQuery({ product_status: null }),
        });
    }

    if (filters.description_status) {
        activeChips.push({
            key: 'description_status',
            label: `Deskripsi: ${DESCRIPTION_STATUS_LABELS[filters.description_status]}`,
            ariaLabel: 'Hapus filter deskripsi',
            onRemove: () => onApplyQuery({ description_status: null }),
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <DataTableSearch
                    value={filters.search ?? ''}
                    placeholder="Cari nama, slug, atau deskripsi kategori..."
                    ariaLabel="Cari kategori"
                    dataTest="category-search-input"
                    onSearch={(term, callbacks) => {
                        router.get(
                            index.url({
                                query: {
                                    search: term || undefined,
                                    product_status:
                                        filters.product_status ?? undefined,
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
                                onStart: callbacks.onStart,
                                onFinish: callbacks.onFinish,
                            },
                        );
                    }}
                    onClear={() => onApplyQuery({ search: null })}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <DataTableFilterDropdown
                        groups={filterGroups}
                        activeCount={activeChips.length}
                        onReset={onResetFilters}
                        dataTest="open-category-filter-button"
                    />

                    <DataTableColumnToggle
                        columns={CATEGORY_COLUMNS}
                        visibleColumns={visibleColumns}
                        isCustomColumns={isCustomColumns}
                        onToggleColumn={onToggleColumn}
                        onResetColumns={onResetColumns}
                        dataTest="column-visibility-trigger"
                    />

                    <DataTableExportDropdown
                        onExport={onExportAll}
                        dataTest="export-all-trigger"
                    />

                    <Link
                        href={create()}
                        className="inline-flex h-11 flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-5 text-sm font-bold text-white sm:flex-none"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Kategori</span>
                    </Link>
                </div>
            </div>

            <DataTableActiveFilterChips
                chips={activeChips}
                onReset={onResetFilters}
            />
        </div>
    );
}
