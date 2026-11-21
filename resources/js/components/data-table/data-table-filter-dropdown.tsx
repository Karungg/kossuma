import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
    DataTableActiveChip,
    DataTableFilterGroup,
} from '@/types/data-table';

type DropdownProps = {
    groups: DataTableFilterGroup[];
    activeCount: number;
    onReset: () => void;
    dataTest?: string;
};

export function DataTableFilterDropdown({
    groups,
    activeCount,
    onReset,
    dataTest,
}: DropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    data-test={dataTest}
                    className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
                        activeCount > 0
                            ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                            : 'border-gray-200 bg-white text-gray-700'
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filter</span>
                    {activeCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7D3394] px-1.5 text-[11px] font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="max-h-[70vh] w-72 overflow-y-auto rounded-xl border-gray-100 bg-white p-3.5 shadow-md"
            >
                <div className="flex flex-col gap-4">
                    {groups.map((group, idx) => (
                        <div
                            key={group.key}
                            className={`flex flex-col gap-2 ${
                                idx > 0 ? 'border-t border-gray-100 pt-3' : ''
                            }`}
                        >
                            <span className="text-xs font-semibold text-gray-700">
                                {group.label}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {group.options.map((option) => {
                                    const isActive =
                                        group.value === option.value;

                                    return (
                                        <button
                                            key={option.value || 'all'}
                                            type="button"
                                            onClick={() =>
                                                group.onChange(option.value)
                                            }
                                            className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                                                isActive
                                                    ? 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                                    : 'border-gray-200 bg-white text-gray-700'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {activeCount > 0 && (
                        <div className="border-t border-gray-100 pt-2.5">
                            <button
                                type="button"
                                onClick={onReset}
                                className="w-full cursor-pointer rounded-lg bg-gray-100 py-1.5 text-center text-xs font-semibold text-gray-700"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

type ActiveChipsProps = {
    chips: DataTableActiveChip[];
    onReset: () => void;
};

export function DataTableActiveFilterChips({
    chips,
    onReset,
}: ActiveChipsProps) {
    if (chips.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
                <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2C9EB] bg-[#F0E6F5] px-2.5 py-1 text-xs font-medium text-[#7D3394]"
                >
                    <span>{chip.label}</span>
                    <button
                        type="button"
                        onClick={chip.onRemove}
                        aria-label={chip.ariaLabel}
                        className="cursor-pointer"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </span>
            ))}

            <button
                type="button"
                onClick={onReset}
                className="cursor-pointer px-1.5 py-1 text-xs font-medium text-gray-500"
            >
                Reset Filter
            </button>
        </div>
    );
}
