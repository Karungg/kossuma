export interface CatalogProduct {
    id: string;
    slug: string;
    title: string;
    description?: string;
    category: string;
    price: number;
    originalPrice?: number;
    rating: number;
    soldCount: string;
    storeName: string;
    storeDistrict: string;
    imageUrl: string;
    imageAlt: string;
}

export interface CategoryTab {
    id: string;
    label: string;
    icon?: string;
}

