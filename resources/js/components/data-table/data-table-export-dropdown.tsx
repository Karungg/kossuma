import { ChevronDown, Download } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ExportFormat } from '@/types/data-table';

type Props = {
    onExport: (format: ExportFormat) => void;
    label?: string;
    variant?: 'toolbar' | 'bulk';
    dataTest?: string;
};

export function DataTableExportDropdown({
    onExport,
    label = 'Ekspor',
    variant = 'toolbar',
    dataTest,
}: Props) {
    const triggerClassName =
        variant === 'bulk'
            ? 'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#E2C9EB] bg-white px-3.5 text-xs font-semibold text-[#7D3394]'
            : 'inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    data-test={dataTest}
                    className={triggerClassName}
                >
                    <Download
                        className={
                            variant === 'bulk' ? 'h-3.5 w-3.5' : 'h-4 w-4'
                        }
                    />
                    <span>{label}</span>
                    <ChevronDown
                        className={
                            variant === 'bulk'
                                ? 'h-3.5 w-3.5'
                                : 'h-4 w-4 text-gray-400'
                        }
                    />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl border-gray-100 bg-white p-1.5 shadow-md"
            >
                <DropdownMenuItem
                    onClick={() => onExport('xlsx')}
                    className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-gray-700"
                >
                    Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onExport('pdf')}
                    className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-gray-700"
                >
                    Dokumen PDF (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onExport('csv')}
                    className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-gray-700"
                >
                    File CSV (.csv)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
