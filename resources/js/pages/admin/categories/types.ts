import type {
    DataTableColumnDef,
    ExportFormat,
    PaginatedData,
    SortDirection,
} from '@/types/data-table';

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

export const CATEGORY_COLUMNS: DataTableColumnDef<CategoryColumnKey>[] = [
    { key: 'name', label: 'Nama Kategori', defaultVisible: true },
    { key: 'slug', label: 'Slug', defaultVisible: true },
    { key: 'description', label: 'Deskripsi', defaultVisible: true },
    { key: 'products_count', label: 'Jumlah Produk', defaultVisible: true },
    { key: 'created_at', label: 'Dibuat', defaultVisible: false },
    { key: 'updated_at', label: 'Diperbarui', defaultVisible: false },
];

export type ProductStatusFilter = 'with_products' | 'without_products';
export type DescriptionStatusFilter = 'filled' | 'empty';

export type CategoryFilters = {
    search?: string | null;
    product_status?: ProductStatusFilter | null;
    description_status?: DescriptionStatusFilter | null;
    sort?: CategorySortField | null;
    direction?: SortDirection | null;
};

export type PaginatedCategories = PaginatedData<CategoryItem>;

export type { ExportFormat };
