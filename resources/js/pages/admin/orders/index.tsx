import { Head, router } from '@inertiajs/react';
import { useDataTable } from '@/hooks/use-data-table';
import { dashboard } from '@/routes/admin';
import { exportMethod, index } from '@/routes/admin/orders';
import { OrderIndexToolbar } from './components/order-index-toolbar';
import { OrderStatCards } from './components/order-stat-cards';
import { OrderStatusTabs } from './components/order-status-tabs';
import { OrderTable } from './components/order-table';
import { ORDER_COLUMNS } from './types';
import type {
    AdminOrderFilterOptions,
    AdminOrderFilters,
    AdminOrderSortField,
    AdminOrderStats,
    AdminOrderStatusCounts,
    AdminOrderStatusFilter,
    OrderColumnKey,
    PaginatedAdminOrders,
} from './types';

type Props = {
    orders: PaginatedAdminOrders;
    stats: AdminOrderStats;
    statusCounts: AdminOrderStatusCounts;
    options: AdminOrderFilterOptions;
    filters: AdminOrderFilters | [];
};

export default function AdminOrdersIndex({
    orders,
    stats,
    statusCounts,
    options,
    filters,
}: Props) {
    const safeFilters: AdminOrderFilters = Array.isArray(filters)
        ? {}
        : filters;

    const table = useDataTable<
        number,
        OrderColumnKey,
        AdminOrderSortField,
        AdminOrderFilters
    >({
        itemIds: orders.data.map((order) => order.id),
        filters: safeFilters,
        columns: ORDER_COLUMNS,
        defaultSort: 'created_at',
        defaultDirection: 'desc',
        onlyProps: ['orders', 'filters'],
        buildIndexUrl: (query) => index.url({ query }),
        onExport: ({ format, ids, columns, filters: activeFilters }) => {
            router.post(
                exportMethod.url(),
                {
                    format,
                    ids,
                    columns,
                    search: activeFilters.search,
                    status: activeFilters.status,
                    payment_status: activeFilters.payment_status,
                    payment_method: activeFilters.payment_method,
                    store_id: activeFilters.store_id,
                    product_id: activeFilters.product_id,
                    shipping_courier: activeFilters.shipping_courier,
                    review_status: activeFilters.review_status,
                    needs_attention: activeFilters.needs_attention,
                    date_from: activeFilters.date_from,
                    date_to: activeFilters.date_to,
                    sort: activeFilters.sort,
                    direction: activeFilters.direction,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
    });

    const activeStatus: AdminOrderStatusFilter =
        (safeFilters.status as AdminOrderStatusFilter | null) ?? 'all';

    const handleResetFilters = () => {
        table.applyQuery({
            payment_status: null,
            payment_method: null,
            store_id: null,
            product_id: null,
            shipping_courier: null,
            review_status: null,
            needs_attention: null,
            date_from: null,
            date_to: null,
        });
    };

    return (
        <>
            <Head title="Kelola Transaksi" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Kelola Transaksi
                    </h1>
                    <p className="text-sm text-gray-500">
                        Pantau seluruh pesanan pelanggan, pembayaran,
                        pengiriman, ulasan, dan lakukan tindak lanjut cepat ke
                        pembeli, toko UMKM, maupun kurir.
                    </p>
                </div>

                <OrderStatCards
                    stats={stats}
                    onSelectNeedsAttention={() =>
                        table.applyQuery({
                            status: null,
                            needs_attention:
                                safeFilters.needs_attention === '1'
                                    ? null
                                    : '1',
                        })
                    }
                />

                <OrderStatusTabs
                    activeStatus={activeStatus}
                    counts={statusCounts}
                    onSelectStatus={(status) =>
                        table.applyQuery({
                            status: status === 'all' ? null : status,
                            needs_attention: null,
                        })
                    }
                />

                <OrderIndexToolbar
                    filters={safeFilters}
                    options={options}
                    visibleColumns={table.visibleColumns}
                    isCustomColumns={table.isCustomColumns}
                    onToggleColumn={table.toggleColumn}
                    onResetColumns={table.resetColumns}
                    onExportAll={(format) => table.triggerExport(format)}
                    onApplyQuery={table.applyQuery}
                    onResetFilters={handleResetFilters}
                />

                <OrderTable
                    orders={orders}
                    activeSort={table.activeSort}
                    activeDirection={table.activeDirection}
                    visibleColumns={table.visibleColumns}
                    selectedIds={table.selectedIds}
                    isAllSelected={table.isAllSelected}
                    isPartiallySelected={table.isPartiallySelected}
                    onToggleSelect={table.toggleSelect}
                    onToggleSelectAll={table.toggleSelectAll}
                    onClearSelection={table.clearSelection}
                    onSort={table.handleSort}
                    onExportSelected={(format) =>
                        table.triggerExport(format, table.selectedIds)
                    }
                />
            </div>
        </>
    );
}

AdminOrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Transaksi',
            href: index(),
        },
    ],
};
