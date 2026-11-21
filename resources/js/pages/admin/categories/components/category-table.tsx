import { Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    DataTableBulkActionBar,
    DataTableBulkDeleteDialog,
    DataTableExpandableText,
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
import { bulkDestroy, edit } from '@/routes/admin/categories';
import type { SortDirection } from '@/types/data-table';
import { CATEGORY_COLUMNS } from '../types';
import type {
    CategoryColumnVisibility,
    CategoryItem,
    CategorySortField,
    ExportFormat,
    PaginatedCategories,
} from '../types';
import { CategoryDeleteDialog } from './category-delete-dialog';

type Props = {
    categories: PaginatedCategories;
    activeSort: CategorySortField;
    activeDirection: SortDirection;
    visibleColumns: CategoryColumnVisibility;
    selectedIds: number[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    onToggleSelect: (id: number) => void;
    onToggleSelectAll: (checked: boolean) => void;
    onClearSelection: () => void;
    onSort: (column: CategorySortField) => void;
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

const CHECKBOX_CLASS =
    'cursor-pointer border-gray-300 data-[state=checked]:border-[#7D3394] data-[state=checked]:bg-[#7D3394] data-[state=indeterminate]:border-[#7D3394] data-[state=indeterminate]:bg-[#7D3394]';

export function CategoryTable({
    categories,
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
    const [deletingCategory, setDeletingCategory] =
        useState<CategoryItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const selectedCategories = categories.data.filter((category) =>
        selectedIds.includes(category.id),
    );
    const deletableCount = selectedCategories.filter(
        (category) => category.products_count === 0,
    ).length;
    const blockedCount = selectedCategories.length - deletableCount;

    const totalDesktopColumns =
        CATEGORY_COLUMNS.filter((column) => visibleColumns[column.key]).length +
        2;

    const toggleExpand = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const handleConfirmBulkDelete = () => {
        if (deletableCount === 0) {
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
                    itemLabel="kategori"
                    onExport={onExportSelected}
                    onBulkDelete={() => setIsBulkDeleteOpen(true)}
                    onClearSelection={onClearSelection}
                    dataTest="category-bulk-action-bar"
                />

                {/* Tampilan Desktop & Tablet */}
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
                                        aria-label="Pilih semua kategori di halaman ini"
                                        data-test="select-all-categories"
                                        className={CHECKBOX_CLASS}
                                    />
                                </th>

                                {visibleColumns.name && (
                                    <DataTableSortHeader
                                        column="name"
                                        label="Nama Kategori"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.slug && (
                                    <DataTableSortHeader
                                        column="slug"
                                        label="Slug"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.description && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Deskripsi
                                    </th>
                                )}

                                {visibleColumns.products_count && (
                                    <DataTableSortHeader
                                        column="products_count"
                                        label="Jumlah Produk"
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
                            {categories.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={totalDesktopColumns}
                                        className="px-5 py-12 text-center text-sm text-gray-500"
                                    >
                                        Belum ada kategori yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                categories.data.map((category) => {
                                    const isSelected = selectedIds.includes(
                                        category.id,
                                    );
                                    const isExpanded = expandedIds.includes(
                                        category.id,
                                    );

                                    return (
                                        <tr
                                            key={category.id}
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
                                                            category.id,
                                                        )
                                                    }
                                                    aria-label={`Pilih kategori ${category.name}`}
                                                    data-test={`select-category-${category.id}`}
                                                    className={`mt-0.5 ${CHECKBOX_CLASS}`}
                                                />
                                            </td>

                                            {visibleColumns.name && (
                                                <td className="max-w-[240px] min-w-[160px] px-4 py-4 align-top">
                                                    <span className="text-sm leading-snug font-medium break-words text-gray-900">
                                                        {category.name}
                                                    </span>
                                                </td>
                                            )}

                                            {visibleColumns.slug && (
                                                <td className="max-w-[200px] min-w-[140px] px-4 py-4 align-top text-xs break-all text-gray-500">
                                                    {category.slug}
                                                </td>
                                            )}

                                            {visibleColumns.description && (
                                                <td className="max-w-[360px] min-w-[220px] px-4 py-4 align-top text-sm font-normal">
                                                    <DataTableExpandableText
                                                        text={
                                                            category.description
                                                        }
                                                        emptyText="Belum ada deskripsi"
                                                        isExpanded={isExpanded}
                                                        onToggle={() =>
                                                            toggleExpand(
                                                                category.id,
                                                            )
                                                        }
                                                    />
                                                </td>
                                            )}

                                            {visibleColumns.products_count && (
                                                <td className="px-4 py-4 align-top text-sm whitespace-nowrap">
                                                    <span className="inline-flex items-center rounded-md border border-[#E2C9EB] bg-[#F0E6F5] px-2.5 py-0.5 text-xs font-medium text-[#7D3394]">
                                                        {
                                                            category.products_count
                                                        }{' '}
                                                        produk
                                                    </span>
                                                </td>
                                            )}

                                            {visibleColumns.created_at && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-500">
                                                    {formatTimestamp(
                                                        category.created_at,
                                                    )}
                                                </td>
                                            )}

                                            {visibleColumns.updated_at && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-500">
                                                    {formatTimestamp(
                                                        category.updated_at,
                                                    )}
                                                </td>
                                            )}

                                            <td className="py-4 pr-5 pl-4 text-right align-top whitespace-nowrap">
                                                <div className="inline-flex items-center justify-end gap-2">
                                                    <Link
                                                        href={edit(category.id)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span>Ubah</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDeletingCategory(
                                                                category,
                                                            );
                                                            setIsDeleteDialogOpen(
                                                                true,
                                                            );
                                                        }}
                                                        data-test={`delete-category-${category.id}`}
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

                {/* Tampilan Mobile (< 768px) */}
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
                                aria-label="Pilih semua kategori di halaman ini"
                                className={CHECKBOX_CLASS}
                            />
                            <span>Pilih semua</span>
                        </label>

                        <Select
                            value={activeSort}
                            onValueChange={(value) =>
                                onSort(value as CategorySortField)
                            }
                        >
                            <SelectTrigger
                                aria-label="Urutkan kategori"
                                className="h-8 w-auto min-w-[140px] cursor-pointer rounded-lg border-gray-200 bg-white text-xs text-gray-700"
                            >
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 bg-white">
                                <SelectItem
                                    value="name"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Nama
                                </SelectItem>
                                <SelectItem
                                    value="slug"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Slug
                                </SelectItem>
                                <SelectItem
                                    value="products_count"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Jumlah Produk
                                </SelectItem>
                                <SelectItem
                                    value="created_at"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Dibuat
                                </SelectItem>
                                <SelectItem
                                    value="updated_at"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Diperbarui
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {categories.data.length === 0 ? (
                        <div className="px-4 py-12 text-center text-sm text-gray-500">
                            Belum ada kategori yang ditemukan.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {categories.data.map((category) => {
                                const isSelected = selectedIds.includes(
                                    category.id,
                                );
                                const isExpanded = expandedIds.includes(
                                    category.id,
                                );

                                return (
                                    <div
                                        key={category.id}
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
                                                            category.id,
                                                        )
                                                    }
                                                    aria-label={`Pilih kategori ${category.name}`}
                                                    className={`mt-0.5 ${CHECKBOX_CLASS}`}
                                                />
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    {visibleColumns.name && (
                                                        <span className="text-sm leading-snug font-medium break-words text-gray-900">
                                                            {category.name}
                                                        </span>
                                                    )}
                                                    {visibleColumns.slug && (
                                                        <span className="text-xs break-all text-gray-400">
                                                            {category.slug}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {visibleColumns.products_count && (
                                                <span className="inline-flex shrink-0 items-center rounded-md border border-[#E2C9EB] bg-[#F0E6F5] px-2 py-0.5 text-[11px] font-medium text-[#7D3394]">
                                                    {category.products_count}{' '}
                                                    produk
                                                </span>
                                            )}
                                        </div>

                                        {visibleColumns.description && (
                                            <div className="pl-7 text-xs font-normal">
                                                <DataTableExpandableText
                                                    text={category.description}
                                                    emptyText="Belum ada deskripsi"
                                                    isExpanded={isExpanded}
                                                    onToggle={() =>
                                                        toggleExpand(
                                                            category.id,
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}

                                        {(visibleColumns.created_at ||
                                            visibleColumns.updated_at) && (
                                            <div className="flex flex-col gap-0.5 pl-7 text-[11px] text-gray-400">
                                                {visibleColumns.created_at && (
                                                    <span>
                                                        Dibuat:{' '}
                                                        {formatTimestamp(
                                                            category.created_at,
                                                        )}
                                                    </span>
                                                )}
                                                {visibleColumns.updated_at && (
                                                    <span>
                                                        Diperbarui:{' '}
                                                        {formatTimestamp(
                                                            category.updated_at,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-2 pl-7">
                                            <Link
                                                href={edit(category.id)}
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                <span>Ubah</span>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDeletingCategory(
                                                        category,
                                                    );
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-[#DC2626]"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DataTablePagination
                    paginated={categories}
                    itemLabel="kategori"
                    onlyProps={['categories', 'filters']}
                />
            </div>

            <CategoryDeleteDialog
                open={isDeleteDialogOpen}
                category={deletingCategory}
                onClose={() => setIsDeleteDialogOpen(false)}
            />

            <DataTableBulkDeleteDialog
                open={isBulkDeleteOpen}
                title="Hapus Kategori Terpilih"
                itemLabel="kategori"
                deletableCount={deletableCount}
                blockedCount={blockedCount}
                blockedReason="masih memiliki produk terkait"
                processing={isBulkDeleting}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                confirmDataTest="confirm-bulk-delete-category-button"
            />
        </>
    );
}
