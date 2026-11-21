import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { HomeLayout } from '@/layouts/home-layout';
import { home } from '@/routes';
import { GalleryShowcase } from './components/gallery-showcase';
import { ProductAccordions } from './components/product-accordions';
import { ProductInfoPanel } from './components/product-info-panel';
import { ProductReviews } from './components/product-reviews';
import { PurchaseActionPod } from './components/purchase-action-pod';
import { RelatedProducts } from './components/related-products';
import type { ProductDetail } from './types';

interface ProductShowPageProps {
    product: ProductDetail;
}

export default function ProductShowPage({ product }: ProductShowPageProps) {
    const [cartCount, setCartCount] = useState(2);

    const handleAddToCart = (qty: number) => {
        setCartCount((prev) => prev + qty);
    };

    return (
        <HomeLayout cartCount={cartCount}>
            <Head title={`${product.name} - Kossuma Kota Bogor`}>
                <meta name="description" content={product.description} />
            </Head>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-2xs">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href={home()}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-[#7D3394]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <nav
                            aria-label="Breadcrumb"
                            className="hidden min-w-0 items-center gap-2 text-xs text-gray-500 md:flex"
                        >
                            <span className="text-gray-300">/</span>
                            <Link href={home()} className="cursor-pointer">
                                Beranda
                            </Link>
                            <span className="text-gray-300">/</span>
                            <Link
                                href={home({
                                    query: { category: product.categorySlug },
                                })}
                                className="cursor-pointer text-gray-600"
                            >
                                {product.category}
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="truncate font-semibold text-gray-900">
                                {product.name}
                            </span>
                        </nav>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    <div className="flex flex-col gap-10 lg:col-span-9">
                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-9">
                            <div className="lg:sticky lg:top-[132px] lg:col-span-4 lg:self-start">
                                <GalleryShowcase
                                    key={product.slug}
                                    images={product.images}
                                />
                            </div>

                            <div className="flex flex-col gap-6 lg:col-span-5">
                                <ProductInfoPanel product={product} />

                                <div className="block lg:hidden">
                                    <PurchaseActionPod
                                        key={`${product.slug}-mobile`}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                </div>

                                <ProductAccordions
                                    composition={product.composition}
                                    cookingInstructions={
                                        product.cookingInstructions
                                    }
                                    halalAudit={product.halalAudit}
                                />
                            </div>
                        </div>

                        <ProductReviews
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                            reviews={product.reviews ?? []}
                        />
                    </div>

                    <div className="hidden lg:sticky lg:top-[132px] lg:col-span-3 lg:block lg:self-start">
                        <PurchaseActionPod
                            key={`${product.slug}-desktop`}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    </div>
                </div>

                <RelatedProducts items={product.relatedProducts} />
            </div>
        </HomeLayout>
    );
}
