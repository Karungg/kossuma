import { Link } from '@inertiajs/react';
import { Star, Store } from 'lucide-react';
import { StorefrontImage } from '@/components/media';
import { show as showProduct } from '@/routes/products';
import type { CatalogProduct } from '../types';

interface ProductCardProps {
    product: CatalogProduct;
    priority?: boolean;
}

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
    const hasRating = product.rating > 0;
    const hasSoldCount = product.soldCount.trim() !== '';

    return (
        <article className="flex h-full flex-col border-0 bg-transparent shadow-none">
            <Link
                href={showProduct({ slug: product.slug })}
                className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-md bg-gray-100/80 sm:rounded-lg"
            >
                <StorefrontImage
                    src={product.imageUrl}
                    fallbackSrc={product.imageFullUrl}
                    alt={product.imageAlt}
                    priority={priority}
                    emptyLabel="Foto Produk"
                />

                {product.isPreorder && (
                    <span className="absolute top-2 left-2 rounded border border-[#E2C9EB] bg-[#F0E6F5]/95 px-2 py-0.5 text-[10px] font-bold text-[#7D3394] shadow-2xs">
                        {product.preorderDays
                            ? `Pre-order ${product.preorderDays} hari`
                            : 'Pre-order'}
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col justify-between gap-1.5 pt-2 sm:pt-2.5">
                <Link
                    href={showProduct({ slug: product.slug })}
                    className="line-clamp-2 cursor-pointer text-xs leading-snug font-normal text-gray-900 sm:text-sm"
                    title={product.title}
                >
                    {product.title}
                </Link>

                <div className="flex flex-col gap-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm font-extrabold tracking-tight text-[#DC2626] sm:text-base">
                            {formatRupiah(product.price)}
                        </span>
                        {product.originalPrice &&
                            product.originalPrice > product.price && (
                                <span className="text-[11px] text-gray-400 line-through">
                                    {formatRupiah(product.originalPrice)}
                                </span>
                            )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        {hasRating ? (
                            <div className="flex items-center text-amber-500">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="ml-0.5 font-medium text-gray-800">
                                    {product.rating.toFixed(1)}
                                </span>
                            </div>
                        ) : null}

                        {hasRating && hasSoldCount ? (
                            <span className="text-gray-300">•</span>
                        ) : null}

                        {hasSoldCount ? (
                            <span className="truncate">
                                {product.soldCount}
                            </span>
                        ) : !hasRating ? (
                            <span className="text-gray-400">Produk baru</span>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-1 truncate pt-0.5 text-[11px] text-gray-400">
                        <Store className="h-3 w-3 shrink-0 text-gray-400" />
                        <span className="truncate">
                            {product.storeName} • {product.storeDistrict}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export function ProductCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="flex h-full flex-col border-0 bg-transparent shadow-none"
        >
            <div className="aspect-square w-full animate-pulse rounded-md bg-gray-200/80 sm:rounded-lg" />
            <div className="flex flex-1 flex-col gap-2 pt-2.5">
                <div className="h-3.5 w-full animate-pulse rounded bg-gray-200/80" />
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200/70" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200/90" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200/60" />
            </div>
        </div>
    );
}
