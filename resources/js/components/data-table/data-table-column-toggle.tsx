import { ChevronDown, Columns3 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DataTableColumnDef } from '@/types/data-table';

type Props<TKey extends string> = {
    columns: DataTableColumnDef<TKey>[];
    visibleColumns: Record<TKey, boolean>;
    isCustomColumns: boolean;
    onToggleColumn: (column: TKey) => void;
    onResetColumns: () => void;
    dataTest?: string;
};

export function DataTableColumnToggle<TKey extends string>({
    columns,
    visibleColumns,
    isCustomColumns,
    onToggleColumn,
    onResetColumns,
    dataTest,
}: Props<TKey>) {
    const visibleCount = columns.filter(
        (column) => visibleColumns[column.key],
    ).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    data-test={dataTest}
                    className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
                        isCustomColumns
                            ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                            : 'border-gray-200 bg-white text-gray-700'
                    }`}
                >
                    <Columns3 className="h-4 w-4" />
                    <span>Kolom</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-gray-100 bg-white p-1.5 shadow-md"
            >
                <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold text-gray-500">
                    Tampilkan Kolom & Ekspor
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                {columns.map((column) => {
                    const isChecked = visibleColumns[column.key];
                    const isLastVisible = isChecked && visibleCount <= 1;

                    return (
                        <DropdownMenuCheckboxItem
                            key={column.key}
                            checked={isChecked}
                            disabled={isLastVisible}
                            onSelect={(e) => e.preventDefault()}
                            onCheckedChange={() => onToggleColumn(column.key)}
                            data-test={`toggle-column-${column.key}`}
                            className="cursor-pointer rounded-lg py-2 text-xs font-medium text-gray-700"
                        >
                            {column.label}
                        </DropdownMenuCheckboxItem>
                    );
                })}
                {isCustomColumns && (
                    <>
                        <DropdownMenuSeparator className="my-1 bg-gray-100" />
                        <DropdownMenuItem
                            onClick={onResetColumns}
                            className="cursor-pointer justify-center rounded-lg py-1.5 text-xs font-semibold text-[#7D3394]"
                        >
                            Reset ke Default
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
