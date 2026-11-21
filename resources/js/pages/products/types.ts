export interface ProductImage {
    id: string;
    url: string;
    thumbnailUrl?: string;
    alt: string;
    label: string;
}

export interface ProductSpecification {
    title: string;
    value: string;
    description: string;
}

export interface ProductReview {
    id: string;
    authorName: string;
    authorLocation: string;
    rating: number;
    date: string;
    variant: string;
    comment: string;
}

export interface RelatedProduct {
    id: string;
    slug: string;
    name: string;
    storeName: string;
    price: number;
    portion: string;
    badge: string;
    rating: number;
    imageUrl: string;
    imageFullUrl?: string;
    imageAlt: string;
}

export interface ProductDetail {
    id: string;
    slug: string;
    name: string;
    category: string;
    categorySlug: string;
    description: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    rating: number;
    reviewCount: number;
    soldCount?: string;
    stockCount?: number;
    stockStatus: string;
    unitLabel?: string;
    weight?: string;
    shippingFastInfo: string;
    producer: {
        name: string;
        district: string;
        city: string;
        activeYears: number;
        verified: boolean;
    };
    images: ProductImage[];
    specifications: ProductSpecification[];
    composition: string;
    cookingInstructions: string[];
    halalAudit: string;
    reviews?: ProductReview[];
    relatedProducts: RelatedProduct[];
}
