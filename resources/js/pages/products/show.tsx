import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { home } from '@/routes';
import { GalleryShowcase } from './components/gallery-showcase';
import { ProductInfoPanel } from './components/product-info-panel';
import { ProductAccordions } from './components/product-accordions';
import { PurchaseActionPod } from './components/purchase-action-pod';
import { ProductReviews } from './components/product-reviews';
import { RelatedProducts } from './components/related-products';
import { HomeLayout } from '@/layouts/home-layout';
import type { ProductDetail } from './types';

interface ProductShowPageProps {
    product: ProductDetail;
}

export default function ProductShowPage({ product }: ProductShowPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(2);

    const handleAddToCart = (qty: number) => {
        setCartCount((prev) => prev + qty);
    };

    return (
        <HomeLayout
            cartCount={cartCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        >
            <Head title={`${product.name} - Kossuma Kota Bogor`}>
                <meta
                    name="description"
                    content={product.description}
                />
            </Head>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
                {/* Breadcrumbs & Quick Back */}
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-[#7D3394] text-xs font-bold shrink-0 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <nav
                            aria-label="Breadcrumb"
                            className="hidden md:flex items-center gap-2 text-xs text-gray-500 min-w-0"
                        >
                            <span className="text-gray-300">/</span>
                            <Link href={home()} className="cursor-pointer">
                                Beranda
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-600">
                                {product.category}
                            </span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-900 font-semibold truncate">
                                {product.name}
                            </span>
                        </nav>
                    </div>
                </div>

                {/* Container Luar 12 Kolom: Kolom Utama (9) + Kartu Pembelian Kanan Sticky hingga Ulasan (3) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Kolom Utama Kiri (9 Kolom): Sub-grid Foto+Info di atas, lalu Section Ulasan di bawah */}
                    <div className="lg:col-span-9 flex flex-col gap-10">
                        {/* Sub-grid 9 Kolom: Foto Sticky (4) + Info Produk Tengah (5) */}
                        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 items-start">
                            {/* Kolom Kiri: Galeri Foto Sticky (berhenti tepat sebelum bagian Ulasan) */}
                            <div className="lg:col-span-4 lg:sticky lg:top-[132px] lg:self-start">
                                <GalleryShowcase
                                    key={product.slug}
                                    images={product.images}
                                />
                            </div>

                            {/* Kolom Tengah: Informasi Produk, Tab Detail & Deskripsi, Profil UMKM */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                <ProductInfoPanel product={product} />

                                {/* Kartu Pembelian khusus Mobile (tampil sebelum ulasan pada layar kecil) */}
                                <div className="block lg:hidden">
                                    <PurchaseActionPod
                                        key={`${product.slug}-mobile`}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                </div>

                                <ProductAccordions
                                    composition={product.composition}
                                    cookingInstructions={product.cookingInstructions}
                                    halalAudit={product.halalAudit}
                                />
                            </div>
                        </div>

                        {/* Section Ulasan Produk (Foto berhenti di atas sini, Kartu Kanan tetap sticky di sampingnya) */}
                        <ProductReviews
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                            reviews={product.reviews ?? []}
                        />
                    </div>

                    {/* Kolom Kanan Desktop (3 Kolom): Kartu Stok, Harga, Keranjang Sticky hingga akhir Ulasan */}
                    <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-[132px] lg:self-start">
                        <PurchaseActionPod
                            key={`${product.slug}-desktop`}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    </div>
                </div>

                {/* Related Products (Di luar container luar, titik akhir sticky kartu kanan) */}
                <RelatedProducts items={product.relatedProducts} />
            </div>
        </HomeLayout>
    );
}
