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

export type CategoryFilters = {
    search?: string | null;
    sort?: string | null;
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
