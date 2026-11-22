import type {
    DataTableColumnDef,
    ExportFormat,
    PaginatedData,
    SortDirection,
} from '@/types/data-table';

export type { ExportFormat, SortDirection };

export type AdminOrderStatus =
    | 'pending_payment'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled';

export type AdminOrderStatusFilter = 'all' | AdminOrderStatus;
export type PaymentStatusFilter = 'unpaid' | 'paid' | 'cancelled' | 'refunded';
export type PaymentMethodFilter = 'qris' | 'bank_transfer' | 'cod';
export type OrderReviewFilter = 'reviewed' | 'unreviewed';

export type AdminOrderSortField =
    | 'created_at'
    | 'total_amount'
    | 'order_number'
    | 'status';

export type OrderColumnKey =
    | 'order_number'
    | 'customer'
    | 'store'
    | 'items'
    | 'total_amount'
    | 'payment_status'
    | 'status'
    | 'shipping_courier'
    | 'tracking_number'
    | 'created_at';

export type OrderColumnVisibility = Record<OrderColumnKey, boolean>;

export const ORDER_COLUMNS: DataTableColumnDef<OrderColumnKey>[] = [
    { key: 'order_number', label: 'Nomor Pesanan', defaultVisible: true },
    { key: 'customer', label: 'Pembeli', defaultVisible: true },
    { key: 'store', label: 'Toko UMKM', defaultVisible: true },
    { key: 'items', label: 'Produk', defaultVisible: true },
    { key: 'total_amount', label: 'Total Belanja', defaultVisible: true },
    { key: 'payment_status', label: 'Pembayaran', defaultVisible: true },
    { key: 'status', label: 'Status Pesanan', defaultVisible: true },
    { key: 'shipping_courier', label: 'Kurir', defaultVisible: false },
    { key: 'tracking_number', label: 'Nomor Resi', defaultVisible: false },
    { key: 'created_at', label: 'Tanggal Pesan', defaultVisible: true },
];

export type AdminOrderRow = {
    id: number;
    order_number: string;
    status: AdminOrderStatus;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    payment_channel: string;
    shipping_courier: string;
    tracking_number: string | null;
    customer_name: string;
    customer_phone: string;
    store_name: string;
    primary_item_name: string;
    other_items_count: number;
    total_quantity: number;
    total_amount: number;
    reviewed_count: number;
    items_count: number;
    internal_notes_count: number;
    needs_attention: boolean;
    created_at: string;
};

export type PaginatedAdminOrders = PaginatedData<AdminOrderRow>;

export type AdminOrderStats = {
    total: number;
    pending_payment: number;
    processing: number;
    shipped: number;
    completed: number;
    cancelled: number;
    needs_attention: number;
    completed_revenue: number;
};

export type AdminOrderStatusCounts = Record<AdminOrderStatusFilter, number>;

export type AdminOrderFilterOptions = {
    stores: Array<{ id: number; name: string }>;
    products: Array<{ id: number; name: string }>;
    couriers: string[];
};

export type AdminOrderFilters = {
    search?: string | null;
    status?: AdminOrderStatusFilter | null;
    payment_status?: PaymentStatusFilter | null;
    payment_method?: PaymentMethodFilter | null;
    store_id?: string | number | null;
    product_id?: string | number | null;
    shipping_courier?: string | null;
    review_status?: OrderReviewFilter | null;
    needs_attention?: string | null;
    date_from?: string | null;
    date_to?: string | null;
    sort?: AdminOrderSortField | null;
    direction?: SortDirection | null;
};

export type AdminOrderItemReview = {
    id: number;
    rating: number;
    comment: string;
    isHidden: boolean;
    hiddenReason: string | null;
    adminReply: string | null;
    createdAtLabel: string;
};

export type AdminOrderDetailItem = {
    id: number;
    productId: number | null;
    productName: string;
    productSlug: string;
    imageUrl: string | null;
    unitLabel: string;
    price: number;
    originalPrice: number | null;
    quantity: number;
    subtotal: number;
    review: AdminOrderItemReview | null;
};

export type AdminOrderHistoryEvent = {
    id: number;
    status: string;
    title: string;
    description: string | null;
    location: string | null;
    actorType: string;
    actorName: string | null;
    occurredAt: string;
    occurredAtLabel: string;
};

export type AdminOrderInternalNote = {
    id: number;
    note: string;
    adminName: string;
    createdAt: string | null;
    createdAtLabel: string;
};

export type AdminOrderDetail = {
    id: number;
    orderNumber: string;
    status: AdminOrderStatus;
    statusLabel: string;
    paymentMethod: string;
    paymentChannel: string;
    paymentStatus: string;
    paymentStatusLabel: string;
    paymentDueAtLabel: string | null;
    paidAtLabel: string | null;
    shippedAtLabel: string | null;
    completedAtLabel: string | null;
    cancelledAtLabel: string | null;
    createdAtLabel: string;
    shippingMethod: string;
    shippingCourier: string;
    trackingNumber: string | null;
    shippingAddress: {
        label: string;
        recipientName: string;
        phone: string;
        fullAddress: string;
        district: string;
        city: string;
        postalCode: string;
        courierNote: string;
    };
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    serviceFee: number;
    totalAmount: number;
    customerNote: string | null;
    cancellationReason: string | null;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    store: {
        id: number;
        name: string;
        location: string;
        whatsappNumber: string;
    };
    followUp: {
        customer: {
            name: string;
            phone: string;
            email: string;
            whatsappUrl: string | null;
        };
        store: {
            name: string;
            location: string;
            phone: string;
            whatsappUrl: string;
        };
        courier: {
            name: string;
            method: string;
            trackingNumber: string | null;
            phone: string | null;
            whatsappUrl: string | null;
            trackingUrl: string | null;
            notes: string | null;
        };
    };
    items: AdminOrderDetailItem[];
    histories: AdminOrderHistoryEvent[];
    internalNotes: AdminOrderInternalNote[];
    actions: {
        canConfirmPayment: boolean;
        canShip: boolean;
        canAddTracking: boolean;
        canComplete: boolean;
        canCancel: boolean;
    };
};
