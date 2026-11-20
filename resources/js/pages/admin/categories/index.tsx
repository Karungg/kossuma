import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { dashboard } from '@/routes';
import { exportMethod, index } from '@/routes/admin/categories';
import { CategoryIndexToolbar } from './components/category-index-toolbar';
import { CategoryStatCards } from './components/category-stat-cards';
import { CategoryTable } from './components/category-table';
import {
    CATEGORY_COLUMN_ORDER,
    DEFAULT_CATEGORY_COLUMN_VISIBILITY,
} from './types';
import type {
    CategoryColumnKey,
    CategoryColumnVisibility,
    CategoryFilters,
    CategorySortField,
    CategoryStats,
    ExportFormat,
    PaginatedCategories,
} from './types';

type Props = {
    categories: PaginatedCategories;
    stats: CategoryStats;
    filters: CategoryFilters | [];
};

export default function CategoriesIndex({ categories, stats, filters }: Props) {
    const safeFilters: CategoryFilters = Array.isArray(filters) ? {} : filters;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [visibleColumns, setVisibleColumns] =
        useState<CategoryColumnVisibility>({
            ...DEFAULT_CATEGORY_COLUMN_VISIBILITY,
        });

    const currentPageIds = categories.data.map((category) => category.id);
    const activeSelectedIds = selectedIds.filter((id) =>
        currentPageIds.includes(id),
    );

    const activeColumnKeys = CATEGORY_COLUMN_ORDER.filter(
        (key) => visibleColumns[key],
    );

    const applyQuery = (overrides: Partial<CategoryFilters>) => {
        const merged: CategoryFilters = {
            ...safeFilters,
            ...overrides,
        };

        router.get(
            index.url({
                query: {
                    search: merged.search || undefined,
                    product_status: merged.product_status || undefined,
                    description_status: merged.description_status || undefined,
                    sort: merged.sort || undefined,
                    direction: merged.direction || undefined,
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['categories', 'filters'],
            },
        );
    };

    const handleResetFilters = () => {
        applyQuery({
            product_status: null,
            description_status: null,
        });
    };

    const handleSort = (column: CategorySortField) => {
        const currentSort = safeFilters.sort ?? 'name';
        const currentDirection =
            safeFilters.direction === 'desc' ? 'desc' : 'asc';
        const nextDirection =
            currentSort === column && currentDirection === 'asc'
                ? 'desc'
                : 'asc';

        applyQuery({
            sort: column,
            direction: nextDirection,
        });
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const handleToggleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? currentPageIds : []);
    };

    const handleToggleColumn = (column: CategoryColumnKey) => {
        setVisibleColumns((prev) => {
            const nextValue = !prev[column];
            const remainingVisible = CATEGORY_COLUMN_ORDER.filter((key) =>
                key === column ? nextValue : prev[key],
            ).length;

            if (remainingVisible === 0) {
                return prev;
            }

            return {
                ...prev,
                [column]: nextValue,
            };
        });
    };

    const handleResetColumns = () => {
        setVisibleColumns({ ...DEFAULT_CATEGORY_COLUMN_VISIBILITY });
    };

    const handleExport = (format: ExportFormat, ids: number[] = []) => {
        const url = exportMethod.url({
            query: {
                format,
                ids: ids.length > 0 ? ids : undefined,
                columns: activeColumnKeys,
                search: safeFilters.search || undefined,
                product_status: safeFilters.product_status || undefined,
                description_status: safeFilters.description_status || undefined,
                sort: safeFilters.sort || undefined,
                direction: safeFilters.direction || undefined,
            },
        });

        window.location.assign(url);
    };

    return (
        <>
            <Head title="Kelola Kategori" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Kelola Kategori
                    </h1>
                    <p className="text-sm text-gray-500">
                        Atur daftar kategori produk UMKM yang tampil di beranda
                        dan katalog Kossuma.
                    </p>
                </div>

                <CategoryStatCards stats={stats} />

                <CategoryIndexToolbar
                    filters={safeFilters}
                    visibleColumns={visibleColumns}
                    onToggleColumn={handleToggleColumn}
                    onResetColumns={handleResetColumns}
                    onExportAll={(format) => handleExport(format)}
                    onApplyQuery={applyQuery}
                    onResetFilters={handleResetFilters}
                />

                <CategoryTable
                    categories={categories}
                    filters={safeFilters}
                    visibleColumns={visibleColumns}
                    selectedIds={activeSelectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    onClearSelection={() => setSelectedIds([])}
                    onSort={handleSort}
                    onExportSelected={(format) =>
                        handleExport(format, activeSelectedIds)
                    }
                />
            </div>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Kategori',
            href: index(),
        },
    ],
};
