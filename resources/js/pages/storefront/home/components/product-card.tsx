import { Star, Store } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { show as showProduct } from '@/routes/products';
import type { CatalogProduct } from '../types';

interface ProductCardProps {
    product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <article className="flex flex-col bg-white rounded-xl overflow-hidden shadow-xs border border-gray-100">
            {/* 1:1 Aspect Ratio Clean Photo */}
            <Link
                href={showProduct({ slug: product.slug })}
                className="relative w-full aspect-square bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer"
            >
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.imageAlt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <span className="text-gray-400 text-xs font-medium">Foto Produk</span>
                )}
            </Link>

            {/* Content Details */}
            <div className="p-3 md:p-4 flex flex-col flex-1 justify-between gap-2.5">
                <div className="flex flex-col gap-1.5">
                    <Link
                        href={showProduct({ slug: product.slug })}
                        className="text-sm md:text-base font-bold text-[#1F2937] line-clamp-2 leading-snug cursor-pointer"
                        title={product.title}
                    >
                        {product.title}
                    </Link>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                    {/* Price Row */}
                    <div className="flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-extrabold text-[#DC2626] tracking-tight">
                            {formatRupiah(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                                {formatRupiah(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Rating & Sold Count */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span className="font-semibold text-gray-900 ml-1">
                                {product.rating}
                            </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span>{product.soldCount}</span>
                    </div>

                    {/* Store Name & Location */}
                    <div className="flex items-center gap-1 text-gray-500 text-xs truncate pt-0.5 border-t border-gray-50">
                        <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                            {product.storeName} — {product.storeDistrict}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
