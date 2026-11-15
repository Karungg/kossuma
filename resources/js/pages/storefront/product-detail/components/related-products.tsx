import { ChevronRight, Star, Store } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import { show as showProduct } from '@/routes/products';
import type { RelatedProduct } from '../types';

interface RelatedProductsProps {
    items: RelatedProduct[];
}

export function RelatedProducts({ items }: RelatedProductsProps) {
    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <section className="w-full pt-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#7D3394]">
                        Katalog Kuliner Pilihan
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight">
                        Menu Lainnya dari UMKM Bogor
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Pilihan favorit lauk siap saji &amp; frozen food higienis binaan resmi Kossuma.
                    </p>
                </div>
                <Link
                    href={home()}
                    className="text-xs sm:text-sm font-bold text-[#7D3394] flex items-center gap-1 w-fit cursor-pointer"
                >
                    <span>Lihat Semua Produk Binaan</span>
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* 4-Card Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((prod) => (
                    <div
                        key={prod.id}
                        className="bg-white rounded-xl overflow-hidden shadow-xs border border-gray-100 flex flex-col justify-between"
                    >
                        <div>
                            <Link
                                href={showProduct({ slug: prod.slug })}
                                className="w-full aspect-square overflow-hidden bg-gray-100 relative flex items-center justify-center cursor-pointer block"
                            >
                                {prod.imageUrl ? (
                                    <img
                                        src={prod.imageUrl}
                                        alt={prod.imageAlt}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs font-medium">Foto Produk</span>
                                )}
                            </Link>

                            <div className="p-3 sm:p-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded-full bg-[#F0E6F5] text-[#7D3394] text-[10px] font-bold">
                                        {prod.badge}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                        <span>{prod.rating.toFixed(1)}</span>
                                    </div>
                                </div>

                                <Link
                                    href={showProduct({ slug: prod.slug })}
                                    className="text-xs sm:text-sm text-gray-900 font-bold line-clamp-2 leading-snug cursor-pointer"
                                >
                                    {prod.name}
                                </Link>

                                <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                                    <Store className="w-3 h-3 text-gray-400 shrink-0" />
                                    <span className="truncate">{prod.storeName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 flex items-baseline justify-between border-t border-gray-50">
                            <span className="text-sm sm:text-base font-extrabold text-[#DC2626]">
                                {formatRupiah(prod.price)}
                            </span>
                            <span className="text-[11px] text-gray-500">{prod.portion}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

