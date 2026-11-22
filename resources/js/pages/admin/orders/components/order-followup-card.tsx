import {
    Check,
    Copy,
    ExternalLink,
    MessageCircle,
    Phone,
    Store,
    Truck,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { AdminOrderDetail } from '../types';

type Props = {
    order: AdminOrderDetail;
};

export function OrderFollowUpCard({ order }: Props) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = async (key: string, value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedKey(key);
            toast.success(`${label} berhasil disalin.`);
            setTimeout(() => setCopiedKey(null), 1800);
        } catch {
            toast.error(`Gagal menyalin ${label.toLowerCase()}.`);
        }
    };

    const { customer, store, courier } = order.followUp;

    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-1 pb-4">
                <h2 className="text-base font-bold text-gray-900">
                    Tindak Lanjut Operasional
                </h2>
                <p className="text-xs text-gray-500">
                    Hubungi pihak terkait secara langsung jika terjadi kendala
                    pembayaran, persiapan produk, atau pengiriman.
                </p>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
                {/* 1. Pembeli */}
                <div className="flex flex-col gap-2.5 py-4 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <User className="h-4 w-4 text-[#7D3394]" />
                            <span>Pembeli</span>
                        </div>
                        {customer.phone && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(
                                        'customer-phone',
                                        customer.phone,
                                        'Nomor telepon pembeli',
                                    )
                                }
                                className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                            >
                                {copiedKey === 'customer-phone' ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Salin HP</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                        <span className="font-medium text-gray-900">
                            {customer.name}
                        </span>
                        {customer.phone && (
                            <span className="tabular-nums">
                                {customer.phone}
                            </span>
                        )}
                        {customer.email && (
                            <span className="text-gray-400">
                                {customer.email}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        {customer.whatsappUrl ? (
                            <a
                                href={customer.whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                data-test="followup-customer-wa"
                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>WhatsApp Pembeli</span>
                            </a>
                        ) : (
                            <span className="text-xs text-gray-400">
                                Nomor WhatsApp pembeli belum tersedia.
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. Toko UMKM */}
                <div className="flex flex-col gap-2.5 py-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Store className="h-4 w-4 text-[#7D3394]" />
                            <span>Toko UMKM</span>
                        </div>
                        {store.phone && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(
                                        'store-phone',
                                        store.phone,
                                        'Nomor WhatsApp toko',
                                    )
                                }
                                className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                            >
                                {copiedKey === 'store-phone' ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Salin HP</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                        <span className="font-medium text-gray-900">
                            {store.name}
                        </span>
                        <span>{store.location}</span>
                        {store.phone && (
                            <span className="tabular-nums">{store.phone}</span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        <a
                            href={store.whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            data-test="followup-store-wa"
                            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#7D3394] px-3 py-2 text-xs font-semibold text-white"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp Toko UMKM</span>
                        </a>
                    </div>
                </div>

                {/* 3. Jasa Ekspedisi */}
                <div className="flex flex-col gap-2.5 pt-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Truck className="h-4 w-4 text-[#7D3394]" />
                            <span>Jasa Ekspedisi</span>
                        </div>
                        {courier.trackingNumber && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(
                                        'tracking-number',
                                        courier.trackingNumber ?? '',
                                        'Nomor resi',
                                    )
                                }
                                className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                            >
                                {copiedKey === 'tracking-number' ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Salin Resi</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                        <span className="font-medium text-gray-900">
                            {courier.name}
                        </span>
                        <span>{courier.method}</span>
                        <span className="tabular-nums">
                            Resi: {courier.trackingNumber ?? 'Belum diisi'}
                        </span>
                        {courier.phone && (
                            <span className="text-gray-500 tabular-nums">
                                Layanan CS: {courier.phone}
                            </span>
                        )}
                        {courier.notes && (
                            <span className="text-[11px] text-gray-400">
                                {courier.notes}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        {courier.whatsappUrl && (
                            <a
                                href={courier.whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                data-test="followup-courier-wa"
                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] px-3 py-2 text-xs font-semibold text-[#7D3394]"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>Hubungi Ekspedisi</span>
                            </a>
                        )}
                        {courier.phone && !courier.whatsappUrl && (
                            <a
                                href={`tel:${courier.phone.replace(/[^\d+]/g, '')}`}
                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                <span>Telepon CS</span>
                            </a>
                        )}
                        {courier.trackingUrl && (
                            <a
                                href={courier.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                data-test="followup-courier-track"
                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Lacak Resi</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
