import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    MapPin,
    MessageSquareText,
    Receipt,
    Star,
    Store,
    Truck,
} from 'lucide-react';
import { dashboard } from '@/routes/admin';
import { index, invoice } from '@/routes/admin/orders';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import { show as showProduct } from '@/routes/products';
import { OrderActionsCard } from './components/order-actions-card';
import { OrderFollowUpCard } from './components/order-followup-card';
import { OrderInternalNotesCard } from './components/order-internal-notes-card';
import type { AdminOrderDetail, AdminOrderStatus } from './types';

type Props = {
    order: AdminOrderDetail;
    couriers: string[];
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

function statusBadgeClass(status: AdminOrderStatus): string {
    switch (status) {
        case 'pending_payment':
            return 'bg-amber-50 text-amber-700';
        case 'processing':
            return 'border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]';
        case 'shipped':
            return 'bg-blue-50 text-blue-700';
        case 'completed':
            return 'bg-emerald-50 text-emerald-700';
        case 'cancelled':
            return 'bg-red-50 text-[#DC2626]';
    }
}

function actorLabel(actorType: string, actorName: string | null): string {
    if (actorType === 'admin') {
        return actorName ? `Admin: ${actorName}` : 'Admin Kossuma';
    }

    if (actorType === 'customer') {
        return actorName ? `Pembeli: ${actorName}` : 'Pembeli';
    }

    return 'Sistem Kossuma';
}

export default function AdminOrderShow({ order, couriers }: Props) {
    return (
        <>
            <Head title={`Transaksi ${order.orderNumber}`} />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-col gap-1.5">
                        <Link
                            href={index()}
                            className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#7D3394]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Daftar Transaksi</span>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 tabular-nums sm:text-2xl">
                                {order.orderNumber}
                            </h1>
                            <span
                                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(order.status)}`}
                            >
                                {order.statusLabel}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                {order.paymentStatusLabel}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Dipesan pada {order.createdAtLabel} • Toko:{' '}
                            {order.store.name}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={invoice.url(order.id)}
                            data-test="download-order-invoice"
                            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700"
                        >
                            <Download className="h-4 w-4 text-[#7D3394]" />
                            <span>Unduh Invoice PDF</span>
                        </a>
                    </div>
                </div>

                {/* Main 2-Column Layout */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        {/* Produk & Ulasan */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                            <div className="flex items-center justify-between gap-2 pb-4">
                                <div className="flex items-center gap-2">
                                    <Store className="h-4 w-4 text-[#7D3394]" />
                                    <h2 className="text-base font-bold text-gray-900">
                                        Daftar Produk &amp; Ulasan
                                    </h2>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {order.store.name}
                                </span>
                            </div>

                            <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-3 py-4 last:pb-0"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={
                                                                item.productName
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    <Link
                                                        href={showProduct({
                                                            slug: item.productSlug,
                                                        })}
                                                        className="cursor-pointer text-sm text-gray-900"
                                                    >
                                                        {item.productName}
                                                    </Link>
                                                    <span className="text-xs text-gray-500 tabular-nums">
                                                        {item.quantity} ×{' '}
                                                        {formatRupiah(
                                                            item.price,
                                                        )}
                                                        {item.unitLabel
                                                            ? ` • ${item.unitLabel}`
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-sm font-bold text-gray-900 tabular-nums">
                                                {formatRupiah(item.subtotal)}
                                            </span>
                                        </div>

                                        {/* Status Ulasan per Produk */}
                                        {item.review ? (
                                            <div className="flex flex-col gap-1.5 border-l-2 border-[#E2C9EB] pl-3 text-xs">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, idx) => (
                                                                <Star
                                                                    key={idx}
                                                                    className={`h-3.5 w-3.5 ${
                                                                        idx <
                                                                        item
                                                                            .review!
                                                                            .rating
                                                                            ? 'fill-amber-400 text-amber-500'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-gray-400">
                                                            •{' '}
                                                            {
                                                                item.review
                                                                    .createdAtLabel
                                                            }
                                                        </span>
                                                        {item.review
                                                            .isHidden && (
                                                            <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-[#DC2626]">
                                                                Disembunyikan
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Link
                                                        href={reviewsIndex({
                                                            query: {
                                                                search: order.orderNumber,
                                                            },
                                                        })}
                                                        className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#7D3394]"
                                                    >
                                                        <MessageSquareText className="h-3.5 w-3.5" />
                                                        <span>
                                                            Moderasi Ulasan
                                                        </span>
                                                    </Link>
                                                </div>
                                                <p className="leading-relaxed text-gray-700">
                                                    {item.review.comment}
                                                </p>
                                                {item.review.adminReply && (
                                                    <p className="text-[11px] text-[#7D3394]">
                                                        Balasan Kossuma:{' '}
                                                        {item.review.adminReply}
                                                    </p>
                                                )}
                                            </div>
                                        ) : order.status === 'completed' ? (
                                            <span className="text-xs text-gray-400">
                                                Pembeli belum menulis ulasan
                                                untuk produk ini.
                                            </span>
                                        ) : null}
                                    </div>
                                ))}
                            </div>

                            {order.customerNote && (
                                <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
                                    Catatan pembeli:{' '}
                                    <span className="font-medium text-gray-900">
                                        {order.customerNote}
                                    </span>
                                </p>
                            )}

                            {order.cancellationReason && (
                                <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-[#DC2626]">
                                    Alasan pembatalan:{' '}
                                    <span className="font-medium">
                                        {order.cancellationReason}
                                    </span>
                                </p>
                            )}
                        </section>

                        {/* Pengiriman & Timeline Perjalanan */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                            <div className="flex items-center gap-2 pb-4">
                                <Truck className="h-4 w-4 text-[#7D3394]" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Pengiriman &amp; Riwayat Perjalanan
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-xs sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">
                                        Metode &amp; Ekspedisi
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {order.shippingMethod} (
                                        {order.shippingCourier})
                                    </span>
                                    <span className="text-gray-600 tabular-nums">
                                        Nomor Resi:{' '}
                                        {order.trackingNumber ?? 'Belum diisi'}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">
                                        Alamat Pengiriman
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                                        <MapPin className="h-3.5 w-3.5 text-[#7D3394]" />
                                        {order.shippingAddress.recipientName} (
                                        {order.shippingAddress.label})
                                    </span>
                                    <span className="text-gray-600">
                                        {order.shippingAddress.fullAddress},{' '}
                                        {order.shippingAddress.district},{' '}
                                        {order.shippingAddress.city}{' '}
                                        {order.shippingAddress.postalCode}
                                    </span>
                                    {order.shippingAddress.courierNote && (
                                        <span className="text-gray-400">
                                            Patokan:{' '}
                                            {order.shippingAddress.courierNote}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-5">
                                <h3 className="mb-3 text-sm font-bold text-gray-900">
                                    Linimasa Status Pesanan
                                </h3>
                                {order.histories.length === 0 ? (
                                    <p className="text-xs text-gray-500">
                                        Belum ada riwayat perubahan status.
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
                                                            <p className="text-xs leading-relaxed text-gray-600">
                                                                {
                                                                    event.description
                                                                }
                                                            </p>
                                                        )}
                                                        <span className="text-[11px] text-gray-400">
                                                            {
                                                                event.occurredAtLabel
                                                            }
                                                            {event.location
                                                                ? ` • ${event.location}`
                                                                : ''}{' '}
                                                            •{' '}
                                                            {actorLabel(
                                                                event.actorType,
                                                                event.actorName,
                                                            )}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                )}
                            </div>
                        </section>

                        {/* Rincian Pembayaran */}
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                            <div className="flex items-center gap-2 pb-4">
                                <Receipt className="h-4 w-4 text-[#7D3394]" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Rincian Pembayaran
                                </h2>
                            </div>

                            <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-4 text-sm">
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Metode Pembayaran</span>
                                    <span className="font-medium text-gray-900">
                                        {order.paymentChannel} (
                                        {order.paymentStatusLabel})
                                    </span>
                                </div>
                                {order.paidAtLabel && (
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Waktu Pembayaran</span>
                                        <span className="text-gray-900">
                                            {order.paidAtLabel}
                                        </span>
                                    </div>
                                )}
                                {order.paymentDueAtLabel &&
                                    order.status === 'pending_payment' && (
                                        <div className="flex items-center justify-between text-amber-700">
                                            <span>Batas Waktu Bayar</span>
                                            <span className="font-medium">
                                                {order.paymentDueAtLabel}
                                            </span>
                                        </div>
                                    )}
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
                                            -
                                            {formatRupiah(order.discountAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Biaya Layanan</span>
                                    <span className="tabular-nums">
                                        {formatRupiah(order.serviceFee)}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-baseline justify-between border-t border-gray-100 pt-3">
                                    <span className="font-bold text-gray-900">
                                        Total Belanja
                                    </span>
                                    <span className="text-xl font-extrabold text-[#DC2626] tabular-nums">
                                        {formatRupiah(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Operational Follow-up & Actions) */}
                    <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-span-4">
                        <OrderFollowUpCard order={order} />
                        <OrderActionsCard order={order} couriers={couriers} />
                        <OrderInternalNotesCard
                            orderId={order.id}
                            notes={order.internalNotes}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Transaksi',
            href: index(),
        },
        {
            title: 'Detail Transaksi',
            href: '#',
        },
    ],
};
