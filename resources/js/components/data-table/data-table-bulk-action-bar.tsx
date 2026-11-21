import { Trash2, X } from 'lucide-react';
import type { ExportFormat } from '@/types/data-table';
import { DataTableExportDropdown } from './data-table-export-dropdown';

type Props = {
    selectedCount: number;
    itemLabel: string;
    onExport?: (format: ExportFormat) => void;
    onBulkDelete?: () => void;
    onClearSelection: () => void;
    extraActions?: React.ReactNode;
    dataTest?: string;
};

export function DataTableBulkActionBar({
    selectedCount,
    itemLabel,
    onExport,
    onBulkDelete,
    onClearSelection,
    extraActions,
    dataTest,
}: Props) {
    if (selectedCount === 0) {
        return null;
    }

    return (
        <div
            data-test={dataTest}
            className="flex flex-col gap-3 border-b border-[#E2C9EB] bg-[#F9F5FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
            <div className="flex items-center justify-between gap-3 sm:justify-start">
                <span className="text-sm font-medium text-[#7D3394]">
                    {selectedCount} {itemLabel} dipilih
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
                {extraActions}

                {onExport && (
                    <DataTableExportDropdown
                        variant="bulk"
                        label="Ekspor Terpilih"
                        onExport={onExport}
                        dataTest="bulk-export-trigger"
                    />
                )}

                {onBulkDelete && (
                    <button
                        type="button"
                        onClick={onBulkDelete}
                        data-test="bulk-delete-trigger"
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-red-50 px-3.5 text-xs font-semibold text-[#DC2626]"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus Terpilih</span>
                    </button>
                )}
            </div>
        </div>
    );
}
