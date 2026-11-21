export type OrderStatusValue =
    | 'pending_payment'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled';

export type OrderStatusFilter = 'all' | OrderStatusValue;

export type OrderDatePreset = 'all' | '30d' | '90d' | 'custom';

export interface OrderItemReview {
    id: number;
    rating: number;
    comment: string;
    createdAt: string | null;
}

export interface CustomerOrderItem {
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
    canBuyAgain: boolean;
    isReviewed: boolean;
    review: OrderItemReview | null;
}

export interface OrderTrackingEvent {
    id: number;
    status: string;
    title: string;
    description: string | null;
    location: string | null;
    occurredAt: string;
    occurredAtLabel: string;
}

export interface OrderShippingAddress {
    label: string;
    recipientName: string;
    phone: string;
    fullAddress: string;
    district: string;
    city: string;
    postalCode: string;
    courierNote: string;
}

export interface CustomerOrder {
    id: number;
    orderNumber: string;
    status: OrderStatusValue;
    statusLabel: string;
    createdAt: string | null;
    createdAtLabel: string;
    createdAtFullLabel: string;
    paymentMethod: string;
    paymentChannel: string;
    paymentStatus: string;
    paymentDueAtLabel: string | null;
    shippingMethod: string;
    shippingCourier: string;
    trackingNumber: string | null;
    shippingAddress: OrderShippingAddress;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    serviceFee: number;
    totalAmount: number;
    customerNote: string | null;
    cancellationReason: string | null;
    store: {
        id: number;
        name: string;
        location: string;
        whatsappUrl: string;
    };
    items: CustomerOrderItem[];
    histories: OrderTrackingEvent[];
    actions: {
        canPay: boolean;
        canCancel: boolean;
        canTrack: boolean;
        canConfirmReceived: boolean;
        canReview: boolean;
        allReviewed: boolean;
        canBuyAgain: boolean;
    };
}

export interface PaginatedOrders {
    data: CustomerOrder[];
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface OrderFiltersState {
    status: OrderStatusFilter;
    search: string;
    preset: OrderDatePreset;
    date_from: string;
    date_to: string;
}

export type OrderStatusCounts = Record<OrderStatusFilter, number>;
