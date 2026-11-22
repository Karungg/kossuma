import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { index as ordersIndex, show as orderShow } from '@/routes/admin/orders';
import type { RecentPurchaseActivity } from '../types';

type Props = {
    activities: RecentPurchaseActivity[];
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

const STATUS_BADGE_CLASSES: Record<RecentPurchaseActivity['status'], string> = {
    pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-[#F0E6F5] text-[#7D3394] border-[#E2C9EB]',
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-[#DC2626] border-red-200',
};

export function RecentPurchaseActivitiesCard({ activities }: Props) {
    return (
        <section className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-base font-bold text-gray-900">
                        Aktivitas Pembelian Terbaru
                    </h2>
                    <p className="text-xs text-gray-500">
                        Klik transaksi untuk membuka detail pesanan dan tindak
                        lanjut ke pembeli, toko UMKM, atau kurir.
                    </p>
                </div>
                <Link
                    href={ordersIndex.url()}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                >
                    Lihat Semua
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
                    <span className="text-sm font-medium text-gray-700">
                        Belum ada aktivitas pembelian
                    </span>
                    <span className="text-xs text-gray-400">
                        Pesanan baru dan pembaruan status pembelian akan tampil
                        di sini.
                    </span>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {activities.map((activity) => (
                        <Link
                            key={activity.id}
                            href={orderShow.url(activity.id)}
                            className="flex cursor-pointer flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                        >
                            <div className="flex min-w-0 flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {activity.order_number}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE_CLASSES[activity.status]}`}
                                    >
                                        {activity.status_label}
                                    </span>
                                    {activity.needs_attention && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-[#DC2626]">
                                            <AlertCircle className="h-3 w-3" />
                                            Tindak lanjut
                                        </span>
                                    )}
                                </div>

                                <p className="truncate text-xs text-gray-700">
                                    {activity.customer_name} •{' '}
                                    {activity.primary_item_name}
                                    {activity.other_items_count > 0
                                        ? ` (+${activity.other_items_count} produk lainnya)`
                                        : ''}
                                </p>

                                <p className="truncate text-[11px] text-gray-400">
                                    {activity.event_title} •{' '}
                                    {activity.store_name}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-1">
                                <span className="text-sm font-extrabold text-[#DC2626] tabular-nums">
                                    {formatRupiah(activity.total_amount)}
                                </span>
                                <span
                                    title={activity.occurred_at_label}
                                    className="text-[11px] text-gray-400"
                                >
                                    {activity.relative_time}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
