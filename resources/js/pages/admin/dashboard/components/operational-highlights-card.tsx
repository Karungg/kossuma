import { Link } from '@inertiajs/react';
import { ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import { index as ordersIndex } from '@/routes/admin/orders';
import {
    edit as productEdit,
    index as productsIndex,
} from '@/routes/admin/products';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import type { DashboardHighlights } from '../types';

type HighlightTab = 'top_products' | 'low_stock' | 'top_stores' | 'reviews';

type Props = {
    highlights: DashboardHighlights;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function OperationalHighlightsCard({ highlights }: Props) {
    const [activeTab, setActiveTab] = useState<HighlightTab>('top_products');

    const tabs: Array<{ key: HighlightTab; label: string; count?: number }> = [
        { key: 'top_products', label: 'Terlaris' },
        {
            key: 'low_stock',
            label: 'Stok Menipis',
            count: highlights.lowStockProducts.length,
        },
        { key: 'top_stores', label: 'Toko UMKM' },
        { key: 'reviews', label: 'Ulasan' },
    ];

    return (
        <section className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-xs">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-gray-900">
                        Pantauan Katalog & Toko
                    </h2>
                    {activeTab === 'top_products' && (
                        <Link
                            href={productsIndex.url({
                                query: {
                                    sort: 'sold_count',
                                    direction: 'desc',
                                },
                            })}
                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                        >
                            Kelola Produk
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                    {activeTab === 'low_stock' && (
                        <Link
                            href={productsIndex.url({
                                query: { sort: 'stock', direction: 'asc' },
                            })}
                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                        >
                            Cek Stok
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                    {activeTab === 'top_stores' && (
                        <Link
                            href={ordersIndex.url()}
                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                        >
                            Semua Transaksi
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                    {activeTab === 'reviews' && (
                        <Link
                            href={reviewsIndex.url()}
                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#7D3394]"
                        >
                            Kelola Ulasan
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>

                <div
                    role="tablist"
                    aria-label="Kategori pantauan operasional"
                    className="flex flex-wrap gap-1.5"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.key)}
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                                    isActive
                                        ? 'border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]'
                                        : 'border border-transparent bg-gray-100 text-gray-600'
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-[#DC2626] tabular-nums">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {activeTab === 'top_products' &&
                    (highlights.topProducts.length === 0 ? (
                        <EmptyPanel message="Belum ada data penjualan produk." />
                    ) : (
                        highlights.topProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={productEdit.url(product.id)}
                                className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
                                    )}
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-sm text-gray-900">
                                            {product.name}
                                        </span>
                                        <span className="truncate text-[11px] text-gray-400">
                                            {product.store_name} • Sisa stok{' '}
                                            {product.stock.toLocaleString(
                                                'id-ID',
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-0.5 tabular-nums">
                                    <span className="text-xs font-bold text-gray-900">
                                        {product.sold_qty.toLocaleString(
                                            'id-ID',
                                        )}{' '}
                                        terjual
                                    </span>
                                    <span className="text-[11px] font-medium text-[#DC2626]">
                                        {formatRupiah(product.revenue)}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ))}

                {activeTab === 'low_stock' &&
                    (highlights.lowStockProducts.length === 0 ? (
                        <EmptyPanel message="Semua produk aktif memiliki stok yang aman." />
                    ) : (
                        highlights.lowStockProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={productEdit.url(product.id)}
                                className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
                                    )}
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-sm text-gray-900">
                                            {product.name}
                                        </span>
                                        <span className="truncate text-[11px] text-gray-400">
                                            {product.store_name} •{' '}
                                            {formatRupiah(product.price)}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${
                                        product.stock === 0
                                            ? 'bg-red-50 text-[#DC2626]'
                                            : 'bg-amber-50 text-amber-700'
                                    }`}
                                >
                                    {product.stock === 0
                                        ? 'Stok Habis'
                                        : `Sisa ${product.stock}`}
                                </span>
                            </Link>
                        ))
                    ))}

                {activeTab === 'top_stores' &&
                    (highlights.topStores.length === 0 ? (
                        <EmptyPanel message="Belum ada transaksi toko UMKM pada periode ini." />
                    ) : (
                        highlights.topStores.map((store, index) => (
                            <Link
                                key={store.id}
                                href={ordersIndex.url({
                                    query: { store_id: store.id },
                                })}
                                className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0E6F5] text-xs font-bold text-[#7D3394] tabular-nums">
                                        {index + 1}
                                    </span>
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-sm text-gray-900">
                                            {store.name}
                                        </span>
                                        <span className="truncate text-[11px] text-gray-400">
                                            {store.location} •{' '}
                                            {store.orders_count.toLocaleString(
                                                'id-ID',
                                            )}{' '}
                                            pesanan
                                        </span>
                                    </div>
                                </div>
                                <span className="shrink-0 text-sm font-extrabold text-[#DC2626] tabular-nums">
                                    {formatRupiah(store.revenue)}
                                </span>
                            </Link>
                        ))
                    ))}

                {activeTab === 'reviews' &&
                    (highlights.recentReviews.length === 0 ? (
                        <EmptyPanel message="Belum ada ulasan pembeli yang tampil." />
                    ) : (
                        highlights.recentReviews.map((review) => (
                            <Link
                                key={review.id}
                                href={reviewsIndex.url({
                                    query: review.has_reply
                                        ? {}
                                        : { reply_status: 'unreplied' },
                                })}
                                className="flex cursor-pointer flex-col gap-1.5 px-5 py-3.5 sm:px-6"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-xs font-medium text-gray-900">
                                        {review.product_name}
                                    </span>
                                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-amber-600 tabular-nums">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        {review.rating}
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-xs text-gray-600">
                                    {review.comment}
                                </p>
                                <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400">
                                    <span className="truncate">
                                        {review.author_name} •{' '}
                                        {review.relative_time}
                                    </span>
                                    <span
                                        className={
                                            review.has_reply
                                                ? 'text-emerald-600'
                                                : 'text-[#7D3394]'
                                        }
                                    >
                                        {review.has_reply
                                            ? 'Sudah dibalas'
                                            : 'Belum dibalas'}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ))}
            </div>
        </section>
    );
}

function EmptyPanel({ message }: { message: string }) {
    return (
        <div className="px-6 py-10 text-center text-xs text-gray-400">
            {message}
        </div>
    );
}
