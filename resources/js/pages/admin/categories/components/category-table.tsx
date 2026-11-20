import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { edit } from '@/routes/admin/categories';
import { CATEGORY_COLUMN_ORDER } from '../types';
import type {
    CategoryColumnVisibility,
    CategoryFilters,
    CategoryItem,
    CategorySortField,
    ExportFormat,
    PaginatedCategories,
} from '../types';
import { CategoryBulkActionBar } from './category-bulk-action-bar';
import { CategoryBulkDeleteDialog } from './category-bulk-delete-dialog';
import { CategoryDeleteDialog } from './category-delete-dialog';

type Props = {
    categories: PaginatedCategories;
    filters: CategoryFilters;
    visibleColumns: CategoryColumnVisibility;
    selectedIds: number[];
    onToggleSelect: (id: number) => void;
    onToggleSelectAll: (checked: boolean) => void;
    onClearSelection: () => void;
    onSort: (column: CategorySortField) => void;
    onExportSelected: (format: ExportFormat) => void;
};

const LONG_DESCRIPTION_THRESHOLD = 90;

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

function SortIcon({
    column,
    activeSort,
    activeDirection,
}: {
    column: CategorySortField;
    activeSort: CategorySortField;
    activeDirection: 'asc' | 'desc';
}) {
    if (activeSort !== column) {
        return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />;
    }

    if (activeDirection === 'desc') {
        return <ArrowDown className="h-3.5 w-3.5 shrink-0 text-[#7D3394]" />;
    }

    return <ArrowUp className="h-3.5 w-3.5 shrink-0 text-[#7D3394]" />;
}

function ExpandableDescription({
    description,
    isExpanded,
    onToggle,
}: {
    description: string | null;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    if (!description || description.trim() === '') {
        return <span className="text-gray-400">Belum ada deskripsi</span>;
    }

    const isLong =
        description.length > LONG_DESCRIPTION_THRESHOLD ||
        description.includes('\n');

    return (
        <div className="flex flex-col items-start gap-1">
            <p
                className={`leading-relaxed break-words whitespace-pre-line text-gray-600 ${
                    isLong && !isExpanded ? 'line-clamp-2' : ''
                }`}
            >
                {description}
            </p>
            {isLong && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="cursor-pointer text-xs font-medium text-[#7D3394]"
                >
                    {isExpanded ? 'Ringkas' : 'Selengkapnya'}
                </button>
            )}
        </div>
    );
}

