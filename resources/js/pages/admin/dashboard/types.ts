import type { AdminOrderStatus } from '@/pages/admin/orders/types';

export type DashboardPeriod = '7d' | '30d' | '12m';

export type DashboardKpis = {
    revenue: {
        current: number;
        previous: number;
        growth_percent: number | null;
        today: number;
        completed: number;
    };
    orders: {
        current: number;
        previous: number;
        growth_percent: number | null;
        completed: number;
        cancelled: number;
        cancellation_rate: number;
    };
    average_order_value: {
        current: number;
        previous: number;
        growth_percent: number | null;
    };
    customers_and_rating: {
        active_buyers: number;
        previous_buyers: number;
        growth_percent: number | null;
        total_customers: number;
        average_rating: number;
        visible_reviews: number;
    };
};

export type DashboardActionQueue = {
    pending_payment: number;
    processing: number;
    needs_attention: number;
    shipped: number;
    out_of_stock_products: number;
    low_stock_products: number;
    unreplied_reviews: number;
    low_rating_reviews: number;
};

export type SalesChartPoint = {
    key: string;
    label: string;
    full_label: string;
    revenue: number;
    orders_count: number;
};

export type SalesChartData = {
    granularity: 'day' | 'month';
    points: SalesChartPoint[];
    summary: {
        total_revenue: number;
        total_orders: number;
        peak_label: string | null;
        peak_revenue: number;
    };
};

export type OrderPipelineItem = {
    status: AdminOrderStatus;
    label: string;
    count: number;
    amount: number;
    percentage: number;
};

export type PaymentMethodBreakdown = {
    method: 'qris' | 'bank_transfer' | 'cod';
    label: string;
    count: number;
    amount: number;
    percentage: number;
};

export type RecentPurchaseActivity = {
    id: number;
    order_number: string;
    status: AdminOrderStatus;
    status_label: string;
    payment_status: string;
    event_title: string;
    customer_name: string;
    store_name: string;
    primary_item_name: string;
    other_items_count: number;
    total_quantity: number;
    total_amount: number;
    needs_attention: boolean;
    occurred_at_label: string;
    relative_time: string;
};

export type DashboardTopProduct = {
    id: number;
    name: string;
    store_name: string;
    image_url: string | null;
    sold_qty: number;
    revenue: number;
    stock: number;
};

export type DashboardLowStockProduct = {
    id: number;
    name: string;
    store_name: string;
    image_url: string | null;
    stock: number;
    price: number;
};

export type DashboardTopStore = {
    id: number;
    name: string;
    location: string;
    orders_count: number;
    revenue: number;
};

export type DashboardRecentReview = {
    id: number;
    product_name: string;
    store_name: string;
    author_name: string;
    rating: number;
    comment: string;
    has_reply: boolean;
    relative_time: string;
};

export type DashboardHighlights = {
    topProducts: DashboardTopProduct[];
    lowStockProducts: DashboardLowStockProduct[];
    topStores: DashboardTopStore[];
    recentReviews: DashboardRecentReview[];
};

export type AdminDashboardProps = {
    period: DashboardPeriod;
    periodLabel: string;
    comparisonLabel: string;
    generatedAtLabel: string;
    kpis: DashboardKpis;
    actionQueue: DashboardActionQueue;
    salesChart: SalesChartData;
    orderPipeline: OrderPipelineItem[];
    paymentMethods: PaymentMethodBreakdown[];
    recentActivities: RecentPurchaseActivity[];
    highlights: DashboardHighlights;
};
