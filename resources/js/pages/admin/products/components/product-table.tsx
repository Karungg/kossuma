import { Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    DataTableBulkActionBar,
    DataTableBulkDeleteDialog,
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
import { bulkDestroy, edit } from '@/routes/admin/products';
import type { SortDirection } from '@/types/data-table';
import { PRODUCT_COLUMNS } from '../types';
import type {
    ExportFormat,
    PaginatedProducts,
    ProductColumnVisibility,
    ProductItem,
    ProductSortField,
} from '../types';
import { ProductDeleteDialog } from './product-delete-dialog';

type Props = {
    products: PaginatedProducts;
    activeSort: ProductSortField;
    activeDirection: SortDirection;
    visibleColumns: ProductColumnVisibility;
    selectedIds: number[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    onToggleSelect: (id: number) => void;
    onToggleSelectAll: (checked: boolean) => void;
    onClearSelection: () => void;
    onSort: (column: ProductSortField) => void;
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

const CHECKBOX_CLASS =
    'cursor-pointer border-gray-300 data-[state=checked]:border-[#7D3394] data-[state=checked]:bg-[#7D3394] data-[state=indeterminate]:border-[#7D3394] data-[state=indeterminate]:bg-[#7D3394]';

export function ProductTable({
    products,
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
    const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(
        null,
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const totalDesktopColumns =
        PRODUCT_COLUMNS.filter((column) => visibleColumns[column.key]).length +
        2;

    const handleConfirmBulkDelete = () => {
        if (selectedIds.length === 0) {
            return;
        }

        setIsBulkDeleting(true);
        router.delete(bulkDestroy.url(), {
            data: { ids: selectedIds },
            preserveScroll: true,
            onSuccess: () => {
                onClearSelection();
                setIsBulkDeleteOpen(false);
            },
            onFinish: () => {
                setIsBulkDeleting(false);
            },
        });
    };

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
                <DataTableBulkActionBar
                    selectedCount={selectedIds.length}
                    itemLabel="produk"
                    onExport={onExportSelected}
                    onBulkDelete={() => setIsBulkDeleteOpen(true)}
                    onClearSelection={onClearSelection}
                    dataTest="product-bulk-action-bar"
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
                                        aria-label="Pilih semua produk di halaman ini"
                                        data-test="select-all-products"
                                        className={CHECKBOX_CLASS}
                                    />
                                </th>

                                {visibleColumns.name && (
                                    <DataTableSortHeader
                                        column="name"
                                        label="Produk"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.slug && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Slug
                                    </th>
                                )}

                                {visibleColumns.category && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Kategori
                                    </th>
                                )}

                                {visibleColumns.store && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Toko UMKM
                                    </th>
                                )}

                                {visibleColumns.price && (
                                    <DataTableSortHeader
                                        column="price"
                                        label="Harga"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.stock && (
                                    <DataTableSortHeader
                                        column="stock"
                                        label="Stok"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.status && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Status
                                    </th>
                                )}

                                {visibleColumns.is_preorder && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Pre-order
                                    </th>
                                )}

                                {visibleColumns.sold_count && (
                                    <DataTableSortHeader
                                        column="sold_count"
                                        label="Terjual"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.created_at && (
                                    <DataTableSortHeader
                                        column="created_at"
                                        label="Dibuat"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.updated_at && (
                                    <DataTableSortHeader
                                        column="updated_at"
                                        label="Diperbarui"
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
                            {products.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={totalDesktopColumns}
                                        className="px-5 py-12 text-center text-sm text-gray-500"
                                    >
                                        Belum ada produk yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((product) => {
                                    const isSelected = selectedIds.includes(
                                        product.id,
                                    );

                                    return (
                                        <tr
                                            key={product.id}
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
                                                        onToggleSelect(
                                                            product.id,
                                                        )
                                                    }
                                                    aria-label={`Pilih produk ${product.name}`}
                                                    data-test={`select-product-${product.id}`}
                                                    className={`mt-1 ${CHECKBOX_CLASS}`}
                                                />
                                            </td>

                                            {visibleColumns.name && (
                                                <td className="max-w-[280px] min-w-[210px] px-4 py-4 align-top">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                            {product
                                                                .primary_image
                                                                ?.image_path ? (
                                                                <img
                                                                    src={
                                                                        product
                                                                            .primary_image
                                                                            .image_path
                                                                    }
                                                                    alt={
                                                                        product
                                                                            .primary_image
                                                                            .alt ??
                                                                        product.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-gray-100" />
                                                            )}
                                                        </div>
                                                        <div className="flex min-w-0 flex-col gap-0.5">
                                                            <span className="text-sm leading-snug font-medium break-words text-gray-900">
                                                                {product.name}
                                                            </span>
                                                            {product.unit_label && (
                                                                <span className="text-xs text-gray-400">
                                                                    {
                                                                        product.unit_label
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {visibleColumns.slug && (
                                                <td className="max-w-[180px] min-w-[130px] px-4 py-4 align-top text-xs break-all text-gray-500">
                                                    {product.slug}
                                                </td>
                                            )}

                                            {visibleColumns.category && (
                                                <td className="px-4 py-4 align-top text-sm whitespace-nowrap text-gray-600">
                                                    {product.category?.name ??
                                                        '-'}
                                                </td>
                                            )}

                                            {visibleColumns.store && (
                                                <td className="max-w-[180px] min-w-[130px] px-4 py-4 align-top text-sm break-words text-gray-600">
                                                    {product.store?.name ?? '-'}
                                                </td>
                                            )}

                                            {visibleColumns.price && (
                                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-extrabold tracking-tight text-[#DC2626]">
                                                            {formatRupiah(
                                                                product.price,
                                                            )}
                                                        </span>
                                                        {product.original_price &&
                                                            product.original_price >
                                                                product.price && (
                                                                <span className="text-[11px] text-gray-400 line-through">
                                                                    {formatRupiah(
                                                                        product.original_price,
                                                                    )}
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>
                                            )}

                                            {visibleColumns.stock && (
                                                <td className="px-4 py-4 align-top text-sm whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                                                            product.stock > 0
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-red-50 text-[#DC2626]'
                                                        }`}
                                                    >
                                                        {product.stock > 0
                                                            ? `${product.stock} stok`
                                                            : 'Habis'}
                                                    </span>
                                                </td>
                                            )}

                                            {visibleColumns.status && (
                                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                                                            product.is_active
                                                                ? 'border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                                                : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                    >
                                                        {product.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </span>
                                                </td>
                                            )}

                                            {visibleColumns.is_preorder && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-600">
                                                    {product.is_preorder
                                                        ? product.preorder_days
                                                            ? `Pre-order ${product.preorder_days} hari`
                                                            : 'Pre-order'
                                                        : 'Reguler'}
                                                </td>
                                            )}

                                            {visibleColumns.sold_count && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-600">
                                                    {product.sold_count.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </td>
                                            )}

                                            {visibleColumns.created_at && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-500">
                                                    {formatTimestamp(
                                                        product.created_at,
                                                    )}
                                                </td>
                                            )}

                                            {visibleColumns.updated_at && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-500">
                                                    {formatTimestamp(
                                                        product.updated_at,
                                                    )}
                                                </td>
                                            )}

                                            <td className="py-4 pr-5 pl-4 text-right align-top whitespace-nowrap">
                                                <div className="inline-flex items-center justify-end gap-2">
                                                    <Link
                                                        href={edit(product.id)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span>Ubah</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDeletingProduct(
                                                                product,
                                                            );
                                                            setIsDeleteDialogOpen(
                                                                true,
                                                            );
                                                        }}
                                                        data-test={`delete-product-${product.id}`}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#DC2626]"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span>Hapus</span>
                                                    </button>
                                                </div>
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
                                aria-label="Pilih semua produk di halaman ini"
                                className={CHECKBOX_CLASS}
                            />
                            <span>Pilih semua</span>
                        </label>

                        <Select
                            value={activeSort}
                            onValueChange={(value) =>
                                onSort(value as ProductSortField)
                            }
                        >
                            <SelectTrigger
                                aria-label="Urutkan produk"
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
                                    value="name"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Nama
                                </SelectItem>
                                <SelectItem
                                    value="price"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Harga
                                </SelectItem>
                                <SelectItem
                                    value="stock"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Stok
                                </SelectItem>
                                <SelectItem
                                    value="sold_count"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Terjual
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="px-4 py-12 text-center text-sm text-gray-500">
                            Belum ada produk yang ditemukan.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {products.data.map((product) => {
                                const isSelected = selectedIds.includes(
                                    product.id,
                                );

                                return (
                                    <div
                                        key={product.id}
                                        className={`flex flex-col gap-3 p-4 ${
                                            isSelected
                                                ? 'bg-[#F9F5FB]/60'
                                                : undefined
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        onToggleSelect(
                                                            product.id,
                                                        )
                                                    }
                                                    aria-label={`Pilih produk ${product.name}`}
                                                    className={`mt-1 ${CHECKBOX_CLASS}`}
                                                />
                                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    {product.primary_image
                                                        ?.image_path ? (
                                                        <img
                                                            src={
                                                                product
                                                                    .primary_image
                                                                    .image_path
                                                            }
                                                            alt={
                                                                product
                                                                    .primary_image
                                                                    .alt ??
                                                                product.name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gray-100" />
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    {visibleColumns.name && (
                                                        <span className="text-sm leading-snug font-medium break-words text-gray-900">
                                                            {product.name}
                                                        </span>
                                                    )}
                                                    {(visibleColumns.category ||
                                                        visibleColumns.store) && (
                                                        <span className="text-xs text-gray-500">
                                                            {[
                                                                visibleColumns.category
                                                                    ? product
                                                                          .category
                                                                          ?.name
                                                                    : null,
                                                                visibleColumns.store
                                                                    ? product
                                                                          .store
                                                                          ?.name
                                                                    : null,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' • ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {visibleColumns.status && (
                                                <span
                                                    className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                                        product.is_active
                                                            ? 'border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}
                                                >
                                                    {product.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 pl-7">
                                            <div className="flex items-baseline gap-2">
                                                {visibleColumns.price && (
                                                    <span className="text-sm font-extrabold text-[#DC2626]">
                                                        {formatRupiah(
                                                            product.price,
                                                        )}
                                                    </span>
                                                )}
                                                {visibleColumns.stock && (
                                                    <span className="text-xs text-gray-500">
                                                        •{' '}
                                                        {product.stock > 0
                                                            ? `${product.stock} stok`
                                                            : 'Stok habis'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="inline-flex items-center gap-2">
                                                <Link
                                                    href={edit(product.id)}
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span>Ubah</span>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDeletingProduct(
                                                            product,
                                                        );
                                                        setIsDeleteDialogOpen(
                                                            true,
                                                        );
                                                    }}
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-[#DC2626]"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>Hapus</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DataTablePagination
                    paginated={products}
                    itemLabel="produk"
                    onlyProps={['products', 'filters']}
                />
            </div>

            <ProductDeleteDialog
                open={isDeleteDialogOpen}
                product={deletingProduct}
                onClose={() => setIsDeleteDialogOpen(false)}
            />

            <DataTableBulkDeleteDialog
                open={isBulkDeleteOpen}
                title="Hapus Produk Terpilih"
                itemLabel="produk"
                deletableCount={selectedIds.length}
                processing={isBulkDeleting}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                confirmDataTest="confirm-bulk-delete-product-button"
            />
        </>
    );
}
