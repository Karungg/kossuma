export type UnavailableReason = 'out_of_stock' | 'inactive' | null;

export interface CartItem {
    id: string;
    productId: number;
    storeId: string;
    slug: string;
    name: string;
    variant: string;
    price: number;
    originalPrice?: number | null;
    discountPercent?: number | null;
    imageUrl: string;
    imageFullUrl?: string;
    imageAlt: string;
    quantity: number;
    stock: number;
    isActive: boolean;
    isAvailable: boolean;
    unavailableReason: UnavailableReason;
    exceedsStock: boolean;
    canCheckout: boolean;
    isSelected: boolean;
    isPreorder: boolean;
    preorderDays?: number | null;
    priceSnapshot?: number | null;
    priceChanged: boolean;
}

export interface StoreGroup {
    id: string;
    name: string;
    district: string;
    city: string;
}

export interface RecommendationProduct {
    id: string;
    productId: number;
    slug: string;
    storeId: string;
    storeName: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string;
    imageFullUrl?: string;
    imageAlt: string;
    variant: string;
}

export interface CartCalculation {
    selectedCount: number;
    selectedUnits: number;
    originalItemsTotal: number;
    discountTotal: number;
    subtotal: number;
    hasBlockingSelectionIssue: boolean;
    unavailableCount: number;
}
