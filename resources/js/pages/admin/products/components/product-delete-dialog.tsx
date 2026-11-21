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
import { destroy } from '@/routes/admin/products';
import type { ProductItem } from '../types';

type Props = {
    open: boolean;
    product: ProductItem | null;
    onClose: () => void;
};

export function ProductDeleteDialog({ open, product, onClose }: Props) {
    const [processing, setProcessing] = useState(false);

    if (!product) {
        return null;
    }

    const handleDelete = () => {
        setProcessing(true);
        router.delete(destroy.url(product.id), {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Hapus Produk
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-gray-600">
                        Apakah Anda yakin ingin menghapus produk &ldquo;
                        {product.name}&rdquo;? Seluruh foto produk terkait juga
                        akan ikut dihapus dan tindakan ini tidak dapat
                        dibatalkan.
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

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={processing}
                        data-test="confirm-delete-product-button"
                        className="h-10 cursor-pointer rounded-xl bg-[#DC2626] px-4 text-sm font-bold text-white disabled:opacity-50"
                    >
                        {processing ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
