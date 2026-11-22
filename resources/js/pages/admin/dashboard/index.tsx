import { Head, router } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { dashboard } from '@/routes/admin';
import { DashboardStatCards } from './components/dashboard-stat-cards';
import { OperationalActionBar } from './components/operational-action-bar';
import { OperationalHighlightsCard } from './components/operational-highlights-card';
import { OrderPipelineCard } from './components/order-pipeline-card';
import { RecentPurchaseActivitiesCard } from './components/recent-purchase-activities-card';
import { SalesTrendChart } from './components/sales-trend-chart';
import type { AdminDashboardProps, DashboardPeriod } from './types';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '12m', label: '12 Bulan' },
];

export default function AdminDashboard({
    period,
    periodLabel,
    comparisonLabel,
    generatedAtLabel,
    kpis,
    actionQueue,
    salesChart,
    orderPipeline,
    paymentMethods,
    recentActivities,
    highlights,
}: AdminDashboardProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handlePeriodChange = (nextPeriod: DashboardPeriod) => {
        if (nextPeriod === period) {
            return;
        }

        router.get(
            dashboard.url({ query: { period: nextPeriod } }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    return (
        <>
            <Head title="Dashboard Operasional" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                            Dashboard Operasional
                        </h1>
                        <p className="text-sm text-gray-500">
                            Pantau penjualan, status pesanan, stok produk UMKM,
                            dan ulasan pelanggan dalam satu tempat. Diperbarui{' '}
                            {generatedAtLabel} WIB.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            role="tablist"
                            aria-label="Filter rentang waktu dashboard"
                            className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-2xs"
                        >
                            {PERIOD_OPTIONS.map((option) => {
                                const isActive = period === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() =>
                                            handlePeriodChange(option.value)
                                        }
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium ${
                                            isActive
                                                ? 'bg-[#7D3394] text-white'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            aria-label="Muat ulang data dashboard"
                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-2xs disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                            />
                            Muat Ulang
                        </button>
                    </div>
                </div>

                <DashboardStatCards
                    kpis={kpis}
                    comparisonLabel={comparisonLabel}
                />

                <OperationalActionBar actionQueue={actionQueue} />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <SalesTrendChart
                            chart={salesChart}
                            periodLabel={periodLabel}
                        />
                    </div>
                    <div className="lg:col-span-4">
                        <OrderPipelineCard
                            pipeline={orderPipeline}
                            paymentMethods={paymentMethods}
                            periodLabel={periodLabel}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <RecentPurchaseActivitiesCard
                            activities={recentActivities}
                        />
                    </div>
                    <div className="lg:col-span-5">
                        <OperationalHighlightsCard highlights={highlights} />
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
