import { Link } from '@inertiajs/react';
import { AlertTriangle, Eye, MessageSquare, Star } from 'lucide-react';
import {
    DataTableBulkActionBar,
    DataTablePagination,
    DataTableSortHeader,
} from '@/components/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { show } from '@/routes/admin/orders';
import type { SortDirection } from '@/types/data-table';
import { ORDER_COLUMNS } from '../types';
import type {
    AdminOrderSortField,
    AdminOrderStatus,
    ExportFormat,
    OrderColumnVisibility,
    PaginatedAdminOrders,
} from '../types';

type Props = {
    orders: PaginatedAdminOrders;
    activeSort: AdminOrderSortField;
    activeDirection: SortDirection;
    visibleColumns: OrderColumnVisibility;
    selectedIds: number[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    onToggleSelect: (id: number) => void;
    onToggleSelectAll: (checked: boolean) => void;
    onClearSelection: () => void;
    onSort: (column: AdminOrderSortField) => void;
    onExportSelected: (format: ExportFormat) => void;
};

const timestampFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

function formatTimestamp(isoDate: string): string {
    const parsed = new Date(isoDate);

    if (Number.isNaN(parsed.getTime())) {
        return '-';
    }

    return timestampFormatter.format(parsed);
}

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

function orderStatusBadgeClass(status: AdminOrderStatus): string {
    switch (status) {
        case 'pending_payment':
            return 'bg-amber-50 text-amber-700';
        case 'processing':
            return 'border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]';
        case 'shipped':
            return 'bg-blue-50 text-blue-700';
        case 'completed':
            return 'bg-emerald-50 text-emerald-700';
        case 'cancelled':
            return 'bg-red-50 text-[#DC2626]';
    }
}

function paymentStatusBadgeClass(status: string): string {
    switch (status) {
        case 'paid':
            return 'bg-emerald-50 text-emerald-700';
        case 'unpaid':
            return 'bg-amber-50 text-amber-700';
        case 'refunded':
            return 'bg-blue-50 text-blue-700';
        default:
            return 'bg-gray-100 text-gray-500';
    }
}

const CHECKBOX_CLASS =
    'cursor-pointer border-gray-300 data-[state=checked]:border-[#7D3394] data-[state=checked]:bg-[#7D3394] data-[state=indeterminate]:border-[#7D3394] data-[state=indeterminate]:bg-[#7D3394]';

export function OrderTable({
    orders,
    activeSort,
    activeDirection,
    visibleColumns,
    selectedIds,
    isAllSelected,
    isPartiallySelected,
    onToggleSelect,
    onToggleSelectAll,
    onClearSelection,
    onSort,
    onExportSelected,
}: Props) {
    const totalDesktopColumns =
        ORDER_COLUMNS.filter((column) => visibleColumns[column.key]).length + 2;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
            <DataTableBulkActionBar
                selectedCount={selectedIds.length}
                itemLabel="transaksi"
                onExport={onExportSelected}
                onClearSelection={onClearSelection}
                dataTest="order-bulk-action-bar"
            />

            <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70">
                            <th className="w-12 py-3.5 pr-2 pl-5">
                                <Checkbox
                                    checked={
                                        isAllSelected
                                            ? true
                                            : isPartiallySelected
                                              ? 'indeterminate'
                                              : false
                                    }
                                    onCheckedChange={(checked) =>
                                        onToggleSelectAll(checked === true)
                                    }
                                    aria-label="Pilih semua transaksi di halaman ini"
                                    data-test="select-all-orders"
                                    className={CHECKBOX_CLASS}
                                />
                            </th>

                            {visibleColumns.order_number && (
                                <DataTableSortHeader
                                    column="order_number"
                                    label="Nomor Pesanan"
                                    activeSort={activeSort}
                                    activeDirection={activeDirection}
                                    onSort={onSort}
                                />
                            )}

                            {visibleColumns.customer && (
                                <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                    Pembeli
                                </th>
                            )}

                            {visibleColumns.store && (
                                <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                    Toko UMKM
                                </th>
                            )}

                            {visibleColumns.items && (
                                <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                    Produk
                                </th>
                            )}

                            {visibleColumns.total_amount && (
                                <DataTableSortHeader
                                    column="total_amount"
                                    label="Total Belanja"
                                    activeSort={activeSort}
                                    activeDirection={activeDirection}
                                    onSort={onSort}
                                />
                            )}

                            {visibleColumns.payment_status && (
                                <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                    Pembayaran
                                </th>
                            )}

                            {visibleColumns.status && (
                                <DataTableSortHeader
                                    column="status"
                                    label="Status"
                                    activeSort={activeSort}
                                    activeDirection={activeDirection}
                                    onSort={onSort}
                                />
                            )}

                            {visibleColumns.shipping_courier && (
                                <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                    Kurir
                                </th>
                            )}

                            {visibleColumns.tracking_number && (
                                <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                    Nomor Resi
                                </th>
                            )}

                            {visibleColumns.created_at && (
                                <DataTableSortHeader
                                    column="created_at"
                                    label="Tanggal"
                                    activeSort={activeSort}
                                    activeDirection={activeDirection}
                                    onSort={onSort}
                                />
                            )}

                            <th className="py-3.5 pr-5 pl-4 text-right text-xs font-semibold text-gray-600">
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {orders.data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={totalDesktopColumns}
                                    className="px-5 py-12 text-center text-sm text-gray-500"
                                >
                                    Belum ada transaksi yang sesuai filter.
                                </td>
                            </tr>
                        ) : (
                            orders.data.map((order) => {
                                const isSelected = selectedIds.includes(
                                    order.id,
                                );

                                return (
                                    <tr
                                        key={order.id}
                                        className={
                                            isSelected
                                                ? 'bg-[#F9F5FB]/60'
                                                : undefined
                                        }
                                    >
                                        <td className="py-4 pr-2 pl-5 align-top">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() =>
                                                    onToggleSelect(order.id)
                                                }
                                                aria-label={`Pilih transaksi ${order.order_number}`}
                                                data-test={`select-order-${order.id}`}
                                                className={`mt-1 ${CHECKBOX_CLASS}`}
                                            />
                                        </td>

                                        {visibleColumns.order_number && (
                                            <td className="px-4 py-4 align-top whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <Link
                                                        href={show(order.id)}
                                                        className="cursor-pointer text-sm font-semibold text-gray-900 tabular-nums"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                        {order.needs_attention && (
                                                            <span className="inline-flex items-center gap-1 text-amber-600">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                <span>
                                                                    Tindak
                                                                    lanjut
                                                                </span>
                                                            </span>
                                                        )}
                                                        {order.internal_notes_count >
                                                            0 && (
                                                            <span className="inline-flex items-center gap-1 text-gray-400">
                                                                <MessageSquare className="h-3 w-3" />
                                                                <span>
                                                                    {
                                                                        order.internal_notes_count
                                                                    }
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.customer && (
                                            <td className="max-w-[180px] min-w-[130px] px-4 py-4 align-top">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm text-gray-900">
                                                        {order.customer_name}
                                                    </span>
                                                    {order.customer_phone && (
                                                        <span className="text-xs text-gray-400 tabular-nums">
                                                            {
                                                                order.customer_phone
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.store && (
                                            <td className="max-w-[170px] min-w-[120px] px-4 py-4 align-top text-sm text-gray-600">
                                                {order.store_name}
                                            </td>
                                        )}

                                        {visibleColumns.items && (
                                            <td className="max-w-[230px] min-w-[160px] px-4 py-4 align-top">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="line-clamp-2 text-sm text-gray-900">
                                                        {
                                                            order.primary_item_name
                                                        }
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {order.other_items_count >
                                                        0
                                                            ? `+${order.other_items_count} produk lainnya • `
                                                            : ''}
                                                        {order.total_quantity}{' '}
                                                        item
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.total_amount && (
                                            <td className="px-4 py-4 align-top whitespace-nowrap">
                                                <span className="text-sm font-extrabold tracking-tight text-[#DC2626] tabular-nums">
                                                    {formatRupiah(
                                                        order.total_amount,
                                                    )}
                                                </span>
                                            </td>
                                        )}

                                        {visibleColumns.payment_status && (
                                            <td className="px-4 py-4 align-top whitespace-nowrap">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${paymentStatusBadgeClass(order.payment_status)}`}
                                                    >
                                                        {
                                                            order.payment_status_label
                                                        }
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {order.payment_channel}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.status && (
                                            <td className="px-4 py-4 align-top whitespace-nowrap">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${orderStatusBadgeClass(order.status)}`}
                                                    >
                                                        {order.status_label}
                                                    </span>
                                                    {order.status ===
                                                        'completed' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                                                            <Star className="h-3 w-3 text-amber-500" />
                                                            <span>
                                                                {
                                                                    order.reviewed_count
                                                                }
                                                                /
                                                                {
                                                                    order.items_count
                                                                }{' '}
                                                                diulas
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.shipping_courier && (
                                            <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-600">
                                                {order.shipping_courier}
                                            </td>
                                        )}

                                        {visibleColumns.tracking_number && (
                                            <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-600 tabular-nums">
                                                {order.tracking_number ?? '-'}
                                            </td>
                                        )}

                                        {visibleColumns.created_at && (
                                            <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-500">
                                                {formatTimestamp(
                                                    order.created_at,
                                                )}
                                            </td>
                                        )}

                                        <td className="py-4 pr-5 pl-4 text-right align-top whitespace-nowrap">
                                            <Link
                                                href={show(order.id)}
                                                data-test={`view-order-${order.id}`}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#F0E6F5] px-3 py-1.5 text-xs font-semibold text-[#7D3394]"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Kelola</span>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                        <Checkbox
                            checked={
                                isAllSelected
                                    ? true
                                    : isPartiallySelected
                                      ? 'indeterminate'
                                      : false
                            }
                            onCheckedChange={(checked) =>
                                onToggleSelectAll(checked === true)
                            }
                            aria-label="Pilih semua transaksi di halaman ini"
                            className={CHECKBOX_CLASS}
                        />
                        <span>Pilih semua</span>
                    </label>

                    <Select
                        value={activeSort}
                        onValueChange={(value) =>
                            onSort(value as AdminOrderSortField)
                        }
                    >
                        <SelectTrigger
                            aria-label="Urutkan transaksi"
                            className="h-8 w-auto min-w-[140px] cursor-pointer rounded-lg border-gray-200 bg-white text-xs text-gray-700"
                        >
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 bg-white">
                            <SelectItem
                                value="created_at"
                                className="cursor-pointer text-xs"
                            >
                                Urut: Terbaru
                            </SelectItem>
                            <SelectItem
                                value="total_amount"
                                className="cursor-pointer text-xs"
                            >
                                Urut: Total Belanja
                            </SelectItem>
                            <SelectItem
                                value="order_number"
                                className="cursor-pointer text-xs"
                            >
                                Urut: Nomor Pesanan
                            </SelectItem>
                            <SelectItem
                                value="status"
                                className="cursor-pointer text-xs"
                            >
                                Urut: Status
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {orders.data.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-gray-500">
                        Belum ada transaksi yang sesuai filter.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {orders.data.map((order) => {
                            const isSelected = selectedIds.includes(order.id);

                            return (
                                <div
                                    key={order.id}
                                    className={`flex flex-col gap-3 p-4 ${
                                        isSelected
                                            ? 'bg-[#F9F5FB]/60'
                                            : undefined
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex min-w-0 items-start gap-2.5">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() =>
                                                    onToggleSelect(order.id)
                                                }
                                                aria-label={`Pilih transaksi ${order.order_number}`}
                                                className={`mt-1 ${CHECKBOX_CLASS}`}
                                            />
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <Link
                                                    href={show(order.id)}
                                                    className="cursor-pointer text-sm font-semibold text-gray-900 tabular-nums"
                                                >
                                                    {order.order_number}
                                                </Link>
                                                <span className="text-xs text-gray-500">
                                                    {order.customer_name} •{' '}
                                                    {order.store_name}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${orderStatusBadgeClass(order.status)}`}
                                        >
                                            {order.status_label}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1 pl-7">
                                        <span className="line-clamp-1 text-sm text-gray-900">
                                            {order.primary_item_name}
                                            {order.other_items_count > 0
                                                ? ` (+${order.other_items_count} lainnya)`
                                                : ''}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatTimestamp(order.created_at)}{' '}
                                            • {order.payment_status_label}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pl-7">
                                        <span className="text-sm font-extrabold text-[#DC2626] tabular-nums">
                                            {formatRupiah(order.total_amount)}
                                        </span>
                                        <Link
                                            href={show(order.id)}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#F0E6F5] px-3 py-1.5 text-xs font-semibold text-[#7D3394]"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Kelola</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <DataTablePagination
                paginated={orders}
                itemLabel="transaksi"
                onlyProps={['orders', 'filters']}
            />
        </div>
    );
}
