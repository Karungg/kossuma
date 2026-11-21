import { Link } from '@inertiajs/react';
import { MapPin, Receipt, Store, Truck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { show as showProduct } from '@/routes/products';
import type { CustomerOrder } from '../types';

interface OrderDetailDialogProps {
    order: CustomerOrder | null;
    onClose: () => void;
}

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
    return (
        <Dialog
            open={order !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl bg-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Detail Transaksi
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        {order
                            ? `${order.orderNumber} • ${order.createdAtFullLabel}`
                            : ''}
                    </DialogDescription>
                </DialogHeader>

                {order && (
                    <div className="flex flex-col gap-5 pt-2 text-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                            <span className="text-xs text-gray-500">
                                Status Pesanan
                            </span>
                            <span className="font-bold text-gray-900">
                                {order.statusLabel}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Store className="h-4 w-4 text-[#7D3394]" />
                                <span>{order.store.name}</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-3"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <Link
                                                href={showProduct({
                                                    slug: item.productSlug,
                                                })}
                                                className="h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                                            >
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.productName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : null}
                                            </Link>
                                            <div className="min-w-0">
                                                <Link
                                                    href={showProduct({
                                                        slug: item.productSlug,
                                                    })}
                                                    className="line-clamp-2 cursor-pointer text-sm text-gray-900"
                                                >
                                                    {item.productName}
                                                </Link>
                                                <p className="text-xs text-gray-500 tabular-nums">
                                                    {item.quantity} ×{' '}
                                                    {formatRupiah(item.price)}
                                                    {item.unitLabel
                                                        ? ` • ${item.unitLabel}`
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                                            {formatRupiah(item.subtotal)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {order.customerNote && (
                                <p className="text-xs text-gray-500">
                                    Catatan pembeli: {order.customerNote}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Truck className="h-4 w-4 text-[#7D3394]" />
                                <span>Info Pengiriman</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <span className="text-gray-500">Kurir</span>
                                <span className="col-span-2 font-medium text-gray-900">
                                    {order.shippingMethod} (
                                    {order.shippingCourier})
                                </span>
                                {order.trackingNumber && (
                                    <>
                                        <span className="text-gray-500">
                                            Nomor Resi
                                        </span>
                                        <span className="col-span-2 font-medium text-gray-900 tabular-nums">
                                            {order.trackingNumber}
                                        </span>
                                    </>
                                )}
                                <span className="text-gray-500">Alamat</span>
                                <div className="col-span-2 flex flex-col gap-0.5 text-gray-700">
                                    <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                                        <MapPin className="h-3.5 w-3.5 text-[#7D3394]" />
                                        {order.shippingAddress.recipientName} (
                                        {order.shippingAddress.label})
                                    </span>
                                    <span>{order.shippingAddress.phone}</span>
                                    <span>
                                        {order.shippingAddress.fullAddress},{' '}
                                        {order.shippingAddress.district},{' '}
                                        {order.shippingAddress.city}
                                        {order.shippingAddress.postalCode
                                            ? ` ${order.shippingAddress.postalCode}`
                                            : ''}
                                    </span>
                                    {order.shippingAddress.courierNote && (
                                        <span className="text-gray-500">
                                            Patokan:{' '}
                                            {order.shippingAddress.courierNote}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 pb-1 font-bold text-gray-900">
                                <Receipt className="h-4 w-4 text-[#7D3394]" />
                                <span>Rincian Pembayaran</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-600">
                                <span>Metode Pembayaran</span>
                                <span className="font-medium text-gray-900">
                                    {order.paymentChannel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-gray-600">
                                <span>Total Harga Barang</span>
                                <span className="tabular-nums">
                                    {formatRupiah(order.subtotal)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-gray-600">
                                <span>Ongkos Kirim</span>
                                <span className="tabular-nums">
                                    {order.shippingFee === 0
                                        ? 'Gratis'
                                        : formatRupiah(order.shippingFee)}
                                </span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex items-center justify-between text-emerald-700">
                                    <span>Potongan Promo</span>
                                    <span className="tabular-nums">
                                        -{formatRupiah(order.discountAmount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-gray-600">
                                <span>Biaya Layanan</span>
                                <span className="tabular-nums">
                                    {formatRupiah(order.serviceFee)}
                                </span>
                            </div>
                            <div className="mt-1 flex items-baseline justify-between border-t border-gray-100 pt-2.5">
                                <span className="font-bold text-gray-900">
                                    Total Belanja
                                </span>
                                <span className="text-lg font-extrabold text-[#DC2626] tabular-nums">
                                    {formatRupiah(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
