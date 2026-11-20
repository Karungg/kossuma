import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortDirection } from '@/types/data-table';

type Props<TField extends string> = {
    column: TField;
    label: string;
    activeSort: TField;
    activeDirection: SortDirection;
    onSort: (column: TField) => void;
    className?: string;
};

export function getAriaSort<TField extends string>(
    column: TField,
    activeSort: TField,
    activeDirection: SortDirection,
): 'ascending' | 'descending' | 'none' {
    if (activeSort !== column) {
        return 'none';
    }

    return activeDirection === 'desc' ? 'descending' : 'ascending';
}

export function DataTableSortHeader<TField extends string>({
    column,
    label,
    activeSort,
    activeDirection,
    onSort,
    className = 'px-4 py-3.5 text-xs font-semibold text-gray-600',
}: Props<TField>) {
    const isActive = activeSort === column;

    return (
        <th
            aria-sort={getAriaSort(column, activeSort, activeDirection)}
            className={className}
        >
            <button
                type="button"
                onClick={() => onSort(column)}
                className={`inline-flex cursor-pointer items-center gap-1.5 ${
                    isActive ? 'text-[#7D3394]' : 'text-gray-600'
                }`}
            >
                <span>{label}</span>
                {!isActive ? (
                    <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                ) : activeDirection === 'desc' ? (
                    <ArrowDown className="h-3.5 w-3.5 shrink-0 text-[#7D3394]" />
                ) : (
                    <ArrowUp className="h-3.5 w-3.5 shrink-0 text-[#7D3394]" />
                )}
            </button>
        </th>
    );
}
