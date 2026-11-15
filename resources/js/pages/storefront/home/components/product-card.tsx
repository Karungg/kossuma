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
        <article className="flex flex-col h-full bg-transparent border-0 shadow-none">
            {/* Foto Produk (Rasio 1:1, Rounded Halus, Menyatu dengan Latar) */}
            <Link
                href={showProduct({ slug: product.slug })}
                className="relative w-full aspect-square bg-gray-100/80 rounded-md sm:rounded-lg overflow-hidden flex items-center justify-center cursor-pointer block"
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

                {/* Penanda Pre-order */}
                {product.isPreorder && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#F0E6F5]/95 text-[#7D3394] border border-[#E2C9EB] text-[10px] font-bold shadow-2xs">
                        {product.preorderDays ? `Pre-order ${product.preorderDays} hari` : 'Pre-order'}
                    </span>
                )}
            </Link>

            {/* Area Teks & Informasi Produk */}
            <div className="pt-2 sm:pt-2.5 flex flex-col flex-1 justify-between gap-1.5">
                {/* Judul Produk */}
                <Link
                    href={showProduct({ slug: product.slug })}
                    className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug cursor-pointer"
                    title={product.title}
                >
                    {product.title}
                </Link>

                {/* Detail Harga, Rating & Toko */}
                <div className="flex flex-col gap-1 pt-0.5">
                    {/* Baris Harga (Bersebelahan) */}
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-[#DC2626] tracking-tight">
                            {formatRupiah(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > 0 && (
                            <span className="text-[11px] text-gray-400 line-through">
                                {formatRupiah(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Rating & Jumlah Terjual */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <div className="flex items-center text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-gray-800 ml-0.5">
                                {product.rating}
                            </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="truncate">{product.soldCount}</span>
                    </div>

                    {/* Nama Toko UMKM & Kecamatan */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate pt-0.5">
                        <Store className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">
                            {product.storeName} • {product.storeDistrict}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
