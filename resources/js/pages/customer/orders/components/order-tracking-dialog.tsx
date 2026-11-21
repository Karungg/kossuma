import { Check, Copy, MapPin, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { CustomerOrder } from '../types';

interface OrderTrackingDialogProps {
    order: CustomerOrder | null;
    onClose: () => void;
}

export function OrderTrackingDialog({
    order,
    onClose,
}: OrderTrackingDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyTracking = async (trackingNumber: string) => {
        try {
            await navigator.clipboard.writeText(trackingNumber);
            setCopied(true);
            toast.success('Nomor resi berhasil disalin.');
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error('Gagal menyalin nomor resi.');
        }
    };

    return (
        <Dialog
            open={order !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl bg-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Lacak Pengiriman
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        {order
                            ? `${order.orderNumber} • ${order.store.name}`
                            : ''}
                    </DialogDescription>
                </DialogHeader>

                {order && (
                    <div className="flex flex-col gap-5 pt-2">
                        <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4 text-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Truck className="h-4 w-4 text-[#7D3394]" />
                                    <span className="font-semibold text-gray-900">
                                        {order.shippingMethod}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {order.shippingCourier}
                                </span>
                            </div>

                            {order.trackingNumber && (
                                <div className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-gray-500">
                                            Nomor Resi
                                        </span>
                                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                                            {order.trackingNumber}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopyTracking(
                                                order.trackingNumber ?? '',
                                            )
                                        }
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7D3394] ring-1 ring-[#E2C9EB]"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                <span>Tersalin</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Salin</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="flex items-start gap-2 pt-1 text-xs text-gray-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7D3394]" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-gray-900">
                                        {order.shippingAddress.recipientName} (
                                        {order.shippingAddress.label})
                                    </span>
                                    <span>
                                        {order.shippingAddress.fullAddress},{' '}
                                        {order.shippingAddress.district},{' '}
                                        {order.shippingAddress.city}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-gray-900">
                                Riwayat Perjalanan Pesanan
                            </h3>

                            {order.histories.length === 0 ? (
                                <p className="text-xs text-gray-500">
                                    Belum ada pembaruan status pengiriman.
                                </p>
                            ) : (
                                <ol className="relative ml-2 border-l border-gray-200 pl-5">
                                    {order.histories.map((event, idx) => {
                                        const isLatest = idx === 0;

                                        return (
                                            <li
                                                key={event.id}
                                                className="relative pb-5 last:pb-0"
                                            >
                                                <span
                                                    className={`absolute top-1 -left-[25px] h-3 w-3 rounded-full ring-4 ring-white ${
                                                        isLatest
                                                            ? 'bg-[#7D3394]'
                                                            : 'bg-gray-300'
                                                    }`}
                                                />
                                                <div className="flex flex-col gap-0.5">
                                                    <span
                                                        className={`text-xs sm:text-sm ${
                                                            isLatest
                                                                ? 'font-bold text-gray-900'
                                                                : 'font-medium text-gray-700'
                                                        }`}
                                                    >
                                                        {event.title}
                                                    </span>
                                                    {event.description && (
                                                        <p className="text-xs leading-relaxed text-gray-500">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    <span className="text-[11px] text-gray-400">
                                                        {event.occurredAtLabel}
                                                        {event.location
                                                            ? ` • ${event.location}`
                                                            : ''}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
