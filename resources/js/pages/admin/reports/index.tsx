import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { dashboard } from '@/routes/admin';
import { exportMethod, index as reportsIndex } from '@/routes/admin/reports';
import { ReportFilterBar } from './components/report-filter-bar';
import { ReportKpiCards } from './components/report-kpi-cards';
import { ReportOperationsReviewsTab } from './components/report-operations-reviews-tab';
import { ReportOverviewTab } from './components/report-overview-tab';
import { ReportProductsTab } from './components/report-products-tab';
import { ReportSalesTab } from './components/report-sales-tab';
import { ReportStoresCategoriesTab } from './components/report-stores-categories-tab';
import type {
    AdminReportPageProps,
    ReportExportFormat,
    ReportExportScope,
    ReportFilters,
    ReportTab,
} from './types';

const REPORT_TABS: Array<{ id: ReportTab; label: string }> = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'sales', label: 'Penjualan & Keuangan' },
    { id: 'products', label: 'Produk & Stok' },
    { id: 'stores', label: 'Toko UMKM & Kategori' },
    { id: 'operations', label: 'Pelanggan, Pemenuhan & Ulasan' },
];

function buildQueryFromFilters(
    filters: ReportFilters,
    tab: ReportTab,
): Record<string, string | number> {
    const query: Record<string, string | number> = {
        tab,
        period_type: filters.period_type,
        compare_mode: filters.compare_mode,
        status_scope: filters.status_scope,
    };

    if (filters.period_type === 'day') {
        query.date = filters.date;
    } else if (filters.period_type === 'month') {
        query.month = filters.month;
        query.year = filters.year;
    } else if (filters.period_type === 'quarter') {
        query.quarter = filters.quarter;
        query.year = filters.year;
    } else if (filters.period_type === 'year') {
        query.year = filters.year;
    } else if (filters.period_type === 'range') {
        query.date_from = filters.date_from;
        query.date_to = filters.date_to;
    }

    if (filters.store_id !== '') {
        query.store_id = filters.store_id;
    }

    if (filters.category_id !== '') {
        query.category_id = filters.category_id;
    }

    if (filters.payment_method !== '') {
        query.payment_method = filters.payment_method;
    }

    return query;
}

export default function AdminReportsPage({
    activeTab,
    filters,
    periodMeta,
    options,
    overview,
    salesTimeline,
    products,
    storesAndCategories,
    operationsAndReviews,
}: AdminReportPageProps) {
    const [currentTab, setCurrentTab] = useState<ReportTab>(activeTab);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleApplyFilters = (nextFilters: ReportFilters) => {
        setIsLoading(true);
        router.get(
            reportsIndex.url({
                query: buildQueryFromFilters(nextFilters, currentTab),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleResetFilters = () => {
        setIsLoading(true);
        router.get(
            reportsIndex.url({ query: { tab: currentTab } }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleExport = (
        format: ReportExportFormat,
        scope: ReportExportScope,
    ) => {
        setIsExporting(true);

        const payload: Record<string, string | number | null> = {
            format,
            scope,
            period_type: filters.period_type,
            compare_mode: filters.compare_mode,
            date: filters.date,
            month: filters.month,
            quarter: filters.quarter,
            year: filters.year,
            date_from: filters.date_from,
            date_to: filters.date_to,
            store_id: filters.store_id !== '' ? Number(filters.store_id) : null,
            category_id:
                filters.category_id !== '' ? Number(filters.category_id) : null,
            payment_method:
                filters.payment_method !== '' ? filters.payment_method : null,
            status_scope: filters.status_scope,
        };

        router.post(exportMethod.url(), payload, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsExporting(false),
        });
    };

    return (
        <>
            <Head title="Laporan Operasional" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Laporan Operasional
                    </h1>
                    <p className="text-sm text-gray-500">
                        Periode{' '}
                        <strong className="font-semibold text-gray-800">
                            {periodMeta.period_label}
                        </strong>{' '}
                        • {periodMeta.active_filter_summary} • Diperbarui{' '}
                        {periodMeta.generated_at_label} WIB.
                    </p>
                </div>

                <ReportFilterBar
                    activeTab={currentTab}
                    filters={filters}
                    options={options}
                    isLoading={isLoading}
                    isExporting={isExporting}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                    onExport={handleExport}
                />

                <ReportKpiCards
                    kpis={overview.kpis}
                    comparisonLabel={periodMeta.comparison_label}
                />

                <div
                    role="tablist"
                    aria-label="Bagian laporan operasional"
                    className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 pb-px"
                >
                    {REPORT_TABS.map((tab) => {
                        const isActive = currentTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setCurrentTab(tab.id)}
                                className={`shrink-0 cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                                    isActive
                                        ? 'border-[#7D3394] text-[#7D3394]'
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {currentTab === 'overview' && (
                    <ReportOverviewTab
                        periodLabel={periodMeta.period_label}
                        financial={overview.financial}
                        salesTrend={overview.salesTrend}
                        orderStatusBreakdown={overview.orderStatusBreakdown}
                        paymentMethods={overview.paymentMethods}
                        shippingMethods={overview.shippingMethods}
                    />
                )}

                {currentTab === 'sales' && (
                    <ReportSalesTab
                        rows={salesTimeline.rows}
                        totals={salesTimeline.totals}
                        periodLabel={periodMeta.period_label}
                    />
                )}

                {currentTab === 'products' && (
                    <ReportProductsTab products={products} />
                )}

                {currentTab === 'stores' && (
                    <ReportStoresCategoriesTab data={storesAndCategories} />
                )}

                {currentTab === 'operations' && (
                    <ReportOperationsReviewsTab data={operationsAndReviews} />
                )}
            </div>
        </>
    );
}

AdminReportsPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Laporan',
            href: reportsIndex(),
        },
    ],
};
