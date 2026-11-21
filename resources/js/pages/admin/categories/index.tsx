import { Head, router } from '@inertiajs/react';
import { useDataTable } from '@/hooks/use-data-table';
import { dashboard } from '@/routes';
import { exportMethod, index } from '@/routes/admin/categories';
import { CategoryIndexToolbar } from './components/category-index-toolbar';
import { CategoryStatCards } from './components/category-stat-cards';
import { CategoryTable } from './components/category-table';
import { CATEGORY_COLUMNS } from './types';
import type {
    CategoryColumnKey,
    CategoryFilters,
    CategorySortField,
    CategoryStats,
    PaginatedCategories,
} from './types';

type Props = {
    categories: PaginatedCategories;
    stats: CategoryStats;
    filters: CategoryFilters | [];
};

export default function CategoriesIndex({ categories, stats, filters }: Props) {
    const safeFilters: CategoryFilters = Array.isArray(filters) ? {} : filters;

    const table = useDataTable<
        number,
        CategoryColumnKey,
        CategorySortField,
        CategoryFilters
    >({
        itemIds: categories.data.map((category) => category.id),
        filters: safeFilters,
        columns: CATEGORY_COLUMNS,
        defaultSort: 'name',
        defaultDirection: 'asc',
        onlyProps: ['categories', 'filters'],
        buildIndexUrl: (query) => index.url({ query }),
        onExport: ({ format, ids, columns, filters: activeFilters }) => {
            router.post(
                exportMethod.url(),
                {
                    format,
                    ids,
                    columns,
                    search: activeFilters.search,
                    product_status: activeFilters.product_status,
                    description_status: activeFilters.description_status,
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

    const handleResetFilters = () => {
        table.applyQuery({
            product_status: null,
            description_status: null,
        });
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
                    visibleColumns={table.visibleColumns}
                    isCustomColumns={table.isCustomColumns}
                    onToggleColumn={table.toggleColumn}
                    onResetColumns={table.resetColumns}
                    onExportAll={(format) => table.triggerExport(format)}
                    onApplyQuery={table.applyQuery}
                    onResetFilters={handleResetFilters}
                />

                <CategoryTable
                    categories={categories}
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
