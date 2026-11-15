export interface CartItem {
    id: string;
    storeId: string;
    name: string;
    variant: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    imageUrl: string;
    imageAlt: string;
    quantity: number;
    isSelected: boolean;
}

export interface StoreGroup {
    id: string;
    name: string;
    district: string;
    city: string;
    notePlaceholder: string;
    note: string;
}

export interface RecommendationProduct {
    id: string;
    storeId: string;
    storeName: string;
    name: string;
    price: number;
    imageUrl: string;
    imageAlt: string;
    variant: string;
}

export interface CartCalculation {
    selectedCount: number;
    itemsTotal: number;
    discountTotal: number;
    shippingFee: number;
    shippingDiscount: number;
    serviceFee: number;
    grandTotal: number;
    freeShippingThreshold: number;
    freeShippingRemaining: number;
    freeShippingProgress: number;
}

