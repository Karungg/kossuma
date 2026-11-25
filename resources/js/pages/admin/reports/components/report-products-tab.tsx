import { Link } from '@inertiajs/react';
import { AlertTriangle, Package, Star } from 'lucide-react';
import { index as adminProductsIndex } from '@/routes/admin/products';
import type { ReportProductsData } from '../types';

type Props = {
    products: ReportProductsData;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function ReportProductsTab({ products }: Props) {
    const { summary, topProducts, zeroSalesProducts, lowStockProducts } =
        products;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">Unit Terjual</span>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {summary.total_units_sold.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[11px] text-gray-400">
                        Dari {summary.sold_products_count} produk aktif terjual
                    </span>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">
                        Produk Belum Terjual
                    </span>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {summary.zero_sales_count.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[11px] text-gray-400">
                        Dari {summary.active_products} produk aktif
                    </span>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">
                        Stok Menipis / Habis
                    </span>
                    <p className="mt-1 text-xl font-extrabold text-[#DC2626]">
                        {summary.low_stock_count + summary.out_of_stock_count}
                    </p>
                    <span className="text-[11px] text-gray-400">
                        Habis: {summary.out_of_stock_count} • Menipis:{' '}
                        {summary.low_stock_count}
                    </span>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <span className="text-xs text-gray-500">
                        Produk Pre-order
                    </span>
                    <p className="mt-1 text-xl font-extrabold text-[#7D3394]">
                        {summary.preorder_count.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[11px] text-gray-400">
                        Total katalog: {summary.total_products} produk
                    </span>
                </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            Produk Terlaris
                        </h2>
                        <p className="text-xs text-gray-500">
                            Diurutkan berdasarkan total omzet produk pada
                            periode terpilih
                        </p>
                    </div>
                    <Link
                        href={adminProductsIndex()}
                        className="cursor-pointer text-xs font-semibold text-[#7D3394]"
                    >
                        Kelola Produk
                    </Link>
                </div>

                {topProducts.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500">
                        Belum ada produk yang terjual pada periode ini.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-xs text-gray-600">
                                    <th className="py-3 pr-3 font-semibold">
                                        Produk &amp; Toko UMKM
                                    </th>
                                    <th className="px-3 py-3 font-semibold">
                                        Kategori
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Terjual
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Omzet
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Kontribusi
                                    </th>
                                    <th className="px-3 py-3 text-right font-semibold">
                                        Sisa Stok
                                    </th>
                                    <th className="py-3 pl-3 text-right font-semibold">
                                        Rating
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-normal">
                                {topProducts.map((item) => (
                                    <tr
                                        key={`${item.id}-${item.slug}`}
                                        className="text-gray-700"
                                    >
                                        <td className="py-3 pr-3">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-gray-900">
                                                        {item.name}
                                                    </span>
                                                    {item.is_preorder && (
                                                        <span className="rounded border border-[#E2C9EB] bg-[#F0E6F5] px-1.5 py-0.5 text-[10px] font-medium text-[#7D3394]">
                                                            {item.preorder_days
                                                                ? `Pre-order ${item.preorder_days} hari`
                                                                : 'Pre-order'}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {item.store_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-gray-600">
                                            {item.category_name}
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            {item.sold_qty.toLocaleString(
                                                'id-ID',
                                            )}{' '}
                                            unit
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-[#DC2626]">
                                            {formatRupiah(item.revenue)}
                                        </td>
                                        <td className="px-3 py-3 text-right text-gray-600">
                                            {item.revenue_share}%
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <span
                                                className={
                                                    item.stock <= 5
                                                        ? 'text-[#DC2626]'
                                                        : 'text-gray-700'
                                                }
                                            >
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="py-3 pl-3 text-right">
                                            <span className="inline-flex items-center gap-1 text-gray-700">
                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                {item.rating_avg.toFixed(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Stok Menipis &amp; Habis
                            </h3>
                            <p className="text-xs text-gray-500">
                                Produk aktif dengan sisa stok 5 atau kurang
                            </p>
                        </div>
                    </div>

                    {lowStockProducts.length === 0 ? (
                        <p className="py-4 text-xs text-gray-500">
                            Seluruh produk aktif memiliki stok aman.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100 text-xs">
                            {lowStockProducts.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-gray-900">
                                            {item.name}
                                        </p>
                                        <p className="truncate text-gray-500">
                                            {item.store_name} •{' '}
                                            {formatRupiah(item.price)}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                            item.stock === 0
                                                ? 'bg-red-50 text-[#DC2626]'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}
                                    >
                                        {item.stock === 0
                                            ? 'Stok Habis'
                                            : `Sisa ${item.stock}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#7D3394]" />
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Produk Belum Terjual di Periode Ini
                            </h3>
                            <p className="text-xs text-gray-500">
                                Bahan evaluasi promosi &amp; kurasi Pilihan Kami
                            </p>
                        </div>
                    </div>

                    {zeroSalesProducts.length === 0 ? (
                        <p className="py-4 text-xs text-gray-500">
                            Seluruh produk aktif sudah mencatat penjualan di
                            periode ini.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100 text-xs">
                            {zeroSalesProducts.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-gray-900">
                                            {item.name}
                                        </p>
                                        <p className="truncate text-gray-500">
                                            {item.store_name} •{' '}
                                            {item.category_name}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="font-semibold text-[#DC2626]">
                                            {formatRupiah(item.price)}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            Stok: {item.stock}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
