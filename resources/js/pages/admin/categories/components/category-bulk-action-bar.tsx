import { ChevronDown, Download, Trash2, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ExportFormat } from '../types';

type Props = {
    selectedCount: number;
    onExport: (format: ExportFormat) => void;
    onBulkDelete: () => void;
    onClearSelection: () => void;
};

export function CategoryBulkActionBar({
    selectedCount,
    onExport,
    onBulkDelete,
    onClearSelection,
}: Props) {
    if (selectedCount === 0) {
        return null;
    }

    return (
        <div
            data-test="category-bulk-action-bar"
            className="flex flex-col gap-3 border-b border-[#E2C9EB] bg-[#F9F5FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
            <div className="flex items-center justify-between gap-3 sm:justify-start">
                <span className="text-sm font-medium text-[#7D3394]">
                    {selectedCount} kategori dipilih
                </span>
                <button
                    type="button"
                    onClick={onClearSelection}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500"
                >
                    <X className="h-3.5 w-3.5" />
                    <span>Batal pilih</span>
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            data-test="bulk-export-trigger"
                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#E2C9EB] bg-white px-3.5 text-xs font-semibold text-[#7D3394]"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Ekspor Terpilih</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-44 rounded-xl border-gray-100 bg-white p-1.5 shadow-md"
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

                <button
                    type="button"
                    onClick={onBulkDelete}
                    data-test="bulk-delete-trigger"
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-red-50 px-3.5 text-xs font-semibold text-[#DC2626]"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Terpilih</span>
                </button>
            </div>
        </div>
    );
}
