import { Store, Tag } from 'lucide-react';
import type { ReportStoresAndCategoriesData } from '../types';

type Props = {
    data: ReportStoresAndCategoriesData;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function ReportStoresCategoriesTab({ data }: Props) {
    const { summary, stores, inactiveStores, categories } = data;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">
                        Total Toko UMKM
                    </span>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {summary.total_stores.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">
                        Toko Bertransaksi
                    </span>
                    <p className="mt-1 text-xl font-extrabold text-emerald-700">
                        {summary.active_transacting_stores.toLocaleString(
                            'id-ID',
                        )}
                    </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">
                        Toko Belum Ada Pesanan
                    </span>
                    <p className="mt-1 text-xl font-extrabold text-amber-600">
                        {summary.inactive_stores_count.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">
                        Total Kategori
                    </span>
                    <p className="mt-1 text-xl font-extrabold text-[#7D3394]">
                        {summary.total_categories.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <Store className="h-4 w-4 text-[#7D3394]" />
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            Peringkat Performa Toko UMKM
                        </h2>
                        <p className="text-xs text-gray-500">
                            Diurutkan berdasarkan total omzet pada periode
                            terpilih
                        </p>
                    </div>
                </div>

                {stores.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500">
                        Belum ada transaksi toko UMKM pada periode ini.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-xs text-gray-600">
                                    <th className="py-3 pr-3 font-semibold">
                                        Toko UMKM &amp; Lokasi
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Pesanan
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Tingkat Selesai
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Unit Terjual
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Rata-rata Pesanan
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Produk Aktif
                                    </th>
                                    <th className="py-3 pl-3 text-right font-semibold">
                                        Omzet
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-normal">
                                {stores.map((store) => (
                                    <tr
                                        key={store.id}
                                        className="text-gray-700"
                                    >
                                        <td className="py-3 pr-3">
                                            <p className="text-gray-900">
                                                {store.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {store.location}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            {store.orders_count.toLocaleString(
                                                'id-ID',
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right text-emerald-700">
                                            {store.completion_rate}%
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            {store.items_sold.toLocaleString(
                                                'id-ID',
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            {formatRupiah(
                                                store.average_order_value,
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right text-gray-600">
                                            {store.active_products_count}
                                        </td>
                                        <td className="py-3 pl-3 text-right font-bold text-[#DC2626]">
                                            {formatRupiah(store.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6 lg:col-span-7">
                    <div className="mb-4 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#7D3394]" />
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Kontribusi Penjualan per Kategori
                            </h3>
                            <p className="text-xs text-gray-500">
                                Distribusi unit terjual dan omzet per kategori
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[460px] border-collapse text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-xs text-gray-600">
                                    <th className="py-2.5 pr-3 font-semibold">
                                        Kategori
                                    </th>
                                    <th className="px-3 py-2.5 text-right font-semibold">
                                        Produk
                                    </th>
                                    <th className="px-3 py-2.5 text-right font-semibold">
                                        Terjual
                                    </th>
                                    <th className="px-3 py-2.5 text-right font-semibold">
                                        Kontribusi
                                    </th>
                                    <th className="py-2.5 pl-3 text-right font-semibold">
                                        Omzet
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-normal">
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="text-gray-700"
                                    >
                                        <td className="py-2.5 pr-3 text-gray-900">
                                            {category.name}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            {category.products_count}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            {category.items_sold.toLocaleString(
                                                'id-ID',
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-gray-600">
                                            {category.revenue_share}%
                                        </td>
                                        <td className="py-2.5 pl-3 text-right font-bold text-[#DC2626]">
                                            {formatRupiah(category.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6 lg:col-span-5">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-900">
                            Toko UMKM Belum Bertransaksi
                        </h3>
                        <p className="text-xs text-gray-500">
                            Daftar toko dengan 0 pesanan valid di periode ini
                            untuk bahan pendampingan koperasi
                        </p>
                    </div>

                    {inactiveStores.length === 0 ? (
                        <p className="py-4 text-xs text-gray-500">
                            Seluruh toko UMKM sudah mencatat transaksi pada
                            periode ini.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100 text-xs">
                            {inactiveStores.map((store) => (
                                <li
                                    key={store.id}
                                    className="flex items-center justify-between gap-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-gray-900">
                                            {store.name}
                                        </p>
                                        <p className="truncate text-gray-500">
                                            {store.location}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-gray-500">
                                        {store.active_products_count} produk
                                        aktif
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
