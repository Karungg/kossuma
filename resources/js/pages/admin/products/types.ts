import type {
    DataTableColumnDef,
    ExportFormat,
    PaginatedData,
    SortDirection,
} from '@/types/data-table';

export type ProductOptionItem = {
    id: number;
    name: string;
    slug: string;
};

export type ProductFormOptions = {
    categories: ProductOptionItem[];
    stores: ProductOptionItem[];
};

export type ProductImageItem = {
    id: number;
    product_id: number;
    image_path: string;
    url?: string | null;
    thumbnail_url?: string | null;
    alt: string | null;
    label: string | null;
    is_primary: boolean;
    sort_order: number;
};

export type ProductSpecificationItem = {
    title: string;
    value: string;
    description: string;
};

export type ProductItem = {
    id: number;
    category_id: number;
    store_id: number;
    name: string;
    slug: string;
    description: string;
    stock: number;
    price: number;
    original_price: number | null;
    unit_label: string | null;
    weight_grams: number | null;
    is_preorder: boolean;
    preorder_days: number | null;
    composition: string | null;
    cooking_instructions: string[] | null;
    specifications: ProductSpecificationItem[] | null;
    sold_count: number;
    rating_avg: number;
    reviews_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: ProductOptionItem | null;
    store?: ProductOptionItem | null;
    primary_image?: ProductImageItem | null;
    images?: ProductImageItem[];
};

export type ProductStats = {
    total: number;
    active: number;
    out_of_stock: number;
    preorder: number;
};

export type ProductSortField =
    | 'name'
    | 'price'
    | 'stock'
    | 'sold_count'
    | 'created_at'
    | 'updated_at';

export type ProductColumnKey =
    | 'name'
    | 'slug'
    | 'category'
    | 'store'
    | 'price'
    | 'stock'
    | 'status'
    | 'is_preorder'
    | 'sold_count'
    | 'created_at'
    | 'updated_at';

export type ProductColumnVisibility = Record<ProductColumnKey, boolean>;

export const PRODUCT_COLUMNS: DataTableColumnDef<ProductColumnKey>[] = [
    { key: 'name', label: 'Produk', defaultVisible: true },
    { key: 'slug', label: 'Slug', defaultVisible: false },
    { key: 'category', label: 'Kategori', defaultVisible: true },
    { key: 'store', label: 'Toko UMKM', defaultVisible: true },
    { key: 'price', label: 'Harga', defaultVisible: true },
    { key: 'stock', label: 'Stok', defaultVisible: true },
    { key: 'status', label: 'Status', defaultVisible: true },
    { key: 'is_preorder', label: 'Pre-order', defaultVisible: false },
    { key: 'sold_count', label: 'Terjual', defaultVisible: false },
    { key: 'created_at', label: 'Dibuat', defaultVisible: false },
    { key: 'updated_at', label: 'Diperbarui', defaultVisible: false },
];

export type ProductStatusFilter = 'active' | 'inactive';
export type ProductStockFilter = 'in_stock' | 'out_of_stock';
export type ProductPreorderFilter = 'preorder' | 'regular';

export type ProductFilters = {
    search?: string | null;
    category_id?: string | number | null;
    store_id?: string | number | null;
    status?: ProductStatusFilter | null;
    stock_status?: ProductStockFilter | null;
    preorder_status?: ProductPreorderFilter | null;
    sort?: ProductSortField | null;
    direction?: SortDirection | null;
};

export type PaginatedProducts = PaginatedData<ProductItem>;

export type { ExportFormat };
