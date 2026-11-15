import { useState, useMemo, useEffect } from 'react';
import { HeroBanner } from './components/hero-banner';
import { CategoryTabs } from './components/category-tabs';
import { ProductCard } from './components/product-card';
import { StorefrontLayout } from '@/layouts/storefront-layout';
import { Search } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from './data';

const INITIAL_PAGE_SIZE = 18;

export function StorefrontHomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

    // Reset pagination ketika kategori atau pencarian berubah
    useEffect(() => {
        setVisibleCount(INITIAL_PAGE_SIZE);
    }, [activeCategory, searchQuery]);

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((product) => {
            const matchesCategory =
                activeCategory === 'all' || product.category === activeCategory;
            const matchesSearch =
                searchQuery.trim() === '' ||
                product.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (product.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ??
                    false) ||
                product.storeName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    const displayedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const hasMore = visibleCount < filteredProducts.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + INITIAL_PAGE_SIZE);
    };

    return (
        <StorefrontLayout
            cartCount={2}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        >
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
                {/* Hero Banner */}
                <HeroBanner />

                {/* Category Filter Tabs */}
                <CategoryTabs
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                {/* Product Grid Section (Grid 6 Kolom di Layar Lebar) */}
                <section className="flex flex-col gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center gap-3">
                            <Search className="w-12 h-12 text-gray-300" />
                            <h3 className="text-lg font-bold text-gray-900">
                                Tidak ada produk yang cocok
                            </h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                                Coba ubah kata kunci pencarian atau pilih kategori lainnya.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Grid 6 Kolom Responsif: 2 kolom di mobile, 3 di sm, 4 di md, 5 di lg, 6 di xl */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                                {displayedProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>

                            {/* Tombol Muat Lebih Banyak (Muncul 18 produk lagi berulang kali hingga habis) */}
                            <div className="flex flex-col items-center justify-center gap-2 pt-4 pb-6">
                                {hasMore ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleLoadMore}
                                            className="px-8 py-3 rounded-full bg-[#F0E6F5] text-[#7D3394] text-xs sm:text-sm font-bold border border-[#E2C9EB] cursor-pointer shadow-2xs"
                                        >
                                            Muat Lebih Banyak
                                        </button>
                                        <span className="text-xs text-gray-400">
                                            Menampilkan {displayedProducts.length} dari {filteredProducts.length} produk
                                        </span>
                                    </>
                                ) : (
                                    filteredProducts.length > INITIAL_PAGE_SIZE && (
                                        <span className="text-xs text-gray-400">
                                            Semua produk telah ditampilkan ({filteredProducts.length} produk)
                                        </span>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </StorefrontLayout>
    );
}
