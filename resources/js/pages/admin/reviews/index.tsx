import { Head, router } from '@inertiajs/react';
import { useDataTable } from '@/hooks/use-data-table';
import { dashboard } from '@/routes/admin';
import { exportMethod, index } from '@/routes/admin/reviews';
import { ReviewIndexToolbar } from './components/review-index-toolbar';
import { ReviewStatCards } from './components/review-stat-cards';
import { ReviewTable } from './components/review-table';
import { REVIEW_COLUMNS } from './types';
import type {
    AdminReviewFilterOptions,
    AdminReviewFilters,
    AdminReviewStats,
    PaginatedAdminReviews,
    ReviewColumnKey,
    ReviewSortField,
} from './types';

type Props = {
    reviews: PaginatedAdminReviews;
    stats: AdminReviewStats;
    options: AdminReviewFilterOptions;
    filters: AdminReviewFilters | [];
};

export default function AdminReviewsIndex({
    reviews,
    stats,
    options,
    filters,
}: Props) {
    const safeFilters: AdminReviewFilters = Array.isArray(filters)
        ? {}
        : filters;

    const table = useDataTable<
        number,
        ReviewColumnKey,
        ReviewSortField,
        AdminReviewFilters
    >({
        itemIds: reviews.data.map((review) => review.id),
        filters: safeFilters,
        columns: REVIEW_COLUMNS,
        defaultSort: 'created_at',
        defaultDirection: 'desc',
        onlyProps: ['reviews', 'filters'],
        buildIndexUrl: (query) => index.url({ query }),
        onExport: ({ format, ids, columns, filters: activeFilters }) => {
            router.post(
                exportMethod.url(),
                {
                    format,
                    ids,
                    columns,
                    search: activeFilters.search,
                    product_id: activeFilters.product_id,
                    store_id: activeFilters.store_id,
                    rating: activeFilters.rating,
                    visibility: activeFilters.visibility,
                    reply_status: activeFilters.reply_status,
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

    const handleResetFilters = () => {
        table.applyQuery({
            product_id: null,
            store_id: null,
            rating: null,
            visibility: null,
            reply_status: null,
            date_from: null,
            date_to: null,
        });
    };

    return (
        <>
            <Head title="Kelola Ulasan" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Kelola Ulasan Produk
                    </h1>
                    <p className="text-sm text-gray-500">
                        Pantau ulasan pembeli di setiap produk, berikan balasan
                        resmi Kossuma, dan sembunyikan ulasan yang melanggar
                        aturan tanpa mengubah isi komentar asli pembeli.
                    </p>
                </div>

                <ReviewStatCards
                    stats={stats}
                    onFilterLowRating={() =>
                        table.applyQuery({
                            rating: safeFilters.rating === 'low' ? null : 'low',
                        })
                    }
                    onFilterHidden={() =>
                        table.applyQuery({
                            visibility:
                                safeFilters.visibility === 'hidden'
                                    ? null
                                    : 'hidden',
                        })
                    }
                />

                <ReviewIndexToolbar
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

                <ReviewTable
                    reviews={reviews}
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

AdminReviewsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Ulasan',
            href: index(),
        },
    ],
};
