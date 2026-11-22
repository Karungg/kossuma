import type {
    DataTableColumnDef,
    ExportFormat,
    PaginatedData,
    SortDirection,
} from '@/types/data-table';

export type { ExportFormat, SortDirection };

export type ReviewRatingFilter = '1' | '2' | '3' | '4' | '5' | 'low';
export type ReviewVisibilityFilter = 'visible' | 'hidden';
export type ReviewReplyStatusFilter = 'replied' | 'unreplied';
export type ReviewSortField = 'created_at' | 'rating';

export type ReviewColumnKey =
    | 'product'
    | 'store'
    | 'author_name'
    | 'order_number'
    | 'rating'
    | 'comment'
    | 'visibility'
    | 'admin_reply'
    | 'created_at';

export type ReviewColumnVisibility = Record<ReviewColumnKey, boolean>;

export const REVIEW_COLUMNS: DataTableColumnDef<ReviewColumnKey>[] = [
    { key: 'product', label: 'Produk', defaultVisible: true },
    { key: 'store', label: 'Toko UMKM', defaultVisible: true },
    { key: 'author_name', label: 'Pembeli', defaultVisible: true },
    { key: 'order_number', label: 'Nomor Pesanan', defaultVisible: true },
    { key: 'rating', label: 'Rating', defaultVisible: true },
    { key: 'comment', label: 'Komentar', defaultVisible: true },
    { key: 'visibility', label: 'Status', defaultVisible: true },
    { key: 'admin_reply', label: 'Balasan Kossuma', defaultVisible: false },
    { key: 'created_at', label: 'Tanggal', defaultVisible: true },
];

export type AdminReviewRow = {
    id: number;
    product_id: number;
    product_name: string;
    product_slug: string | null;
    product_image_url: string | null;
    store_name: string;
    order_id: number | null;
    order_number: string | null;
    author_name: string;
    author_location: string;
    rating: number;
    variant: string | null;
    comment: string;
    is_hidden: boolean;
    hidden_reason: string | null;
    moderator_name: string | null;
    moderated_at_label: string | null;
    admin_reply: string | null;
    replier_name: string | null;
    admin_replied_at_label: string | null;
    created_at: string;
    created_at_label: string | null;
};

export type PaginatedAdminReviews = PaginatedData<AdminReviewRow>;

export type AdminReviewStats = {
    total: number;
    visible: number;
    average_rating: number;
    low_rating: number;
    hidden: number;
    unreplied: number;
};

export type AdminReviewFilterOptions = {
    products: Array<{ id: number; name: string }>;
    stores: Array<{ id: number; name: string }>;
};

export type AdminReviewFilters = {
    search?: string | null;
    product_id?: string | number | null;
    store_id?: string | number | null;
    rating?: ReviewRatingFilter | null;
    visibility?: ReviewVisibilityFilter | null;
    reply_status?: ReviewReplyStatusFilter | null;
    date_from?: string | null;
    date_to?: string | null;
    sort?: ReviewSortField | null;
    direction?: SortDirection | null;
};
