import { Link, router } from '@inertiajs/react';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { edit, index } from '@/routes/admin/categories';
import type {
    CategoryFilters,
    CategoryItem,
    PaginatedCategories,
} from '../types';
import { CategoryDeleteDialog } from './category-delete-dialog';

type Props = {
    categories: PaginatedCategories;
    filters: CategoryFilters;
};

export function CategoryTable({ categories, filters }: Props) {
    const [deletingCategory, setDeletingCategory] =
        useState<CategoryItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleSort = (column: 'name' | 'products_count') => {
        const nextDirection =
            filters.sort === column && filters.direction === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            index.url({
                query: {
                    search: filters.search ?? undefined,
                    sort: column,
                    direction: nextDirection,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
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

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('name')}
                                        className="inline-flex cursor-pointer items-center gap-1.5"
                                    >
                                        <span>Nama Kategori</span>
                                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                                    </button>
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600">
                                    Slug
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600">
                                    Deskripsi
                                </th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-600">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSort('products_count')
                                        }
                                        className="inline-flex cursor-pointer items-center gap-1.5"
                                    >
                                        <span>Jumlah Produk</span>
                                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                                    </button>
                                </th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-600">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {categories.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-12 text-center text-sm text-gray-500"
                                    >
                                        Belum ada kategori yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                categories.data.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-5 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                            {category.name}
                                        </td>
                                        <td className="px-5 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {category.slug}
                                        </td>
                                        <td className="max-w-sm px-5 py-4 text-sm text-gray-600">
                                            <span className="line-clamp-2">
                                                {category.description ?? '-'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm whitespace-nowrap">
                                            <span className="inline-flex items-center rounded-md border border-[#E2C9EB] bg-[#F0E6F5] px-2.5 py-0.5 text-xs font-medium text-[#7D3394]">
                                                {category.products_count} produk
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {categories.last_page > 1 && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs text-gray-500">
                            Menampilkan {categories.from ?? 0}–
                            {categories.to ?? 0} dari {categories.total}{' '}
                            kategori
                        </span>

                        <div className="flex flex-wrap items-center gap-1.5">
                            {categories.links.map((link, idx) => {
                                const label = formatPaginationLabel(link.label);

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
                    </div>
                )}
            </div>

            <CategoryDeleteDialog
                open={isDeleteDialogOpen}
                category={deletingCategory}
                onClose={() => setIsDeleteDialogOpen(false)}
            />
        </>
    );
}
