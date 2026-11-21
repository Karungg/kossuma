export interface CatalogProduct {
    id: string;
    slug: string;
    title: string;
    description?: string;
    category: string;
    price: number;
    originalPrice?: number | null;
    rating: number;
    soldCount: string;
    storeName: string;
    storeDistrict: string;
    imageUrl: string;
    imageFullUrl?: string;
    imageAlt: string;
    isPreorder?: boolean;
    preorderDays?: number | null;
    stock?: number;
}

export interface CategoryTab {
    id: string;
    label: string;
    icon?: string;
}

export interface CatalogPageData {
    data: CatalogProduct[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

export interface HomeFilters {
    category: string;
    search: string;
}
