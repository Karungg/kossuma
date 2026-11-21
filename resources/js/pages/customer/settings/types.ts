export type CustomerSettingsTab = 'profile' | 'addresses' | 'security';

export interface CustomerProfileData {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
    emailVerifiedAt: string | null;
}

export interface CustomerAddress {
    id: string;
    label: string;
    recipientName: string;
    phone: string;
    fullAddress: string;
    district: string;
    city: string;
    postalCode: string;
    courierNote: string;
    isPrimary: boolean;
}
