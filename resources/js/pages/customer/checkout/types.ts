export interface CheckoutAddress {
    id: string;
    label: string;
    recipientName: string;
    phone: string;
    fullAddress: string;
    district: string;
    city: string;
    isPrimary?: boolean;
}

export interface CheckoutItem {
    id: string;
    storeName: string;
    name: string;
    variant: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    imageUrl: string;
}

export interface ShippingOption {
    id: string;
    name: string;
    estimate: string;
    price: number;
    description: string;
}

export interface VoucherOption {
    id: string;
    code: string;
    title: string;
    description: string;
    discountAmount: number;
    type: 'subtotal' | 'shipping';
    minPurchase: number;
}

export type PaymentMethodType = 'qris' | 'bank' | 'cod';

export interface BankOption {
    id: 'bsi' | 'bca' | 'mandiri' | 'bri';
    name: string;
    shortName: string;
    description: string;
}
