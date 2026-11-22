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
import { index } from '@/routes/admin/orders';
import type {
    DataTableActiveChip,
    DataTableFilterGroup,
} from '@/types/data-table';
import { ORDER_COLUMNS } from '../types';
import type {
    AdminOrderFilterOptions,
    AdminOrderFilters,
    ExportFormat,
    OrderColumnKey,
    OrderColumnVisibility,
    OrderReviewFilter,
    PaymentMethodFilter,
    PaymentStatusFilter,
} from '../types';

type Props = {
    filters: AdminOrderFilters;
    options: AdminOrderFilterOptions;
    visibleColumns: OrderColumnVisibility;
    isCustomColumns: boolean;
    onToggleColumn: (column: OrderColumnKey) => void;
    onResetColumns: () => void;
    onExportAll: (format: ExportFormat) => void;
    onApplyQuery: (overrides: Partial<AdminOrderFilters>) => void;
    onResetFilters: () => void;
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatusFilter, string> = {
    unpaid: 'Belum Dibayar',
    paid: 'Lunas',
    refunded: 'Dikembalikan',
    cancelled: 'Dibatalkan',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethodFilter, string> = {
    qris: 'QRIS',
    bank_transfer: 'Transfer Bank',
    cod: 'Bayar di Tempat (COD)',
};

const REVIEW_STATUS_LABELS: Record<OrderReviewFilter, string> = {
    reviewed: 'Sudah Diulas',
    unreviewed: 'Selesai & Belum Diulas',
};

export function OrderIndexToolbar({
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
            key: 'payment_status',
            label: 'Status Pembayaran',
            value: filters.payment_status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'unpaid', label: 'Belum Dibayar' },
                { value: 'paid', label: 'Lunas' },
                { value: 'refunded', label: 'Dikembalikan' },
                { value: 'cancelled', label: 'Dibatalkan' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    payment_status: (value as PaymentStatusFilter) || null,
                }),
        },
        {
            key: 'payment_method',
            label: 'Metode Pembayaran',
            value: filters.payment_method ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'qris', label: 'QRIS' },
                { value: 'bank_transfer', label: 'Transfer Bank' },
                { value: 'cod', label: 'COD' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    payment_method: (value as PaymentMethodFilter) || null,
                }),
        },
        {
            key: 'review_status',
            label: 'Status Ulasan',
            value: filters.review_status ?? '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'reviewed', label: 'Sudah Diulas' },
                { value: 'unreviewed', label: 'Selesai & Belum Diulas' },
            ],
            onChange: (value) =>
                onApplyQuery({
                    review_status: (value as OrderReviewFilter) || null,
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
        {
            key: 'shipping_courier',
            label: 'Jasa Ekspedisi / Kurir',
            value: filters.shipping_courier ?? '',
            options: [
                { value: '', label: 'Semua' },
                ...options.couriers.map((courier) => ({
                    value: courier,
                    label: courier,
                })),
            ],
            onChange: (value) =>
                onApplyQuery({
                    shipping_courier: value || null,
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

    if (filters.payment_status) {
        activeChips.push({
            key: 'payment_status',
            label: `Pembayaran: ${PAYMENT_STATUS_LABELS[filters.payment_status]}`,
            ariaLabel: 'Hapus filter status pembayaran',
            onRemove: () => onApplyQuery({ payment_status: null }),
        });
    }

    if (filters.payment_method) {
        activeChips.push({
            key: 'payment_method',
            label: `Metode: ${PAYMENT_METHOD_LABELS[filters.payment_method]}`,
            ariaLabel: 'Hapus filter metode pembayaran',
            onRemove: () => onApplyQuery({ payment_method: null }),
        });
    }

    if (filters.shipping_courier) {
        activeChips.push({
            key: 'shipping_courier',
            label: `Kurir: ${filters.shipping_courier}`,
            ariaLabel: 'Hapus filter kurir',
            onRemove: () => onApplyQuery({ shipping_courier: null }),
        });
    }

    if (filters.review_status) {
        activeChips.push({
            key: 'review_status',
            label: `Ulasan: ${REVIEW_STATUS_LABELS[filters.review_status]}`,
            ariaLabel: 'Hapus filter ulasan',
            onRemove: () => onApplyQuery({ review_status: null }),
        });
    }

    if (filters.needs_attention === '1') {
        activeChips.push({
            key: 'needs_attention',
            label: 'Butuh Tindak Lanjut',
            ariaLabel: 'Hapus filter butuh tindak lanjut',
            onRemove: () => onApplyQuery({ needs_attention: null }),
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
        filters.payment_status,
        filters.payment_method,
        filters.review_status,
        filters.store_id,
        filters.shipping_courier,
    ].filter(Boolean).length;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <DataTableSearch
                    value={filters.search ?? ''}
                    placeholder="Cari no. pesanan, pembeli, toko, produk, atau resi..."
                    ariaLabel="Cari transaksi"
                    dataTest="order-search-input"
                    onSearch={(term, callbacks) => {
                        router.get(
                            index.url({
                                query: {
                                    search: term || undefined,
                                    status: filters.status ?? undefined,
                                    payment_status:
                                        filters.payment_status ?? undefined,
                                    payment_method:
                                        filters.payment_method ?? undefined,
                                    store_id: filters.store_id
                                        ? String(filters.store_id)
                                        : undefined,
                                    product_id: filters.product_id
                                        ? String(filters.product_id)
                                        : undefined,
                                    shipping_courier:
                                        filters.shipping_courier ?? undefined,
                                    review_status:
                                        filters.review_status ?? undefined,
                                    needs_attention:
                                        filters.needs_attention ?? undefined,
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
                                only: ['orders', 'filters'],
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
                            data-test="order-product-filter"
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
                        dataTest="open-order-filter-button"
                    />

                    <DataTableColumnToggle
                        columns={ORDER_COLUMNS}
                        visibleColumns={visibleColumns}
                        isCustomColumns={isCustomColumns}
                        onToggleColumn={onToggleColumn}
                        onResetColumns={onResetColumns}
                        dataTest="order-column-visibility-trigger"
                    />

                    <DataTableExportDropdown
                        onExport={onExportAll}
                        dataTest="order-export-all-trigger"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className="font-medium text-gray-500">
                    Rentang Tanggal:
                </span>
                <input
                    type="date"
                    aria-label="Tanggal mulai"
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
                    aria-label="Tanggal akhir"
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
