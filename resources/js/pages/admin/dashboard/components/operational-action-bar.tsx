import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronRight,
    Clock,
    MessageSquareText,
    Package,
    PackageX,
    Truck,
} from 'lucide-react';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as productsIndex } from '@/routes/admin/products';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import type { DashboardActionQueue } from '../types';

type Props = {
    actionQueue: DashboardActionQueue;
};

export function OperationalActionBar({ actionQueue }: Props) {
    const items = [
        {
            key: 'pending_payment',
            label: 'Menunggu Bayar',
            count: actionQueue.pending_payment,
            hint: 'Pantau pembayaran',
            href: ordersIndex.url({ query: { status: 'pending_payment' } }),
            icon: Clock,
            accentClass:
                actionQueue.pending_payment > 0
                    ? 'text-amber-600'
                    : 'text-gray-900',
            iconClass: 'bg-amber-50 text-amber-600',
        },
        {
            key: 'processing',
            label: 'Perlu Diproses',
            count: actionQueue.processing,
            hint: 'Siap dikemas & kirim',
            href: ordersIndex.url({ query: { status: 'processing' } }),
            icon: Package,
            accentClass:
                actionQueue.processing > 0 ? 'text-[#7D3394]' : 'text-gray-900',
            iconClass: 'bg-[#F0E6F5] text-[#7D3394]',
        },
        {
            key: 'needs_attention',
            label: 'Butuh Tindak Lanjut',
            count: actionQueue.needs_attention,
            hint: 'Terlambat / jatuh tempo',
            href: ordersIndex.url({ query: { needs_attention: '1' } }),
            icon: AlertCircle,
            accentClass:
                actionQueue.needs_attention > 0
                    ? 'text-[#DC2626]'
                    : 'text-gray-900',
            iconClass: 'bg-red-50 text-[#DC2626]',
        },
        {
            key: 'shipped',
            label: 'Sedang Dikirim',
            count: actionQueue.shipped,
            hint: 'Dalam perjalanan kurir',
            href: ordersIndex.url({ query: { status: 'shipped' } }),
            icon: Truck,
            accentClass: 'text-gray-900',
            iconClass: 'bg-blue-50 text-blue-600',
        },
        {
            key: 'out_of_stock',
            label: 'Stok Habis',
            count: actionQueue.out_of_stock_products,
            hint:
                actionQueue.low_stock_products > 0
                    ? `+${actionQueue.low_stock_products} stok menipis`
                    : 'Perlu isi ulang stok',
            href: productsIndex.url({
                query: { stock_status: 'out_of_stock' },
            }),
            icon: PackageX,
            accentClass:
                actionQueue.out_of_stock_products > 0
                    ? 'text-[#DC2626]'
                    : 'text-gray-900',
            iconClass: 'bg-red-50 text-[#DC2626]',
        },
        {
            key: 'reviews',
            label: 'Ulasan Belum Dibalas',
            count: actionQueue.unreplied_reviews,
            hint:
                actionQueue.low_rating_reviews > 0
                    ? `${actionQueue.low_rating_reviews} rating 1–2 bintang`
                    : 'Tanggapi ulasan pembeli',
            href:
                actionQueue.low_rating_reviews > 0
                    ? reviewsIndex.url({ query: { rating: 'low' } })
                    : reviewsIndex.url({
                          query: { reply_status: 'unreplied' },
                      }),
            icon: MessageSquareText,
            accentClass:
                actionQueue.low_rating_reviews > 0
                    ? 'text-amber-600'
                    : 'text-gray-900',
            iconClass: 'bg-[#F0E6F5] text-[#7D3394]',
        },
    ];

    return (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3.5 sm:px-6">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                        Perlu Ditangani Sekarang
                    </h2>
                    <p className="text-xs text-gray-500">
                        Klik salah satu antrean operasional untuk langsung
                        menindaklanjuti di halaman terkait.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-3 xl:grid-cols-6 xl:divide-y-0">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className="flex cursor-pointer flex-col justify-between gap-3 p-4 sm:p-5"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span
                                    className={`text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl ${item.accentClass}`}
                                >
                                    {item.count.toLocaleString('id-ID')}
                                </span>
                                <span className="text-xs font-medium text-gray-800">
                                    {item.label}
                                </span>
                                <span className="truncate text-[11px] text-gray-400">
                                    {item.hint}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
