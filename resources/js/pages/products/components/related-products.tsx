import { Link } from '@inertiajs/react';
import { ChevronRight, Star, Store } from 'lucide-react';
import { StorefrontImage } from '@/components/media';
import { home } from '@/routes';
import { show as showProduct } from '@/routes/products';
import type { RelatedProduct } from '../types';

interface RelatedProductsProps {
    items: RelatedProduct[];
}

export function RelatedProducts({ items }: RelatedProductsProps) {
    if (items.length === 0) {
        return null;
    }

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <section className="w-full pt-8 pb-12">
            <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#7D3394]">
                        Katalog Kuliner Pilihan
                    </span>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#1F2937] sm:text-2xl">
                        Menu Lainnya dari UMKM Bogor
                    </h2>
                    <p className="text-xs text-gray-500 sm:text-sm">
                        Pilihan favorit lauk siap saji &amp; frozen food
                        higienis binaan resmi Kossuma.
                    </p>
                </div>
                <Link
                    href={home()}
                    className="flex w-fit cursor-pointer items-center gap-1 text-xs font-bold text-[#7D3394] sm:text-sm"
                >
                    <span>Lihat Semua Produk Binaan</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {items.map((prod) => (
                    <div
                        key={prod.id}
                        className="flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs"
                    >
                        <div>
                            <Link
                                href={showProduct({ slug: prod.slug })}
                                className="relative block aspect-square w-full cursor-pointer overflow-hidden bg-gray-100"
                            >
                                <StorefrontImage
                                    src={prod.imageUrl}
                                    fallbackSrc={prod.imageFullUrl}
                                    alt={prod.imageAlt}
                                    emptyLabel="Foto Produk"
                                />
                            </Link>

                            <div className="flex flex-col gap-2 p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-[#F0E6F5] px-2 py-0.5 text-[10px] font-bold text-[#7D3394]">
                                        {prod.badge}
                                    </span>
                                    {prod.rating > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                            <span>
                                                {prod.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={showProduct({ slug: prod.slug })}
                                    className="line-clamp-2 cursor-pointer text-xs leading-snug font-normal text-gray-900 sm:text-sm"
                                >
                                    {prod.name}
                                </Link>

                                <div className="flex items-center gap-1 truncate text-[11px] text-gray-500">
                                    <Store className="h-3 w-3 shrink-0 text-gray-400" />
                                    <span className="truncate">
                                        {prod.storeName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-baseline justify-between border-t border-gray-50 px-3 pt-1 pb-3 sm:px-4 sm:pb-4">
                            <span className="text-sm font-extrabold text-[#DC2626] sm:text-base">
                                {formatRupiah(prod.price)}
                            </span>
                            <span className="text-[11px] text-gray-500">
                                {prod.portion}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
