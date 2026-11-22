import { useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    MapPinPlus,
    Truck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    cancel,
    complete,
    confirmPayment,
    ship,
    tracking,
} from '@/routes/admin/orders';
import type { AdminOrderDetail } from '../types';

type Props = {
    order: AdminOrderDetail;
    couriers: string[];
};

const CANCEL_PRESET_REASONS = [
    'Pembeli melewati batas waktu pembayaran',
    'Stok produk di toko UMKM sedang kosong',
    'Pembeli meminta pembatalan melalui WhatsApp',
    'Kendala pengiriman di area tujuan',
];

export function OrderActionsCard({ order, couriers }: Props) {
    const [activeModal, setActiveModal] = useState<
        'payment' | 'ship' | 'tracking' | 'complete' | 'cancel' | null
    >(null);

    const paymentForm = useForm({ note: '' });
    const shipForm = useForm({
        shipping_courier: order.shippingCourier || 'Kurir Koperasi Kossuma',
        tracking_number: order.trackingNumber ?? '',
        note: '',
    });
    const trackingForm = useForm({
        title: '',
        description: '',
        location: order.shippingAddress.district || 'Kota Bogor',
    });
    const completeForm = useForm({ note: '' });
    const cancelForm = useForm({ reason: '' });

    const { actions } = order;
    const hasAnyAction =
        actions.canConfirmPayment ||
        actions.canShip ||
        actions.canAddTracking ||
        actions.canComplete ||
        actions.canCancel;

    return (
        <>
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                <div className="flex flex-col gap-1 pb-4">
                    <h2 className="text-base font-bold text-gray-900">
                        Aksi Status Pesanan
                    </h2>
                    <p className="text-xs text-gray-500">
                        Setiap perubahan status tercatat otomatis pada riwayat
                        perjalanan pesanan.
                    </p>
                </div>

                {!hasAnyAction ? (
                    <p className="border-t border-gray-100 pt-4 text-xs text-gray-500">
                        Pesanan ini sudah berstatus akhir ({order.statusLabel})
                        dan tidak memerlukan perubahan status lagi.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-4">
                        {actions.canConfirmPayment && (
                            <button
                                type="button"
                                onClick={() => setActiveModal('payment')}
                                data-test="admin-confirm-payment-trigger"
                                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-4 text-sm font-bold text-white"
                            >
                                <CreditCard className="h-4 w-4" />
                                <span>Konfirmasi Pembayaran</span>
                            </button>
                        )}

                        {actions.canShip && (
                            <button
                                type="button"
                                onClick={() => {
                                    shipForm.setData({
                                        shipping_courier:
                                            order.shippingCourier ||
                                            'Kurir Koperasi Kossuma',
                                        tracking_number:
                                            order.trackingNumber ?? '',
                                        note: '',
                                    });
                                    setActiveModal('ship');
                                }}
                                data-test="admin-ship-order-trigger"
                                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-4 text-sm font-bold text-white"
                            >
                                <Truck className="h-4 w-4" />
                                <span>
                                    {order.status === 'shipped'
                                        ? 'Perbarui Kurir & Resi'
                                        : 'Input Resi & Kirim Pesanan'}
                                </span>
                            </button>
                        )}

                        {actions.canComplete && (
                            <button
                                type="button"
                                onClick={() => setActiveModal('complete')}
                                data-test="admin-complete-order-trigger"
                                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Tandai Pesanan Selesai</span>
                            </button>
                        )}

                        {actions.canAddTracking && (
                            <button
                                type="button"
                                onClick={() => setActiveModal('tracking')}
                                data-test="admin-add-tracking-trigger"
                                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 text-xs font-semibold text-gray-700"
                            >
                                <MapPinPlus className="h-4 w-4" />
                                <span>Tambah Update Pelacakan</span>
                            </button>
                        )}

                        {actions.canCancel && (
                            <button
                                type="button"
                                onClick={() => setActiveModal('cancel')}
                                data-test="admin-cancel-order-trigger"
                                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-xs font-semibold text-[#DC2626]"
                            >
                                <XCircle className="h-4 w-4" />
                                <span>Batalkan Pesanan</span>
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* Modal Konfirmasi Pembayaran */}
            <Dialog
                open={activeModal === 'payment'}
                onOpenChange={(open) => !open && setActiveModal(null)}
            >
                <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Konfirmasi Pembayaran
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Status pesanan {order.orderNumber} akan berubah
                            menjadi Diproses dan pembayaran ditandai Lunas.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            paymentForm.post(confirmPayment.url(order.id), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    paymentForm.reset();
                                    setActiveModal(null);
                                },
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="confirm-payment-note"
                                className="text-sm font-medium text-gray-700"
                            >
                                Catatan Verifikasi (opsional)
                            </label>
                            <textarea
                                id="confirm-payment-note"
                                rows={3}
                                value={paymentForm.data.note}
                                onChange={(e) =>
                                    paymentForm.setData('note', e.target.value)
                                }
                                placeholder="Contoh: Mutasi rekening BSI sudah masuk sesuai nominal."
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={paymentForm.errors.note} />
                        </div>

                        <DialogFooter className="gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={paymentForm.processing}
                                data-test="confirm-payment-submit"
                                className="h-10 cursor-pointer rounded-xl bg-[#7D3394] px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {paymentForm.processing
                                    ? 'Menyimpan...'
                                    : 'Ya, Konfirmasi Lunas'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Input / Update Resi & Kirim */}
            <Dialog
                open={activeModal === 'ship'}
                onOpenChange={(open) => !open && setActiveModal(null)}
            >
                <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            {order.status === 'shipped'
                                ? 'Perbarui Kurir & Nomor Resi'
                                : 'Input Resi & Kirim Pesanan'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Masukkan nama kurir dan nomor resi agar pembeli
                            dapat melacak paket dengan mudah.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            shipForm.post(ship.url(order.id), {
                                preserveScroll: true,
                                onSuccess: () => setActiveModal(null),
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="shipping-courier-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Jasa Ekspedisi / Kurir
                            </label>
                            <input
                                id="shipping-courier-input"
                                list="kossuma-courier-suggestions"
                                type="text"
                                required
                                value={shipForm.data.shipping_courier}
                                onChange={(e) =>
                                    shipForm.setData(
                                        'shipping_courier',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: Paxel, GoSend, Kurir Koperasi Kossuma"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <datalist id="kossuma-courier-suggestions">
                                {couriers.map((courier) => (
                                    <option key={courier} value={courier} />
                                ))}
                            </datalist>
                            <InputError
                                message={shipForm.errors.shipping_courier}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="tracking-number-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Nomor Resi
                            </label>
                            <input
                                id="tracking-number-input"
                                type="text"
                                required
                                value={shipForm.data.tracking_number}
                                onChange={(e) =>
                                    shipForm.setData(
                                        'tracking_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: KSM-BGR-20261122-001"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError
                                message={shipForm.errors.tracking_number}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="ship-note-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Catatan Pengiriman (opsional)
                            </label>
                            <textarea
                                id="ship-note-input"
                                rows={2}
                                value={shipForm.data.note}
                                onChange={(e) =>
                                    shipForm.setData('note', e.target.value)
                                }
                                placeholder="Contoh: Paket sudah diambil kurir pukul 13.00 WIB."
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={shipForm.errors.note} />
                        </div>

                        <DialogFooter className="gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={shipForm.processing}
                                data-test="ship-order-submit"
                                className="h-10 cursor-pointer rounded-xl bg-[#7D3394] px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {shipForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Pengiriman'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Tambah Update Pelacakan */}
            <Dialog
                open={activeModal === 'tracking'}
                onOpenChange={(open) => !open && setActiveModal(null)}
            >
                <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Tambah Pembaruan Pelacakan
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Catat perkembangan terbaru perjalanan paket agar
                            terlihat di riwayat pelacakan pembeli.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            trackingForm.post(tracking.url(order.id), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    trackingForm.reset('title', 'description');
                                    setActiveModal(null);
                                },
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="tracking-title-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Judul Pembaruan
                            </label>
                            <input
                                id="tracking-title-input"
                                type="text"
                                required
                                value={trackingForm.data.title}
                                onChange={(e) =>
                                    trackingForm.setData(
                                        'title',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: Kurir sedang menuju alamat penerima"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={trackingForm.errors.title} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="tracking-location-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Lokasi
                            </label>
                            <input
                                id="tracking-location-input"
                                type="text"
                                value={trackingForm.data.location}
                                onChange={(e) =>
                                    trackingForm.setData(
                                        'location',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: Bogor Tengah, Kota Bogor"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError
                                message={trackingForm.errors.location}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="tracking-description-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Keterangan Tambahan (opsional)
                            </label>
                            <textarea
                                id="tracking-description-input"
                                rows={2}
                                value={trackingForm.data.description}
                                onChange={(e) =>
                                    trackingForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: Paket diperkirakan tiba sebelum pukul 16.00 WIB."
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError
                                message={trackingForm.errors.description}
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={trackingForm.processing}
                                data-test="tracking-submit"
                                className="h-10 cursor-pointer rounded-xl bg-[#7D3394] px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {trackingForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Update'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Tandai Selesai */}
            <Dialog
                open={activeModal === 'complete'}
                onOpenChange={(open) => !open && setActiveModal(null)}
            >
                <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Tandai Pesanan Selesai
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Gunakan aksi ini jika paket sudah dipastikan
                            diterima oleh pembeli. Setelah selesai, pembeli
                            dapat menulis ulasan produk.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            completeForm.post(complete.url(order.id), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    completeForm.reset();
                                    setActiveModal(null);
                                },
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="complete-note-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Catatan Penyelesaian (opsional)
                            </label>
                            <textarea
                                id="complete-note-input"
                                rows={2}
                                value={completeForm.data.note}
                                onChange={(e) =>
                                    completeForm.setData('note', e.target.value)
                                }
                                placeholder="Contoh: Pembeli mengonfirmasi paket sudah diterima melalui WhatsApp."
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={completeForm.errors.note} />
                        </div>

                        <DialogFooter className="gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={completeForm.processing}
                                data-test="complete-order-submit"
                                className="h-10 cursor-pointer rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {completeForm.processing
                                    ? 'Menyimpan...'
                                    : 'Tandai Selesai'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Batalkan Pesanan */}
            <Dialog
                open={activeModal === 'cancel'}
                onOpenChange={(open) => !open && setActiveModal(null)}
            >
                <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Batalkan Pesanan
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Pembatalan oleh Admin akan mengembalikan stok produk
                            secara otomatis dan mencatat alasan pada riwayat
                            pesanan.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            cancelForm.post(cancel.url(order.id), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    cancelForm.reset();
                                    setActiveModal(null);
                                },
                            });
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {CANCEL_PRESET_REASONS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() =>
                                        cancelForm.setData('reason', preset)
                                    }
                                    className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-left text-xs text-gray-700"
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="cancel-reason-input"
                                className="text-sm font-medium text-gray-700"
                            >
                                Alasan Pembatalan
                            </label>
                            <textarea
                                id="cancel-reason-input"
                                rows={3}
                                required
                                value={cancelForm.data.reason}
                                onChange={(e) =>
                                    cancelForm.setData('reason', e.target.value)
                                }
                                placeholder="Tuliskan alasan pembatalan pesanan..."
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={cancelForm.errors.reason} />
                        </div>

                        <DialogFooter className="gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                disabled={cancelForm.processing}
                                data-test="cancel-order-submit"
                                className="h-10 cursor-pointer rounded-xl bg-[#DC2626] px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {cancelForm.processing
                                    ? 'Membatalkan...'
                                    : 'Batalkan Pesanan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
