import { CheckCircle2, MapPin, Star, Store, Truck } from 'lucide-react';
import type { ProductDetail } from '../types';

interface ProductInfoPanelProps {
    product: ProductDetail;
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-5">
            {/* Metadata Header: Rating & Sales */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-900 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-gray-500 font-normal">
                        ({product.reviewCount} ulasan)
                    </span>
                </div>
                <span className="text-xs font-bold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-full">
                    {product.stockStatus}
                </span>
            </div>

            {/* Product Name & Description */}
            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
                    {product.name}
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                </p>
            </div>

            {/* Highlighted Pricing Container (Soft-red tint background #FEF2F2) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FEF2F2] border border-red-100 text-gray-900 flex flex-col gap-2.5 shadow-2xs">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl font-extrabold text-[#DC2626] tracking-tight">
                            {formatRupiah(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {formatRupiah(product.originalPrice)}
                            </span>
                        )}
                        {product.discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-xs font-bold">
                                Hemat {product.discountPercent}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm text-gray-700 border-t border-red-200/50">
                    <Truck className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>
                        Pengiriman Cepat:{' '}
                        <strong>Sameday &amp; Instant</strong> seluruh wilayah Kota &amp; Kab Bogor.
                    </span>
                </div>
            </div>

            {/* UMKM Producer Profile Strip */}
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#7D3394] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Store className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#7D3394]">
                            Produsen Muslimah Binaan
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm sm:text-base font-bold text-gray-900">
                                {product.producer.name}
                            </span>
                            {product.producer.verified && (
                                <span title="UMKM Terverifikasi" className="inline-flex">
                                    <CheckCircle2 className="w-4 h-4 text-[#7D3394]" />
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {product.producer.district}, {product.producer.city} • Aktif {product.producer.activeYears} thn
                        </span>
                    </div>
                </div>

                <a
                    href="#dapur-umkm"
                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-xs text-center cursor-pointer"
                >
                    Kunjungi Dapur UMKM
                </a>
            </div>

            {/* Key Specifications Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {product.specifications.map((spec, idx) => (
                    <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-gray-100 shadow-2xs flex flex-col gap-0.5"
                    >
                        <span className="text-xs font-bold text-gray-500">
                            {spec.title}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                            {spec.value}
                        </span>
                        <span className="text-xs text-gray-500">
                            {spec.description}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
