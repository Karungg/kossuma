import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Loader2,
    PackageOpen,
    RefreshCw,
    RotateCcw,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HomeLayout } from '@/layouts/home-layout';
import { home } from '@/routes';
import { CategoryTabs } from './components/category-tabs';
import { HeroBanner } from './components/hero-banner';
import { ProductCard, ProductCardSkeleton } from './components/product-card';
import type {
    CatalogPageData,
    CatalogProduct,
    CategoryTab,
    HomeFilters,
} from './types';

interface HomePageProps {
    categories: CategoryTab[];
    catalog: CatalogPageData;
    filters: HomeFilters;
    hasAnyProducts: boolean;
}

const FILTER_SKELETON_COUNT = 12;
const LOAD_MORE_SKELETON_COUNT = 6;
const SEARCH_DEBOUNCE_MS = 320;

function mergeUniqueProducts(
    previous: CatalogProduct[],
    incoming: CatalogProduct[],
): CatalogProduct[] {
    const seen = new Set(previous.map((item) => item.id));
    const merged = [...previous];

    for (const item of incoming) {
        if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
        }
    }

    return merged;
}

export default function HomePage({
    categories,
    catalog,
    filters,
    hasAnyProducts,
}: HomePageProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [activeCategory, setActiveCategory] = useState(
        filters.category || 'all',
    );
    const [products, setProducts] = useState<CatalogProduct[]>(catalog.data);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const lastSyncedFilterKeyRef = useRef(
        `${filters.category || 'all'}::${filters.search ?? ''}`,
    );
    const lastRequestRef = useRef<{
        category: string;
        search: string;
        page: number;
    }>({
        category: filters.category || 'all',
        search: filters.search ?? '',
        page: catalog.current_page,
    });
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const incomingFilterKey = `${filters.category || 'all'}::${filters.search ?? ''}`;

        if (
            catalog.current_page <= 1 ||
            incomingFilterKey !== lastSyncedFilterKeyRef.current
        ) {
            setProducts(catalog.data);
            lastSyncedFilterKeyRef.current = incomingFilterKey;
        } else {
            setProducts((prev) => mergeUniqueProducts(prev, catalog.data));
        }

        setActiveCategory(filters.category || 'all');
        setLoadError(null);
    }, [catalog, filters.category, filters.search]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const fetchCatalog = (
        nextCategory: string,
        nextSearch: string,
        nextPage: number,
        mode: 'filter' | 'load-more',
    ) => {
        const trimmedSearch = nextSearch.trim();
        lastRequestRef.current = {
            category: nextCategory,
            search: trimmedSearch,
            page: nextPage,
        };

        const query: Record<string, string | number> = {};

        if (nextCategory && nextCategory !== 'all') {
            query.category = nextCategory;
        }

        if (trimmedSearch !== '') {
            query.search = trimmedSearch;
        }

        if (nextPage > 1) {
            query.page = nextPage;
        }

        setLoadError(null);

        if (mode === 'filter') {
            setIsFiltering(true);
        } else {
            setIsLoadingMore(true);
        }

        router.get(
            home.url({ query }),
            {},
            {
                only: ['catalog', 'filters', 'hasAnyProducts'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onError: () => {
                    setLoadError(
                        'Gagal memuat katalog produk. Periksa koneksi internet Anda lalu coba lagi.',
                    );
                },
                onFinish: () => {
                    setIsFiltering(false);
                    setIsLoadingMore(false);
                },
            },
        );
    };

    const handleSelectCategory = (categoryId: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setActiveCategory(categoryId);
        fetchCatalog(categoryId, searchQuery, 1, 'filter');
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchCatalog(activeCategory, value, 1, 'filter');
        }, SEARCH_DEBOUNCE_MS);
    };

    const handleResetFilters = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setSearchQuery('');
        setActiveCategory('all');
        fetchCatalog('all', '', 1, 'filter');
    };

    const handleLoadMore = () => {
        if (isLoadingMore || isFiltering || !catalog.has_more) {
            return;
        }

        fetchCatalog(
            activeCategory,
            searchQuery,
            catalog.current_page + 1,
            'load-more',
        );
    };

    const handleRetry = () => {
        const { category, search, page } = lastRequestRef.current;
        fetchCatalog(category, search, page, page > 1 ? 'load-more' : 'filter');
    };

    const hasActiveFilter =
        activeCategory !== 'all' || searchQuery.trim() !== '';

    return (
        <HomeLayout
            cartCount={2}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
        >
            <Head title="Kossuma Kota Bogor — Sajian Pangan Halal & Praktis UMKM Muslimah">
                <meta
                    name="description"
                    content="Koperasi Usaha Persaudaraan Muslimah Kota Bogor — Platform pilihan produk pangan halal, frozen food, dan kuliner khas UMKM perempuan tangguh di Kota Bogor."
                />
            </Head>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 lg:px-8">
                <HeroBanner />

                <div className="md:hidden">
                    <div className="relative flex w-full items-center">
                        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Cari risol mayo, ayam ungkep, ikan nila..."
                            aria-label="Cari produk UMKM Kossuma"
                            className="h-11 w-full rounded-full border border-gray-200 bg-white pr-10 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#7D3394] focus:outline-none"
                        />
                        {searchQuery !== '' && (
                            <button
                                type="button"
                                onClick={() => handleSearchChange('')}
                                aria-label="Hapus kata kunci pencarian"
                                className="absolute right-3 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={handleSelectCategory}
                />

                <section className="flex flex-col gap-6">
                    {loadError && products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-xs sm:p-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#DC2626]">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                                Gagal memuat katalog produk
                            </h3>
                            <p className="max-w-sm text-sm text-gray-500">
                                {loadError}
                            </p>
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#7D3394] px-5 py-2.5 text-sm font-bold text-white"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Coba Lagi</span>
                            </button>
                        </div>
                    ) : isFiltering ? (
                        <div
                            aria-busy="true"
                            aria-label="Memuat daftar produk"
                            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                        >
                            {Array.from({ length: FILTER_SKELETON_COUNT }).map(
                                (_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ),
                            )}
                        </div>
                    ) : !hasAnyProducts ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-xs sm:p-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E6F5] text-[#7D3394]">
                                <PackageOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                                Belum ada produk tersedia
                            </h3>
                            <p className="max-w-sm text-sm text-gray-500">
                                Katalog produk UMKM Kossuma sedang disiapkan.
                                Silakan kunjungi kembali sebentar lagi.
                            </p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-xs sm:p-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                                Tidak ada produk yang cocok
                            </h3>
                            <p className="max-w-sm text-sm text-gray-500">
                                Coba ubah kata kunci pencarian atau pilih
                                kategori lainnya untuk melihat pilihan produk
                                UMKM kami.
                            </p>
                            {hasActiveFilter && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] px-5 py-2.5 text-sm font-bold text-[#7D3394]"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span>Reset Pencarian &amp; Filter</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {loadError && (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-[#DC2626] sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{loadError}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRetry}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#DC2626] shadow-2xs"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        <span>Coba Lagi</span>
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        priority={index < 6}
                                    />
                                ))}

                                {isLoadingMore &&
                                    Array.from({
                                        length: LOAD_MORE_SKELETON_COUNT,
                                    }).map((_, index) => (
                                        <ProductCardSkeleton
                                            key={`load-more-skeleton-${index}`}
                                        />
                                    ))}
                            </div>

                            <div className="flex flex-col items-center justify-center gap-2 pt-4 pb-6">
                                {catalog.has_more ? (
                                    <>
                                        <button
                                            type="button"
                                            disabled={isLoadingMore}
                                            onClick={handleLoadMore}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E2C9EB] bg-[#F0E6F5] px-8 py-3 text-xs font-bold text-[#7D3394] shadow-2xs disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                                        >
                                            {isLoadingMore && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                            <span>
                                                {isLoadingMore
                                                    ? 'Memuat Produk...'
                                                    : 'Muat Lebih Banyak'}
                                            </span>
                                        </button>
                                        <span className="text-xs text-gray-400">
                                            Menampilkan {products.length} dari{' '}
                                            {catalog.total} produk
                                        </span>
                                    </>
                                ) : (
                                    catalog.total > 0 && (
                                        <span className="text-xs text-gray-400">
                                            Semua produk telah ditampilkan (
                                            {catalog.total} produk)
                                        </span>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </HomeLayout>
    );
}
