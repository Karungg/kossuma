import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useDataTable } from '@/hooks/use-data-table';
import { dashboard } from '@/routes';
import { exportMethod, index } from '@/routes/admin/products';
import { ProductImportDialog } from './components/product-import-dialog';
import { ProductIndexToolbar } from './components/product-index-toolbar';
import { ProductStatCards } from './components/product-stat-cards';
import { ProductTable } from './components/product-table';
import { PRODUCT_COLUMNS } from './types';
import type {
    PaginatedProducts,
    ProductColumnKey,
    ProductFilters,
    ProductFormOptions,
    ProductSortField,
    ProductStats,
} from './types';

type Props = {
    products: PaginatedProducts;
    stats: ProductStats;
    options: ProductFormOptions;
    filters: ProductFilters | [];
};

export default function ProductsIndex({
    products,
    stats,
    options,
    filters,
}: Props) {
    const safeFilters: ProductFilters = Array.isArray(filters) ? {} : filters;
    const [isImportOpen, setIsImportOpen] = useState(false);

    const table = useDataTable<
        number,
        ProductColumnKey,
        ProductSortField,
        ProductFilters
    >({
        itemIds: products.data.map((product) => product.id),
        filters: safeFilters,
        columns: PRODUCT_COLUMNS,
        defaultSort: 'created_at',
        defaultDirection: 'desc',
        onlyProps: ['products', 'filters'],
        buildIndexUrl: (query) => index.url({ query }),
        onExport: ({ format, ids, columns, filters: activeFilters }) => {
            router.post(
                exportMethod.url(),
                {
                    format,
                    ids,
                    columns,
                    search: activeFilters.search,
                    category_id: activeFilters.category_id,
                    store_id: activeFilters.store_id,
                    status: activeFilters.status,
                    stock_status: activeFilters.stock_status,
                    preorder_status: activeFilters.preorder_status,
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
            category_id: null,
            store_id: null,
            status: null,
            stock_status: null,
            preorder_status: null,
        });
    };

    return (
        <>
            <Head title="Kelola Produk" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Kelola Produk
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola katalog produk UMKM, foto, stok, harga, ekspor,
                        dan impor massal Kossuma.
                    </p>
                </div>

                <ProductStatCards stats={stats} />

                <ProductIndexToolbar
                    filters={safeFilters}
                    options={options}
                    visibleColumns={table.visibleColumns}
                    isCustomColumns={table.isCustomColumns}
                    onToggleColumn={table.toggleColumn}
                    onResetColumns={table.resetColumns}
                    onExportAll={(format) => table.triggerExport(format)}
                    onOpenImport={() => setIsImportOpen(true)}
                    onApplyQuery={table.applyQuery}
                    onResetFilters={handleResetFilters}
                />

                <ProductTable
                    products={products}
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

            <ProductImportDialog
                open={isImportOpen}
                onClose={() => setIsImportOpen(false)}
            />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Produk',
            href: index(),
        },
    ],
};
