import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    MessageCircle,
    PackageCheck,
    RefreshCw,
    Star,
    Store,
    Truck,
} from 'lucide-react';
import { payment as checkoutPayment } from '@/routes/checkout';
import { show as showProduct } from '@/routes/products';
import type { CustomerOrder, OrderStatusValue } from '../types';

interface OrderCardProps {
    order: CustomerOrder;
    isBuyingAgain: boolean;
    isConfirming: boolean;
    onOpenDetail: (order: CustomerOrder) => void;
    onOpenTracking: (order: CustomerOrder) => void;
    onOpenReview: (order: CustomerOrder) => void;
    onOpenCancel: (order: CustomerOrder) => void;
    onBuyAgain: (order: CustomerOrder) => void;
    onConfirmReceived: (order: CustomerOrder) => void;
}

const STATUS_BADGE_STYLES: Record<OrderStatusValue, string> = {
    pending_payment: 'border-amber-200 bg-amber-50 text-amber-700',
    processing: 'border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]',
    shipped: 'border-sky-200 bg-sky-50 text-sky-700',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-red-200 bg-red-50 text-[#DC2626]',
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function OrderCard({
    order,
    isBuyingAgain,
    isConfirming,
    onOpenDetail,
    onOpenTracking,
    onOpenReview,
    onOpenCancel,
    onBuyAgain,
    onConfirmReceived,
}: OrderCardProps) {
    const firstItem = order.items[0];
    const remainingCount = Math.max(0, order.items.length - 1);

    return (
        <article
            data-test={`order-card-${order.orderNumber}`}
            className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6"
        >
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-gray-100 pb-3.5">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500 sm:text-sm">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                        <Store className="h-4 w-4 text-[#7D3394]" />
                        <span>{order.store.name}</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{order.createdAtLabel}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 tabular-nums">
                        {order.orderNumber}
                    </span>
                </div>

                <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[order.status]}`}
                >
                    {order.statusLabel}
                </span>
            </div>

            {order.actions.canPay && order.paymentDueAtLabel && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 px-3.5 py-2 text-xs text-amber-800">
                    <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                        Bayar sebelum{' '}
                        <strong className="font-semibold">
                            {order.paymentDueAtLabel}
                        </strong>{' '}
                        melalui {order.paymentChannel}
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {firstItem && (
                    <div className="flex min-w-0 flex-1 items-start gap-3.5">
                        <Link
                            href={showProduct({ slug: firstItem.productSlug })}
                            className="h-18 w-18 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-100 sm:h-20 sm:w-20"
                        >
                            {firstItem.imageUrl ? (
                                <img
                                    src={firstItem.imageUrl}
                                    alt={firstItem.productName}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-100" />
                            )}
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <Link
                                href={showProduct({
                                    slug: firstItem.productSlug,
                                })}
                                className="line-clamp-2 cursor-pointer text-sm leading-snug text-gray-900"
                            >
                                {firstItem.productName}
                            </Link>

                            <span className="text-xs text-gray-500 tabular-nums">
                                {firstItem.quantity} barang ×{' '}
                                {formatRupiah(firstItem.price)}
                                {firstItem.unitLabel
                                    ? ` • ${firstItem.unitLabel}`
                                    : ''}
                            </span>

                            {remainingCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => onOpenDetail(order)}
                                    className="w-fit cursor-pointer text-xs font-medium text-[#7D3394]"
                                >
                                    +{remainingCount} produk lainnya
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-baseline justify-between border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
                    <span className="text-xs text-gray-500">Total Belanja</span>
                    <span className="text-base font-extrabold text-[#DC2626] tabular-nums sm:text-lg">
                        {formatRupiah(order.totalAmount)}
                    </span>
                </div>
            </div>

            {order.status === 'cancelled' && order.cancellationReason && (
                <p className="text-xs text-gray-500">
                    Alasan pembatalan: {order.cancellationReason}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3.5">
                <button
                    type="button"
                    onClick={() => onOpenDetail(order)}
                    data-test={`order-detail-btn-${order.id}`}
                    className="cursor-pointer text-xs font-semibold text-[#7D3394] sm:text-sm"
                >
                    Lihat Detail Transaksi
                </button>

                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href={order.store.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-test={`order-ask-seller-btn-${order.id}`}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700"
                    >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Tanya Penjual</span>
                    </a>

                    {order.actions.canTrack && (
                        <button
                            type="button"
                            onClick={() => onOpenTracking(order)}
                            data-test={`order-track-btn-${order.id}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700"
                        >
                            <Truck className="h-3.5 w-3.5 text-[#7D3394]" />
                            <span>Lacak</span>
                        </button>
                    )}

                    {order.actions.canCancel && (
                        <button
                            type="button"
                            onClick={() => onOpenCancel(order)}
                            data-test={`order-cancel-btn-${order.id}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#DC2626]"
                        >
                            <span>Batalkan</span>
                        </button>
                    )}

                    {order.actions.canPay && (
                        <Link
                            href={checkoutPayment.url({
                                query: {
                                    method: order.paymentMethod,
                                    total: order.totalAmount,
                                    order_id: order.orderNumber,
                                },
                            })}
                            data-test={`order-pay-btn-${order.id}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#7D3394] px-4 py-2 text-xs font-bold text-white"
                        >
                            <span>Bayar Sekarang</span>
                        </Link>
                    )}

                    {order.actions.canConfirmReceived && (
                        <button
                            type="button"
                            disabled={isConfirming}
                            onClick={() => onConfirmReceived(order)}
                            data-test={`order-confirm-btn-${order.id}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#7D3394] px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <PackageCheck className="h-3.5 w-3.5" />
                            <span>
                                {isConfirming
                                    ? 'Memproses...'
                                    : 'Pesanan Diterima'}
                            </span>
                        </button>
                    )}

                    {order.actions.canReview && (
                        <button
                            type="button"
                            onClick={() => onOpenReview(order)}
                            data-test={`order-review-btn-${order.id}`}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] px-3.5 py-2 text-xs font-bold text-[#7D3394]"
                        >
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                            <span>Ulas</span>
                        </button>
                    )}

                    {order.actions.allReviewed && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Sudah Diulas</span>
                        </span>
                    )}

                    {order.actions.canBuyAgain && (
                        <button
                            type="button"
                            disabled={isBuyingAgain}
                            onClick={() => onBuyAgain(order)}
                            data-test={`order-buy-again-btn-${order.id}`}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                                order.actions.canPay ||
                                order.actions.canConfirmReceived
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-[#7D3394] text-white'
                            }`}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>
                                {isBuyingAgain ? 'Menambahkan...' : 'Beli Lagi'}
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