export function CategoryTable({
    categories,
    filters,
    visibleColumns,
    selectedIds,
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
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const activeSort: CategorySortField = filters.sort ?? 'name';
    const activeDirection: 'asc' | 'desc' =
        filters.direction === 'desc' ? 'desc' : 'asc';

    const pageIds = categories.data.map((category) => category.id);
    const selectedOnPageCount = pageIds.filter((id) =>
        selectedIds.includes(id),
    ).length;
    const isAllSelected =
        pageIds.length > 0 && selectedOnPageCount === pageIds.length;
    const isPartiallySelected =
        selectedOnPageCount > 0 && selectedOnPageCount < pageIds.length;

    const selectedCategories = categories.data.filter((category) =>
        selectedIds.includes(category.id),
    );

    const visibleDataColumnCount = CATEGORY_COLUMN_ORDER.filter(
        (key) => visibleColumns[key],
    ).length;
    const totalDesktopColumns = visibleDataColumnCount + 2;

    const toggleExpand = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const getAriaSort = (
        column: CategorySortField,
    ): 'ascending' | 'descending' | 'none' => {
        if (activeSort !== column) {
            return 'none';
        }

        return activeDirection === 'desc' ? 'descending' : 'ascending';
    };

    const formatPaginationLabel = (label: string): string => {
        if (label.includes('Previous')) {
            return 'Sebelumnya';
        }
        if (label.includes('Next')) {
            return 'Berikutnya';
        }

        return label;
    };

    const checkboxClassName =
        'cursor-pointer border-gray-300 data-[state=checked]:border-[#7D3394] data-[state=checked]:bg-[#7D3394] data-[state=indeterminate]:border-[#7D3394] data-[state=indeterminate]:bg-[#7D3394]';

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
                <CategoryBulkActionBar
                    selectedCount={selectedIds.length}
                    onExport={onExportSelected}
                    onBulkDelete={() => setIsBulkDeleteOpen(true)}
                    onClearSelection={onClearSelection}
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
                                        className={checkboxClassName}
                                    />
                                </th>

                                {visibleColumns.name && (
                                    <th
                                        aria-sort={getAriaSort('name')}
                                        className="px-4 py-3.5 text-xs font-semibold text-gray-600"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onSort('name')}
                                            className={`inline-flex cursor-pointer items-center gap-1.5 ${
                                                activeSort === 'name'
                                                    ? 'text-[#7D3394]'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            <span>Nama Kategori</span>
                                            <SortIcon
                                                column="name"
                                                activeSort={activeSort}
                                                activeDirection={
                                                    activeDirection
                                                }
                                            />
                                        </button>
                                    </th>
                                )}

                                {visibleColumns.slug && (
                                    <th
                                        aria-sort={getAriaSort('slug')}
                                        className="px-4 py-3.5 text-xs font-semibold text-gray-600"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onSort('slug')}
                                            className={`inline-flex cursor-pointer items-center gap-1.5 ${
                                                activeSort === 'slug'
                                                    ? 'text-[#7D3394]'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            <span>Slug</span>
                                            <SortIcon
                                                column="slug"
                                                activeSort={activeSort}
                                                activeDirection={
                                                    activeDirection
                                                }
                                            />
                                        </button>
                                    </th>
                                )}

                                {visibleColumns.description && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Deskripsi
                                    </th>
                                )}

                                {visibleColumns.products_count && (
                                    <th
                                        aria-sort={getAriaSort(
                                            'products_count',
                                        )}
                                        className="px-4 py-3.5 text-xs font-semibold text-gray-600"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSort('products_count')
                                            }
                                            className={`inline-flex cursor-pointer items-center gap-1.5 ${
                                                activeSort === 'products_count'
                                                    ? 'text-[#7D3394]'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            <span>Jumlah Produk</span>
                                            <SortIcon
                                                column="products_count"
                                                activeSort={activeSort}
                                                activeDirection={
                                                    activeDirection
                                                }
                                            />
                                        </button>
                                    </th>
                                )}

                                {visibleColumns.created_at && (
                                    <th
                                        aria-sort={getAriaSort('created_at')}
                                        className="px-4 py-3.5 text-xs font-semibold text-gray-600"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onSort('created_at')}
                                            className={`inline-flex cursor-pointer items-center gap-1.5 ${
                                                activeSort === 'created_at'
                                                    ? 'text-[#7D3394]'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            <span>Dibuat</span>
                                            <SortIcon
                                                column="created_at"
                                                activeSort={activeSort}
                                                activeDirection={
                                                    activeDirection
                                                }
                                            />
                                        </button>
                                    </th>
                                )}

                                {visibleColumns.updated_at && (
                                    <th
                                        aria-sort={getAriaSort('updated_at')}
                                        className="px-4 py-3.5 text-xs font-semibold text-gray-600"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onSort('updated_at')}
                                            className={`inline-flex cursor-pointer items-center gap-1.5 ${
                                                activeSort === 'updated_at'
                                                    ? 'text-[#7D3394]'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            <span>Diperbarui</span>
                                            <SortIcon
                                                column="updated_at"
                                                activeSort={activeSort}
                                                activeDirection={
                                                    activeDirection
                                                }
                                            />
                                        </button>
                                    </th>
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
                                                    className={`mt-0.5 ${checkboxClassName}`}
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
                                                    <ExpandableDescription
                                                        description={
                                                            category.description
                                                        }
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
                                className={checkboxClassName}
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
                                                    className={`mt-0.5 ${checkboxClassName}`}
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
                                                <ExpandableDescription
                                                    description={
                                                        category.description
                                                    }
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

                {/* Footer Info & Paginasi */}
                {categories.total > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <span className="text-xs text-gray-500">
                            Menampilkan {categories.from ?? 0}–
                            {categories.to ?? 0} dari {categories.total}{' '}
                            kategori
                        </span>

                        {categories.last_page > 1 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {categories.links.map((link, idx) => {
                                    const label = formatPaginationLabel(
                                        link.label,
                                    );

                                    if (link.url === null) {
                                        return (
                                            <span
                                                key={idx}
                                                className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-400"
                                            >
                                                {label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                            only={['categories', 'filters']}
                                            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                                link.active
                                                    ? 'bg-[#7D3394] text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CategoryDeleteDialog
                open={isDeleteDialogOpen}
                category={deletingCategory}
                onClose={() => setIsDeleteDialogOpen(false)}
            />

            <CategoryBulkDeleteDialog
                open={isBulkDeleteOpen}
                selectedCategories={selectedCategories}
                onClose={() => setIsBulkDeleteOpen(false)}
                onDeleted={onClearSelection}
            />
        </>
    );
}
