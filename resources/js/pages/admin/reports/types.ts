export type ReportTab =
    | 'overview'
    | 'sales'
    | 'products'
    | 'stores'
    | 'operations';

export type ReportPeriodType = 'day' | 'month' | 'quarter' | 'year' | 'range';

export type ReportCompareMode = 'previous' | 'yoy';

export type ReportStatusScope = 'valid' | 'completed' | 'all';

export type ReportExportFormat = 'pdf' | 'xlsx' | 'csv';

export type ReportExportScope =
    | 'all'
    | 'sales'
    | 'products'
    | 'stores'
    | 'operations';

export type ReportFilters = {
    period_type: ReportPeriodType;
    compare_mode: ReportCompareMode;
    date: string;
    month: number;
    quarter: number;
    year: number;
    date_from: string;
    date_to: string;
    store_id: string;
    category_id: string;
    payment_method: string;
    status_scope: ReportStatusScope;
};

export type ReportPeriodMeta = {
    period_label: string;
    comparison_label: string;
    granularity: 'hour' | 'day' | 'month';
    generated_at_label: string;
    active_filter_summary: string;
};

export type ReportFilterOptions = {
    stores: Array<{ id: number; name: string }>;
    categories: Array<{ id: number; name: string }>;
    years: number[];
    months: Array<{ value: number; label: string }>;
    quarters: Array<{ value: number; label: string }>;
    paymentMethods: Array<{ value: string; label: string }>;
    statusScopes: Array<{ value: ReportStatusScope; label: string }>;
};

export type GrowthMetric = {
    current: number;
    previous: number;
    growth_percent: number | null;
};

export type ReportKpis = {
    gross_sales: GrowthMetric;
    net_revenue: GrowthMetric;
    orders: GrowthMetric & {
        all_count: number;
        completed_count: number;
        cancelled_count: number;
        cancellation_rate: number;
    };
    average_order_value: GrowthMetric;
    completion_rate: {
        current: number;
        previous: number;
        delta_points: number;
    };
    active_buyers: GrowthMetric;
};

export type ReportFinancialBreakdown = {
    subtotal: number;
    discount_amount: number;
    shipping_fee: number;
    service_fee: number;
    total_amount: number;
    net_revenue: number;
    completed_amount: number;
    pending_amount: number;
    cancelled_amount: number;
    cancelled_orders_count: number;
};

export type ReportTrendPoint = {
    key: string;
    label: string;
    full_label: string;
    revenue: number;
    net_revenue: number;
    orders_count: number;
};

export type ReportSalesTrend = {
    granularity: 'hour' | 'day' | 'month';
    points: ReportTrendPoint[];
    summary: {
        total_revenue: number;
        total_orders: number;
        peak_label: string | null;
        peak_revenue: number;
    };
};

export type ReportOrderStatusItem = {
    status: string;
    label: string;
    count: number;
    amount: number;
    percentage: number;
};

export type ReportPaymentMethodItem = {
    method: string;
    label: string;
    count: number;
    amount: number;
    percentage: number;
};

export type ReportShippingMethodItem = {
    label: string;
    count: number;
    shipping_fee: number;
    percentage: number;
};

export type ReportSalesTimelineRow = {
    key: string;
    label: string;
    full_label: string;
    all_orders_count: number;
    orders_count: number;
    completed_count: number;
    cancelled_count: number;
    subtotal: number;
    discount_amount: number;
    shipping_fee: number;
    service_fee: number;
    net_revenue: number;
    total_amount: number;
};

export type ReportSalesTimelineTotals = {
    all_orders_count: number;
    orders_count: number;
    completed_count: number;
    cancelled_count: number;
    subtotal: number;
    discount_amount: number;
    shipping_fee: number;
    service_fee: number;
    net_revenue: number;
    total_amount: number;
};

export type ReportTopProduct = {
    id: number;
    name: string;
    slug: string;
    category_name: string;
    store_name: string;
    sold_qty: number;
    orders_count: number;
    revenue: number;
    revenue_share: number;
    stock: number;
    is_preorder: boolean;
    preorder_days: number | null;
    rating_avg: number;
};

export type ReportCatalogProduct = {
    id: number;
    name: string;
    slug: string;
    category_name: string;
    store_name: string;
    price: number;
    stock: number;
    is_preorder: boolean;
    preorder_days: number | null;
};

export type ReportProductsData = {
    summary: {
        total_products: number;
        active_products: number;
        sold_products_count: number;
        zero_sales_count: number;
        low_stock_count: number;
        out_of_stock_count: number;
        preorder_count: number;
        total_units_sold: number;
    };
    topProducts: ReportTopProduct[];
    zeroSalesProducts: ReportCatalogProduct[];
    lowStockProducts: ReportCatalogProduct[];
};

export type ReportStorePerformance = {
    id: number;
    name: string;
    location: string;
    orders_count: number;
    completed_count: number;
    cancelled_count: number;
    completion_rate: number;
    items_sold: number;
    revenue: number;
    average_order_value: number;
    active_products_count: number;
};

export type ReportInactiveStore = {
    id: number;
    name: string;
    location: string;
    active_products_count: number;
};

export type ReportCategoryPerformance = {
    id: number;
    name: string;
    products_count: number;
    orders_count: number;
    items_sold: number;
    revenue: number;
    revenue_share: number;
};

export type ReportStoresAndCategoriesData = {
    summary: {
        total_stores: number;
        active_transacting_stores: number;
        inactive_stores_count: number;
        total_categories: number;
    };
    stores: ReportStorePerformance[];
    inactiveStores: ReportInactiveStore[];
    categories: ReportCategoryPerformance[];
};

export type ReportTopBuyer = {
    id: string;
    name: string;
    email: string;
    orders_count: number;
    total_spent: number;
    is_returning: boolean;
    last_order_at_label: string;
};

export type ReportOperationsAndReviewsData = {
    customers: {
        total_buyers: number;
        new_buyers: number;
        returning_buyers: number;
        repeat_rate: number;
        top_buyers: ReportTopBuyer[];
    };
    fulfillment: {
        avg_hours_to_ship: number | null;
        avg_hours_to_complete: number | null;
        shipped_sample_count: number;
        completed_sample_count: number;
        cancellation_reasons: Array<{
            reason: string;
            count: number;
            amount: number;
        }>;
    };
    reviews: {
        total_reviews: number;
        visible_reviews: number;
        hidden_reviews: number;
        replied_reviews: number;
        reply_rate: number;
        average_rating: number;
        distribution: Array<{
            rating: number;
            count: number;
            percentage: number;
        }>;
    };
};

export type AdminReportPageProps = {
    activeTab: ReportTab;
    filters: ReportFilters;
    periodMeta: ReportPeriodMeta;
    options: ReportFilterOptions;
    overview: {
        kpis: ReportKpis;
        financial: ReportFinancialBreakdown;
        salesTrend: ReportSalesTrend;
        orderStatusBreakdown: ReportOrderStatusItem[];
        paymentMethods: ReportPaymentMethodItem[];
        shippingMethods: ReportShippingMethodItem[];
    };
    salesTimeline: {
        rows: ReportSalesTimelineRow[];
        totals: ReportSalesTimelineTotals;
    };
    products: ReportProductsData;
    storesAndCategories: ReportStoresAndCategoriesData;
    operationsAndReviews: ReportOperationsAndReviewsData;
};
