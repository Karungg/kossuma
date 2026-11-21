import { useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { store as storeOrderReview } from '@/routes/customer/orders/reviews';
import type { CustomerOrder } from '../types';

interface OrderReviewDialogProps {
    order: CustomerOrder | null;
    onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
    1: 'Kurang Memuaskan',
    2: 'Cukup',
    3: 'Baik',
    4: 'Sangat Baik',
    5: 'Luar Biasa',
};

export function OrderReviewDialog({ order, onClose }: OrderReviewDialogProps) {
    const reviewableItems =
        order?.items.filter(
            (item) => !item.isReviewed && item.productId !== null,
        ) ?? [];

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            order_item_id: reviewableItems[0]?.id ?? 0,
            rating: 5,
            comment: '',
        });

    useEffect(() => {
        if (order) {
            const firstUnreviewed = order.items.find(
                (item) => !item.isReviewed && item.productId !== null,
            );
            setData({
                order_item_id: firstUnreviewed?.id ?? 0,
                rating: 5,
                comment: '',
            });
            clearErrors();
        }
    }, [order]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!order || data.order_item_id === 0) {
            return;
        }

        post(storeOrderReview.url(order.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog
            open={order !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl bg-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Tulis Ulasan Produk
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Bagikan pengalaman belanja Anda agar membantu pembeli
                        lain dan mitra UMKM Kossuma.
                    </DialogDescription>
                </DialogHeader>

                {order && reviewableItems.length > 0 && (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5 pt-2"
                    >
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="review-order-item"
                                className="text-sm font-medium text-gray-800"
                            >
                                Pilih Produk
                            </label>
                            {reviewableItems.length === 1 ? (
                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {reviewableItems[0].imageUrl ? (
                                            <img
                                                src={
                                                    reviewableItems[0].imageUrl
                                                }
                                                alt={
                                                    reviewableItems[0]
                                                        .productName
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {reviewableItems[0].productName}
                                        </p>
                                        {reviewableItems[0].unitLabel && (
                                            <p className="text-xs text-gray-500">
                                                {reviewableItems[0].unitLabel}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <select
                                    id="review-order-item"
                                    value={data.order_item_id}
                                    onChange={(event) =>
                                        setData(
                                            'order_item_id',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="h-11 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                                >
                                    {reviewableItems.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.productName}
                                            {item.unitLabel
                                                ? ` (${item.unitLabel})`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <InputError message={errors.order_item_id} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-800">
                                Penilaian Anda
                            </span>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active = star <= data.rating;

                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() =>
                                                setData('rating', star)
                                            }
                                            aria-label={`Beri ${star} bintang`}
                                            data-test={`review-star-${star}`}
                                            className="cursor-pointer rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394]"
                                        >
                                            <Star
                                                className={`h-7 w-7 ${
                                                    active
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    );
                                })}
                                <span className="ml-2 text-xs font-semibold text-gray-600">
                                    {RATING_LABELS[data.rating]}
                                </span>
                            </div>
                            <InputError message={errors.rating} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="review-comment"
                                    className="text-sm font-medium text-gray-800"
                                >
                                    Ulasan Produk
                                </label>
                                <span className="text-xs text-gray-400 tabular-nums">
                                    {data.comment.length}/1000
                                </span>
                            </div>
                            <textarea
                                id="review-comment"
                                rows={4}
                                value={data.comment}
                                onChange={(event) =>
                                    setData('comment', event.target.value)
                                }
                                placeholder="Ceritakan rasa, kualitas kemasan, atau kecepatan pengantaran..."
                                data-test="review-comment-input"
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={errors.comment} />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                data-test="submit-review-button"
                                className="cursor-pointer rounded-xl bg-[#7D3394] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Ulasan'}
                            </button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
