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
import { destroy } from '@/routes/admin/categories';
import type { CategoryItem } from '../types';

type Props = {
    open: boolean;
    category: CategoryItem | null;
    onClose: () => void;
};

export function CategoryDeleteDialog({ open, category, onClose }: Props) {
    const [processing, setProcessing] = useState(false);

    if (!category) {
        return null;
    }

    const handleDelete = () => {
        setProcessing(true);
        router.delete(destroy.url(category.id), {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                onClose();
            },
        });
    };

    const hasProducts = category.products_count > 0;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Hapus Kategori
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-gray-600">
                        {hasProducts
                            ? `Kategori "${category.name}" masih memiliki ${category.products_count} produk terkait sehingga tidak dapat dihapus.`
                            : `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Tindakan ini tidak dapat dibatalkan.`}
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

                    {!hasProducts && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing}
                            data-test="confirm-delete-category-button"
                            className="h-10 cursor-pointer rounded-xl bg-[#DC2626] px-4 text-sm font-bold text-white disabled:opacity-50"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
