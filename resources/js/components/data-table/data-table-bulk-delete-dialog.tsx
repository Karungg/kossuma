import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    title: string;
    itemLabel: string;
    deletableCount: number;
    blockedCount?: number;
    blockedReason?: string;
    processing: boolean;
    onClose: () => void;
    onConfirm: () => void;
    confirmDataTest?: string;
};

export function DataTableBulkDeleteDialog({
    open,
    title,
    itemLabel,
    deletableCount,
    blockedCount = 0,
    blockedReason = 'masih terhubung dengan data lain',
    processing,
    onClose,
    onConfirm,
    confirmDataTest,
}: Props) {
    const canDeleteAny = deletableCount > 0;

    const getDescription = (): string => {
        if (!canDeleteAny) {
            return `Seluruh ${blockedCount} ${itemLabel} yang dipilih ${blockedReason} sehingga tidak dapat dihapus.`;
        }

        if (blockedCount > 0) {
            return `${deletableCount} ${itemLabel} akan dihapus permanen, sedangkan ${blockedCount} ${itemLabel} lainnya akan dilewati karena ${blockedReason}.`;
        }

        return `Apakah Anda yakin ingin menghapus ${deletableCount} ${itemLabel} yang dipilih? Tindakan ini tidak dapat dibatalkan.`;
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-gray-600">
                        {getDescription()}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                    >
                        Batal
                    </button>

                    {canDeleteAny && (
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={processing}
                            data-test={confirmDataTest}
                            className="h-10 cursor-pointer rounded-xl bg-[#DC2626] px-4 text-sm font-bold text-white disabled:opacity-50"
                        >
                            {processing
                                ? 'Menghapus...'
                                : `Ya, Hapus (${deletableCount})`}
                        </button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
