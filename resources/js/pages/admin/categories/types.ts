export type CategoryItem = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    products_count: number;
    created_at: string;
    updated_at: string;
};

export type CategoryStats = {
    total: number;
};

export type CategorySortField =
    | 'name'
    | 'slug'
    | 'products_count'
    | 'created_at'
    | 'updated_at';

export type CategoryColumnKey =
    | 'name'
    | 'slug'
    | 'description'
    | 'products_count'
    | 'created_at'
    | 'updated_at';

export type CategoryColumnVisibility = Record<CategoryColumnKey, boolean>;

export const CATEGORY_COLUMN_ORDER: CategoryColumnKey[] = [
    'name',
    'slug',
    'description',
    'products_count',
    'created_at',
    'updated_at',
];

export const CATEGORY_COLUMN_LABELS: Record<CategoryColumnKey, string> = {
    name: 'Nama Kategori',
    slug: 'Slug',
    description: 'Deskripsi',
    products_count: 'Jumlah Produk',
    created_at: 'Dibuat',
    updated_at: 'Diperbarui',
};

export const DEFAULT_CATEGORY_COLUMN_VISIBILITY: CategoryColumnVisibility = {
    name: true,
    slug: true,
    description: true,
    products_count: true,
    created_at: false,
    updated_at: false,
};

export type ProductStatusFilter = 'with_products' | 'without_products';
export type DescriptionStatusFilter = 'filled' | 'empty';
export type ExportFormat = 'xlsx' | 'pdf' | 'csv';

export type CategoryFilters = {
    search?: string | null;
    product_status?: ProductStatusFilter | null;
    description_status?: DescriptionStatusFilter | null;
    sort?: CategorySortField | null;
    direction?: 'asc' | 'desc' | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedCategories = {
    data: CategoryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};
