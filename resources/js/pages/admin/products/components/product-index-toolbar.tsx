import { Link, router } from '@inertiajs/react';
import { Plus, Upload } from 'lucide-react';
import {
    DataTableActiveFilterChips,
    DataTableColumnToggle,
    DataTableExportDropdown,
    DataTableFilterDropdown,
    DataTableSearch,
} from '@/components/data-table';
import { create, index } from '@/routes/admin/products';
import type {
    DataTableActiveChip,
    DataTableFilterGroup,
} from '@/types/data-table';
import { PRODUCT_COLUMNS } from '../types';
import type {
    ExportFormat,
    ProductColumnKey,
    ProductColumnVisibility,
    ProductFilters,
    ProductFormOptions,
    ProductPreorderFilter,
    ProductStatusFilter,
    ProductStockFilter,
} from '../types';

type Props = {
    filters: ProductFilters;
    options: ProductFormOptions;
    visibleColumns: ProductColumnVisibility;
    isCustomColumns: boolean;
    onToggleColumn: (column: ProductColumnKey) => void;
    onResetColumns: () => void;
    onExportAll: (format: ExportFormat) => void;
    onOpenImport: () => void;
    onApplyQuery: (overrides: Partial<ProductFilters>) => void;
    onResetFilters: () => void;
};

const STATUS_LABELS: Record<ProductStatusFilter, string> = {
    active: 'Aktif',
    inactive: 'Nonaktif',
};

const STOCK_LABELS: Record<ProductStockFilter, string> = {
    in_stock: 'Tersedia',
    out_of_stock: 'Stok Habis',
};

const PREORDER_LABELS: Record<ProductPreorderFilter, string> = {
    preorder: 'Pre-order',
    regular: 'Reguler',
};

export function ProductIndexToolbar({
    filters,
    options,
    visibleColumns,
    isCustomColumns,
    onToggleColumn,
    onResetColumns,
    onExportAll,
    onOpenImport,
    onApplyQuery,
    onResetFilters,
}: Props) {
    const filterGroups: DataTableFilterGroup[] = [
        {
            key: 'status',
            label: 'Status Produk',
            value: filters.status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Nonaktif' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    status: (value as ProductStatusFilter) || null,
                }),
        },
        {
            key: 'stock_status',
            label: 'Ketersediaan Stok',
            value: filters.stock_status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'in_stock', label: 'Tersedia' },
                { value: 'out_of_stock', label: 'Stok Habis' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    stock_status: (value as ProductStockFilter) || null,
                }),
        },
        {
            key: 'preorder_status',
            label: 'Jenis Pengiriman',
            value: filters.preorder_status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'regular', label: 'Reguler' },
                { value: 'preorder', label: 'Pre-order' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    preorder_status: (value as ProductPreorderFilter) || null,
                }),
        },
        {
            key: 'category_id',
            label: 'Kategori',
            value: filters.category_id ? String(filters.category_id) : '',
            options: [
                { value: '', label: 'Semua' },
                ...options.categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                })),
            ],
            onChange: (value) =>
                onApplyQuery({
                    category_id: value || null,
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

    if (filters.status) {
        activeChips.push({
            key: 'status',
            label: `Status: ${STATUS_LABELS[filters.status]}`,
            ariaLabel: 'Hapus filter status',
            onRemove: () => onApplyQuery({ status: null }),
        });
    }

    if (filters.stock_status) {
        activeChips.push({
            key: 'stock_status',
            label: `Stok: ${STOCK_LABELS[filters.stock_status]}`,
            ariaLabel: 'Hapus filter stok',
            onRemove: () => onApplyQuery({ stock_status: null }),
        });
    }

    if (filters.preorder_status) {
        activeChips.push({
            key: 'preorder_status',
            label: `Jenis: ${PREORDER_LABELS[filters.preorder_status]}`,
            ariaLabel: 'Hapus filter jenis pengiriman',
            onRemove: () => onApplyQuery({ preorder_status: null }),
        });
    }

    if (filters.category_id) {
        const matchedCategory = options.categories.find(
            (category) => String(category.id) === String(filters.category_id),
        );
        activeChips.push({
            key: 'category_id',
            label: `Kategori: ${matchedCategory?.name ?? filters.category_id}`,
            ariaLabel: 'Hapus filter kategori',
            onRemove: () => onApplyQuery({ category_id: null }),
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

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <DataTableSearch
                    value={filters.search ?? ''}
                    placeholder="Cari nama, slug, atau deskripsi produk..."
                    ariaLabel="Cari produk"
                    dataTest="product-search-input"
                    onSearch={(term, callbacks) => {
                        router.get(
                            index.url({
                                query: {
                                    search: term || undefined,
                                    category_id: filters.category_id
                                        ? String(filters.category_id)
                                        : undefined,
                                    store_id: filters.store_id
                                        ? String(filters.store_id)
                                        : undefined,
                                    status: filters.status ?? undefined,
                                    stock_status:
                                        filters.stock_status ?? undefined,
                                    preorder_status:
                                        filters.preorder_status ?? undefined,
                                    sort: filters.sort ?? undefined,
                                    direction: filters.direction ?? undefined,
                                },
                            }),
                            {},
                            {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                                only: ['products', 'filters'],
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
                        dataTest="open-product-filter-button"
                    />

                    <DataTableColumnToggle
                        columns={PRODUCT_COLUMNS}
                        visibleColumns={visibleColumns}
                        isCustomColumns={isCustomColumns}
                        onToggleColumn={onToggleColumn}
                        onResetColumns={onResetColumns}
                        dataTest="product-column-visibility-trigger"
                    />

                    <button
                        type="button"
                        onClick={onOpenImport}
                        data-test="open-product-import-button"
                        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700"
                    >
                        <Upload className="h-4 w-4" />
                        <span>Impor</span>
                    </button>

                    <DataTableExportDropdown
                        onExport={onExportAll}
                        dataTest="product-export-all-trigger"
                    />

                    <Link
                        href={create()}
                        className="inline-flex h-11 flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-5 text-sm font-bold text-white sm:flex-none"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Produk</span>
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
