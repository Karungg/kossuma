import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { bulkDestroy } from '@/routes/admin/categories';
import type { CategoryItem } from '../types';

type Props = {
    open: boolean;
    selectedCategories: CategoryItem[];
    onClose: () => void;
    onDeleted: () => void;
};

export function CategoryBulkDeleteDialog({
    open,
    selectedCategories,
    onClose,
    onDeleted,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const deletableCategories = selectedCategories.filter(
        (category) => category.products_count === 0,
    );
    const blockedCategories = selectedCategories.filter(
        (category) => category.products_count > 0,
    );

    const canDeleteAny = deletableCategories.length > 0;

    const handleBulkDelete = () => {
        if (!canDeleteAny) {
            return;
        }

        setProcessing(true);
        router.delete(bulkDestroy.url(), {
            data: {
                ids: selectedCategories.map((category) => category.id),
            },
            preserveScroll: true,
            onSuccess: () => {
                onDeleted();
                onClose();
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const getDescription = (): string => {
        if (!canDeleteAny) {
            return `Seluruh ${blockedCategories.length} kategori yang dipilih masih memiliki produk terkait sehingga tidak dapat dihapus.`;
        }

        if (blockedCategories.length > 0) {
            return `${deletableCategories.length} kategori akan dihapus permanen, sedangkan ${blockedCategories.length} kategori lainnya akan dilewati karena masih memiliki produk terkait.`;
        }

        return `Apakah Anda yakin ingin menghapus ${deletableCategories.length} kategori yang dipilih? Tindakan ini tidak dapat dibatalkan.`;
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Hapus Kategori Terpilih
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
                            onClick={handleBulkDelete}
                            disabled={processing}
                            data-test="confirm-bulk-delete-category-button"
                            className="h-10 cursor-pointer rounded-xl bg-[#DC2626] px-4 text-sm font-bold text-white disabled:opacity-50"
                        >
                            {processing
                                ? 'Menghapus...'
                                : `Ya, Hapus (${deletableCategories.length})`}
                        </button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
