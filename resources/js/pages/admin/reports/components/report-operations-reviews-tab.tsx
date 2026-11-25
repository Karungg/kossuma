import { Clock, MessageSquareText, Star, Users } from 'lucide-react';
import type { ReportOperationsAndReviewsData } from '../types';

type Props = {
    data: ReportOperationsAndReviewsData;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function ReportOperationsReviewsTab({ data }: Props) {
    const { customers, fulfillment, reviews } = data;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Pembeli Baru vs Berulang
                        </span>
                        <Users className="h-4 w-4 text-[#7D3394]" />
                    </div>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {customers.new_buyers} / {customers.returning_buyers}
                    </p>
                    <span className="text-[11px] text-gray-400">
                        Rasio belanja berulang: {customers.repeat_rate}%
                    </span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Rata-rata Bayar ke Kirim
                        </span>
                        <Clock className="h-4 w-4 text-[#7D3394]" />
                    </div>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {fulfillment.avg_hours_to_ship !== null
                            ? `${fulfillment.avg_hours_to_ship} jam`
                            : '-'}
                    </p>
                    <span className="text-[11px] text-gray-400">
                        Berdasarkan {fulfillment.shipped_sample_count} pesanan
                        dikirim
                    </span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Rata-rata Kirim ke Selesai
                        </span>
                        <Clock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {fulfillment.avg_hours_to_complete !== null
                            ? `${fulfillment.avg_hours_to_complete} jam`
                            : '-'}
                    </p>
                    <span className="text-[11px] text-gray-400">
                        Berdasarkan {fulfillment.completed_sample_count} pesanan
                        selesai
                    </span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Rata-rata Ulasan Pembeli
                        </span>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {reviews.average_rating.toFixed(1)} / 5.0
                    </p>
                    <span className="text-[11px] text-gray-400">
                        {reviews.total_reviews} ulasan • Dibalas{' '}
                        {reviews.reply_rate}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6 lg:col-span-7">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-gray-900">
                            Pelanggan Teratas di Periode Ini
                        </h2>
                        <p className="text-xs text-gray-500">
                            Diurutkan berdasarkan total nilai belanja valid
                        </p>
                    </div>

                    {customers.top_buyers.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-500">
                            Belum ada transaksi pembeli pada periode ini.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[540px] border-collapse text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs text-gray-600">
                                        <th className="py-2.5 pr-3 font-semibold">
                                            Pelanggan
                                        </th>
                                        <th className="px-3 py-2.5 font-semibold">
                                            Tipe
                                        </th>
                                        <th className="px-3 py-2.5 text-right font-semibold">
                                            Pesanan
                                        </th>
                                        <th className="px-3 py-2.5 text-right font-semibold">
                                            Total Belanja
                                        </th>
                                        <th className="py-2.5 pl-3 text-right font-semibold">
                                            Terakhir Belanja
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-normal">
                                    {customers.top_buyers.map((buyer) => (
                                        <tr
                                            key={buyer.id}
                                            className="text-gray-700"
                                        >
                                            <td className="py-2.5 pr-3">
                                                <p className="text-gray-900">
                                                    {buyer.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {buyer.email}
                                                </p>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                                                        buyer.is_returning
                                                            ? 'bg-[#F0E6F5] text-[#7D3394]'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {buyer.is_returning
                                                        ? 'Berulang'
                                                        : 'Baru'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right">
                                                {buyer.orders_count}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold text-[#DC2626]">
                                                {formatRupiah(
                                                    buyer.total_spent,
                                                )}
                                            </td>
                                            <td className="py-2.5 pl-3 text-right text-xs text-gray-500">
                                                {buyer.last_order_at_label}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <div className="flex flex-col gap-6 lg:col-span-5">
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <MessageSquareText className="h-4 w-4 text-[#7D3394]" />
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    Distribusi Rating Ulasan
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Tampil: {reviews.visible_reviews} •
                                    Disembunyikan: {reviews.hidden_reviews}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {reviews.distribution.map((row) => (
                                <div
                                    key={row.rating}
                                    className="flex items-center gap-2.5 text-xs"
                                >
                                    <span className="inline-flex w-16 shrink-0 items-center gap-1 text-gray-700">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        {row.rating} Bintang
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-[#7D3394]"
                                            style={{
                                                width: `${Math.min(100, row.percentage)}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="w-16 shrink-0 text-right text-gray-500">
                                        {row.count} ({row.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                        <div className="mb-3">
                            <h3 className="text-sm font-bold text-gray-900">
                                Rekap Alasan Pembatalan
                            </h3>
                            <p className="text-xs text-gray-500">
                                Penyebab utama pesanan batal pada periode ini
                            </p>
                        </div>

                        {fulfillment.cancellation_reasons.length === 0 ? (
                            <p className="py-2 text-xs text-gray-500">
                                Tidak ada pesanan dibatalkan pada periode ini.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100 text-xs">
                                {fulfillment.cancellation_reasons.map(
                                    (item) => (
                                        <li
                                            key={item.reason}
                                            className="flex items-center justify-between gap-3 py-2"
                                        >
                                            <span className="text-gray-700">
                                                {item.reason}
                                            </span>
                                            <span className="shrink-0 text-gray-500">
                                                {item.count} pesanan (
                                                {formatRupiah(item.amount)})
                                            </span>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
