import { Link } from '@inertiajs/react';
import { Loader2, Plus } from 'lucide-react';
import { StorefrontImage } from '@/components/media';
import { home } from '@/routes';
import { show as showProduct } from '@/routes/products';
import type { RecommendationProduct } from '../types';

interface CartRecommendationsProps {
    items: RecommendationProduct[];
    addingProductId: number | null;
    onAddToCart: (product: RecommendationProduct) => void;
}

export function CartRecommendations({
    items,
    addingProductId,
    onAddToCart,
}: CartRecommendationsProps) {
    if (items.length === 0) {
        return null;
    }

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                    Pelengkap Belanja Favorit
                </h3>
                <Link
                    href={home()}
                    className="cursor-pointer text-xs font-semibold text-[#7D3394] sm:text-sm"
                >
                    Lihat Lainnya
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map((product) => {
                    const isAdding = addingProductId === product.productId;

                    return (
                        <div
                            key={product.id}
                            className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-xs"
                        >
                            <div>
                                <Link
                                    href={showProduct({ slug: product.slug })}
                                    className="mb-2 block aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                                >
                                    <StorefrontImage
                                        src={product.imageUrl}
                                        fallbackSrc={product.imageFullUrl}
                                        alt={product.imageAlt}
                                        emptyLabel="Foto Produk"
                                    />
                                </Link>

                                <div className="flex flex-col gap-1">
                                    <span className="truncate text-[11px] font-medium text-[#7D3394]">
                                        {product.storeName}
                                    </span>
                                    <Link
                                        href={showProduct({
                                            slug: product.slug,
                                        })}
                                        className="line-clamp-2 cursor-pointer text-xs leading-snug font-normal text-gray-900 sm:text-sm"
                                    >
                                        {product.name}
                                    </Link>
                                    <span className="text-sm font-extrabold text-[#DC2626]">
                                        {formatRupiah(product.price)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={isAdding}
                                onClick={() => onAddToCart(product)}
                                className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#F0E6F5] py-1.5 text-xs font-bold text-[#7D3394] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isAdding ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Plus className="h-3.5 w-3.5" />
                                )}
                                <span>
                                    {isAdding ? 'Menambah...' : 'Keranjang'}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
