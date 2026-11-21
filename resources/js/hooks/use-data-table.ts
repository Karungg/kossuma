import { router } from '@inertiajs/react';
import { useState } from 'react';
import type {
    DataTableColumnDef,
    ExportFormat,
    SortDirection,
} from '@/types/data-table';

type QueryValue = string | number | boolean | null | undefined;
type QueryRecord = Record<string, QueryValue>;

type ExportRequestContext<
    TId extends string | number,
    TColumnKey extends string,
> = {
    format: ExportFormat;
    ids?: TId[];
    columns: TColumnKey[];
    filters: Record<string, string | undefined>;
};

type UseDataTableOptions<
    TId extends string | number,
    TColumnKey extends string,
    TSortField extends string,
    TFilters extends QueryRecord,
> = {
    itemIds: TId[];
    filters: TFilters;
    columns: DataTableColumnDef<TColumnKey>[];
    defaultSort: TSortField;
    defaultDirection?: SortDirection;
    onlyProps: string[];
    buildIndexUrl: (query: Record<string, string | undefined>) => string;
    onExport?: (context: ExportRequestContext<TId, TColumnKey>) => void;
    buildExportUrl?: (context: ExportRequestContext<TId, TColumnKey>) => string;
};

function sanitizeQuery(
    filters: QueryRecord,
): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries(filters)) {
        if (value === null || value === undefined || value === '') {
            result[key] = undefined;
        } else {
            result[key] = String(value);
        }
    }

    return result;
}

export function useDataTable<
    TId extends string | number,
    TColumnKey extends string,
    TSortField extends string,
    TFilters extends QueryRecord,
>({
    itemIds,
    filters,
    columns,
    defaultSort,
    defaultDirection = 'asc',
    onlyProps,
    buildIndexUrl,
    onExport,
    buildExportUrl,
}: UseDataTableOptions<TId, TColumnKey, TSortField, TFilters>) {
    const defaultVisibility = columns.reduce(
        (acc, column) => {
            acc[column.key] = column.defaultVisible ?? true;
            return acc;
        },
        {} as Record<TColumnKey, boolean>,
    );

    const [selectedIds, setSelectedIds] = useState<TId[]>([]);
    const [visibleColumns, setVisibleColumns] =
        useState<Record<TColumnKey, boolean>>(defaultVisibility);

    const activeSelectedIds = selectedIds.filter((id) => itemIds.includes(id));
    const isAllSelected =
        itemIds.length > 0 && activeSelectedIds.length === itemIds.length;
    const isPartiallySelected =
        activeSelectedIds.length > 0 &&
        activeSelectedIds.length < itemIds.length;

    const activeColumnKeys = columns
        .filter((column) => visibleColumns[column.key])
        .map((column) => column.key);

    const isCustomColumns = columns.some(
        (column) =>
            visibleColumns[column.key] !== (column.defaultVisible ?? true),
    );

    const applyQuery = (overrides: Partial<TFilters>) => {
        const merged = sanitizeQuery({
            ...filters,
            ...overrides,
        });

        router.get(
            buildIndexUrl(merged),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: onlyProps,
            },
        );
    };

    const activeSort = ((filters.sort as TSortField | undefined) ??
        defaultSort) as TSortField;
    const activeDirection: SortDirection =
        filters.direction === 'desc'
            ? 'desc'
            : filters.direction === 'asc'
              ? 'asc'
              : defaultDirection;

    const handleSort = (column: TSortField) => {
        const nextDirection: SortDirection =
            activeSort === column && activeDirection === 'asc' ? 'desc' : 'asc';

        applyQuery({
            sort: column,
            direction: nextDirection,
        } as unknown as Partial<TFilters>);
    };

    const toggleSelect = (id: TId) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const toggleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? itemIds : []);
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const toggleColumn = (column: TColumnKey) => {
        setVisibleColumns((prev) => {
            const nextValue = !prev[column];
            const remainingVisible = columns.filter((col) =>
                col.key === column ? nextValue : prev[col.key],
            ).length;

            if (remainingVisible === 0) {
                return prev;
            }

            return {
                ...prev,
                [column]: nextValue,
            };
        });
    };

    const resetColumns = () => {
        setVisibleColumns(defaultVisibility);
    };

    const triggerExport = (format: ExportFormat, ids: TId[] = []) => {
        const context: ExportRequestContext<TId, TColumnKey> = {
            format,
            ids: ids.length > 0 ? ids : undefined,
            columns: activeColumnKeys,
            filters: sanitizeQuery(filters),
        };

        if (onExport) {
            onExport(context);
            return;
        }

        if (!buildExportUrl) {
            return;
        }

        window.location.assign(buildExportUrl(context));
    };

    return {
        selectedIds: activeSelectedIds,
        isAllSelected,
        isPartiallySelected,
        toggleSelect,
        toggleSelectAll,
        clearSelection,
        visibleColumns,
        activeColumnKeys,
        isCustomColumns,
        toggleColumn,
        resetColumns,
        activeSort,
        activeDirection,
        applyQuery,
        handleSort,
        triggerExport,
    };
}
