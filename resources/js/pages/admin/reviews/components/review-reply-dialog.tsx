import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { reply } from '@/routes/admin/reviews';
import type { AdminReviewRow } from '../types';

type Props = {
    review: AdminReviewRow | null;
    onClose: () => void;
};

export function ReviewReplyDialog({ review, onClose }: Props) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        reply: '',
    });

    useEffect(() => {
        if (review) {
            setData('reply', review.admin_reply ?? '');
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [review?.id]);

    return (
        <Dialog
            open={review !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Balasan Resmi Kossuma
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Tanggapan ini akan tampil di halaman produk tepat di
                        bawah ulasan pembeli. Kosongkan teks untuk menghapus
                        balasan.
                    </DialogDescription>
                </DialogHeader>

                {review && (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(reply.url(review.id), {
                                preserveScroll: true,
                                onSuccess: onClose,
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="border-l-2 border-[#E2C9EB] pl-3 text-xs text-gray-600">
                            <p className="font-semibold text-gray-900">
                                {review.author_name} • Bintang {review.rating}
                            </p>
                            <p className="mt-1 leading-relaxed">
                                &ldquo;{review.comment}&rdquo;
                            </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="admin-reply-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Tanggapan Resmi
                            </label>
                            <textarea
                                id="admin-reply-input"
                                rows={4}
                                value={data.reply}
                                onChange={(e) =>
                                    setData('reply', e.target.value)
                                }
                                placeholder="Contoh: Terima kasih atas ulasan dan masukannya, Ibu/Bapak. Tim Kossuma akan terus menjaga kualitas produk UMKM kami."
                                data-test="admin-reply-input"
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={errors.reply} />
                        </div>

                        <DialogFooter className="gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                data-test="save-review-reply-button"
                                className="h-10 cursor-pointer rounded-xl bg-[#7D3394] px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Balasan'}
                            </button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
