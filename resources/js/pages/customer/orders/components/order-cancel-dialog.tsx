import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cancel as cancelOrder } from '@/routes/customer/orders';
import type { CustomerOrder } from '../types';

interface OrderCancelDialogProps {
    order: CustomerOrder | null;
    onClose: () => void;
}

const PRESET_REASONS = [
    'Ingin mengubah jumlah atau daftar produk',
    'Ingin mengganti alamat pengiriman',
    'Ingin mengganti metode pembayaran',
    'Berubah pikiran',
];

export function OrderCancelDialog({ order, onClose }: OrderCancelDialogProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            reason: PRESET_REASONS[0],
        });

    useEffect(() => {
        if (order) {
            setData('reason', PRESET_REASONS[0]);
            clearErrors();
        }
    }, [order]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!order) {
            return;
        }

        post(cancelOrder.url(order.id), {
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
            <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Batalkan Pesanan
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        {order
                            ? `Pesanan ${order.orderNumber} yang dibatalkan tidak dapat dikembalikan.`
                            : ''}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 pt-2"
                >
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-800">
                            Pilih Alasan Pembatalan
                        </span>
                        <div className="flex flex-col gap-2">
                            {PRESET_REASONS.map((preset) => (
                                <label
                                    key={preset}
                                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm ${
                                        data.reason === preset
                                            ? 'border-[#7D3394] bg-[#F0E6F5]/40 font-medium text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-700'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="cancel-reason"
                                        checked={data.reason === preset}
                                        onChange={() =>
                                            setData('reason', preset)
                                        }
                                        className="cursor-pointer accent-[#7D3394]"
                                    />
                                    <span>{preset}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.reason} />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700"
                        >
                            Kembali
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            data-test="confirm-cancel-order-button"
                            className="cursor-pointer rounded-xl bg-[#DC2626] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Membatalkan...' : 'Ya, Batalkan'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
