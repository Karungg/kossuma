import { useState } from 'react';
import { CheckCircle2, MapPin, ShieldCheck, Star, Store, Truck } from 'lucide-react';
import type { ProductDetail } from '../types';

interface ProductInfoPanelProps {
    product: ProductDetail;
}

type InfoTab = 'detail' | 'cara-masak' | 'info-penting';

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
    const [activeTab, setActiveTab] = useState<InfoTab>('detail');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-5">
            {/* Judul & Statistik Penjualan */}
            <div className="flex flex-col gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight leading-snug">
                    {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                    {product.soldCount && (
                        <>
                            <span>
                                Terjual <strong className="text-gray-900">{product.soldCount}</strong>
                            </span>
                            <span className="text-gray-300">•</span>
                        </>
                    )}
                    <div className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="font-bold text-gray-900">{product.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({product.reviewCount} ulasan)</span>
                    </div>
                </div>
            </div>

            {/* Harga Utama & Diskon */}
            <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] tracking-tight">
                    {formatRupiah(product.price)}
                </div>
                {product.originalPrice > 0 && product.discountPercent > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-red-50 text-[#DC2626] text-xs font-bold">
                            {product.discountPercent}%
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                            {formatRupiah(product.originalPrice)}
                        </span>
                    </div>
                )}
            </div>

            {/* Tab Navigasi Konten */}
            <div className="flex flex-col">
                <div className="flex items-center gap-6 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('detail')}
                        className={`pb-2.5 text-sm font-bold cursor-pointer border-b-2 transition-colors ${
                            activeTab === 'detail'
                                ? 'border-[#7D3394] text-[#7D3394]'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        Detail Produk
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('cara-masak')}
                        className={`pb-2.5 text-sm font-bold cursor-pointer border-b-2 transition-colors ${
                            activeTab === 'cara-masak'
                                ? 'border-[#7D3394] text-[#7D3394]'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        Komposisi &amp; Masak
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('info-penting')}
                        className={`pb-2.5 text-sm font-bold cursor-pointer border-b-2 transition-colors ${
                            activeTab === 'info-penting'
                                ? 'border-[#7D3394] text-[#7D3394]'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        Info Penting
                    </button>
                </div>

                {/* Konten Tab 1: Detail Produk */}
                {activeTab === 'detail' && (
                    <div className="pt-4 flex flex-col gap-4 text-sm text-gray-700">
                        {/* Tabel Spesifikasi Ringkas */}
                        <dl className="flex flex-col gap-2 text-xs sm:text-sm">
                            <div className="flex gap-2">
                                <dt className="w-28 text-gray-500 shrink-0">Kondisi:</dt>
                                <dd className="font-medium text-gray-900">Baru &amp; Segar</dd>
                            </div>
                            {product.weight && (
                                <div className="flex gap-2">
                                    <dt className="w-28 text-gray-500 shrink-0">Berat Satuan:</dt>
                                    <dd className="font-medium text-gray-900">{product.weight}</dd>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <dt className="w-28 text-gray-500 shrink-0">Min. Pemesanan:</dt>
                                <dd className="font-medium text-gray-900">1 Pack</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="w-28 text-gray-500 shrink-0">Kategori:</dt>
                                <dd className="font-semibold text-[#7D3394]">{product.category}</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="w-28 text-gray-500 shrink-0">Etalase:</dt>
                                <dd className="font-semibold text-[#7D3394]">Produk UMKM Kossuma</dd>
                            </div>
                        </dl>

                        {/* Deskripsi Produk */}
                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                            <p
                                className={`text-sm text-gray-700 leading-relaxed ${
                                    isDescriptionExpanded ? '' : 'line-clamp-3'
                                }`}
                            >
                                {product.description}
                            </p>

                            {isDescriptionExpanded && (
                                <div className="flex flex-col gap-3 pt-2">
                                    {product.specifications.map((spec, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-0.5"
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
                            )}

                            <button
                                type="button"
                                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                                className="text-xs sm:text-sm font-bold text-[#7D3394] w-fit cursor-pointer"
                            >
                                {isDescriptionExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Konten Tab 2: Komposisi & Masak */}
                {activeTab === 'cara-masak' && (
                    <div className="pt-4 flex flex-col gap-4 text-sm text-gray-700 leading-relaxed">
                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-sm font-bold text-gray-900">
                                Komposisi &amp; Bumbu Rempah
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">{product.composition}</p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                            <h3 className="text-sm font-bold text-gray-900">
                                Saran Penyajian Praktis
                            </h3>
                            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
                                {product.cookingInstructions.map((instruction, idx) => (
                                    <li
                                        key={idx}
                                        dangerouslySetInnerHTML={{ __html: instruction }}
                                    />
                                ))}
                            </ol>
                        </div>
                    </div>
                )}

                {/* Konten Tab 3: Info Penting */}
                {activeTab === 'info-penting' && (
                    <div className="pt-4 flex flex-col gap-4 text-sm text-gray-700 leading-relaxed">
                        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                    Jaminan Mutu &amp; Halal
                                </span>
                                <p className="text-xs text-gray-600">{product.halalAudit}</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F0E6F5]/60 border border-[#E2C9EB] flex items-start gap-2.5">
                            <Truck className="w-5 h-5 text-[#7D3394] shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                    Informasi Pengiriman
                                </span>
                                <p className="text-xs text-gray-600">{product.shippingFastInfo}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profil Toko UMKM Produsen */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center shrink-0 border border-[#E2C9EB]">
                        <Store className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900 truncate">
                                {product.producer.name}
                            </span>
                            {product.producer.verified && (
                                <span title="UMKM Terverifikasi" className="inline-flex shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-[#7D3394]" />
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            {product.producer.district}, {product.producer.city}
                        </span>
                    </div>
                </div>

                <a
                    href="#ulasan-produk"
                    className="px-4 py-1.5 rounded-lg border border-[#7D3394] text-[#7D3394] font-bold text-xs shrink-0 cursor-pointer"
                >
                    Lihat Ulasan
                </a>
            </div>
        </div>
    );
}
