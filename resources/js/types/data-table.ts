export type ExportFormat = 'xlsx' | 'pdf' | 'csv';

export type SortDirection = 'asc' | 'desc';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

export type DataTableColumnDef<TKey extends string> = {
    key: TKey;
    label: string;
    defaultVisible?: boolean;
};

export type DataTableFilterOption = {
    value: string;
    label: string;
};

export type DataTableFilterGroup = {
    key: string;
    label: string;
    value: string;
    options: DataTableFilterOption[];
    onChange: (value: string) => void;
};

export type DataTableActiveChip = {
    key: string;
    label: string;
    ariaLabel: string;
    onRemove: () => void;
};
