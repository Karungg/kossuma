import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { hide } from '@/routes/admin/reviews';
import type { AdminReviewRow } from '../types';

type Props = {
    review: AdminReviewRow | null;
    onClose: () => void;
};

const MODERATION_REASONS = [
    'Mengandung kata kasar, ujaran kebencian, atau SARA',
    'Spam atau promosi tautan di luar topik produk',
    'Memuat data pribadi sensitif (nomor telepon atau alamat)',
    'Komentar tidak relevan dengan produk yang dibeli',
];

export function ReviewHideDialog({ review, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog
            open={review !== null}
            onOpenChange={(open) => !open && handleClose()}
        >
            <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Sembunyikan Ulasan
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Sembunyikan ulasan hanya jika melanggar aturan
                        komunitas. Ulasan yang disembunyikan tidak akan tampil
                        di halaman produk dan rating produk akan dihitung ulang
                        otomatis.
                    </DialogDescription>
                </DialogHeader>

                {review && (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(hide.url(review.id), {
                                preserveScroll: true,
                                onSuccess: handleClose,
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="border-l-2 border-gray-200 pl-3 text-xs text-gray-600">
                            <p className="font-semibold text-gray-900">
                                {review.author_name} • {review.product_name}
                            </p>
                            <p className="mt-1 line-clamp-3 leading-relaxed">
                                &ldquo;{review.comment}&rdquo;
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {MODERATION_REASONS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setData('reason', preset)}
                                    className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-left text-xs text-gray-700"
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="hide-review-reason"
                                className="text-sm font-medium text-gray-700"
                            >
                                Alasan Moderasi
                            </label>
                            <textarea
                                id="hide-review-reason"
                                rows={3}
                                required
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                placeholder="Tuliskan alasan mengapa ulasan ini disembunyikan..."
                                data-test="hide-review-reason-input"
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={errors.reason} />
                        </div>

                        <DialogFooter className="gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                data-test="confirm-hide-review-button"
                                className="h-10 cursor-pointer rounded-xl bg-[#DC2626] px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {processing
                                    ? 'Menyembunyikan...'
                                    : 'Sembunyikan Ulasan'}
                            </button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
