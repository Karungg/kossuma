export type NotificationCategory =
    | 'system'
    | 'order'
    | 'product'
    | 'category'
    | 'account';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'danger';

export type NotificationSummary = {
    unread_count: number;
};

export type AppNotificationItem = {
    id: string;
    title: string;
    message: string;
    category: NotificationCategory;
    category_label: string;
    level: NotificationLevel;
    action_url: string | null;
    action_label: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string | null;
    created_at_human: string;
};

export type NotificationFeedMeta = {
    current_page: number;
    last_page: number;
    total: number;
    has_more: boolean;
};

export type NotificationFeedResponse = {
    data: AppNotificationItem[];
    meta: NotificationFeedMeta;
    unread_count: number;
    read_count: number;
};
