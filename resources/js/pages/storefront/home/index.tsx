import { useState, useMemo } from 'react';
import type { CatalogProduct, CategoryTab } from './types';
import { HeroBanner } from './components/hero-banner';
import { CategoryTabs } from './components/category-tabs';
import { ProductCard } from './components/product-card';
import { StorefrontLayout } from '@/layouts/storefront-layout';
import { Search } from 'lucide-react';

const CATEGORIES: CategoryTab[] = [
    { id: 'all', label: 'Semua' },
    { id: 'frozen', label: 'Frozen Food' },
    { id: 'ayam', label: 'Ayam' },
    { id: 'ikan', label: 'Ikan' },
    { id: 'lauk', label: 'Lauk Matang' },
    { id: 'kue', label: 'Kue & Camilan' },
    { id: 'bumbu', label: 'Bumbu & Sambal' },
];

const PRODUCTS: CatalogProduct[] = [
    {
        id: 'prod-1',
        slug: 'lapis-talas-khas-bogor-keju',
        title: 'Lapis Talas Khas Bogor Original Keju Premium',
        category: 'kue',
        price: 38000,
        originalPrice: 42000,
        rating: 4.9,
        soldCount: '1.2rb terjual',
        storeName: 'Dapur Ummu Hafizh',
        storeDistrict: 'Pajajaran',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Lapis Talas Khas Bogor Original Keju Premium',
    },
    {
        id: 'prod-2',
        slug: 'ayam-ungkep-bumbu-kuning',
        title: 'Ayam Ungkep Bumbu Kuning Lengkuas Siap Goreng (1 Ekor)',
        category: 'ayam',
        price: 65000,
        rating: 4.9,
        soldCount: '850 terjual',
        storeName: 'Ayam Berkah Barokah',
        storeDistrict: 'Tanah Sareal',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Ayam Ungkep Bumbu Kuning Lengkuas Siap Goreng (1 Ekor)',
    },
    {
        id: 'prod-3',
        slug: 'dimsum-ayam-udang-premium',
        title: 'Dimsum Ayam Udang Premium Halal + Saus Merah (Isi 10)',
        category: 'frozen',
        price: 35000,
        rating: 4.8,
        soldCount: '920 terjual',
        storeName: 'Dimsum Muslimah',
        storeDistrict: 'Bogor Barat',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Dimsum Ayam Udang Premium Halal + Saus Merah (Isi 10)',
    },
    {
        id: 'prod-4',
        slug: 'risol-mayo-smoked-beef',
        title: 'Risol Mayo Smoked Beef & Telur Keju Lumer (Isi 5 Pcs)',
        category: 'kue',
        price: 28000,
        rating: 4.9,
        soldCount: '740 terjual',
        storeName: 'Snack Gurih Bunda',
        storeDistrict: 'Bogor Tengah',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Risol Mayo Smoked Beef & Telur Keju Lumer (Isi 5 Pcs)',
    },
    {
        id: 'prod-5',
        slug: 'ikan-nila-bumbu-kuning',
        title: 'Ikan Nila Bumbu Kuning Marinasi Segar Siap Masak 500g',
        category: 'ikan',
        price: 32500,
        rating: 4.8,
        soldCount: '530 terjual',
        storeName: 'Ikan Segar Mandiri',
        storeDistrict: 'Bogor Selatan',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Ikan Nila Bumbu Kuning Marinasi Segar Siap Masak 500g',
    },
    {
        id: 'prod-6',
        slug: 'sambal-cumi-asin-cabe-ijo',
        title: 'Sambal Cumi Asin Cabe Ijo Pedas Gurih Toples 200g',
        category: 'bumbu',
        price: 30000,
        rating: 4.9,
        soldCount: '610 terjual',
        storeName: 'Sambal Selera Muslimah',
        storeDistrict: 'Sukasari',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Sambal Cumi Asin Cabe Ijo Pedas Gurih Toples 200g',
    },
    {
        id: 'prod-7',
        slug: 'bolu-gulung-pandan-keju',
        title: 'Bolu Gulung Pandan Keju Lapis Legit Lembut Khas Bogor',
        category: 'kue',
        price: 42000,
        rating: 4.9,
        soldCount: '490 terjual',
        storeName: 'Bolu Hanifa',
        storeDistrict: 'Baranangsiang',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Bolu Gulung Pandan Keju Lapis Legit Lembut Khas Bogor',
    },
    {
        id: 'prod-8',
        slug: 'bakso-sapi-urat-frozen',
        title: 'Bakso Sapi Urat Halus Kuah Kaldu Frozen Pack Isi 20',
        category: 'lauk',
        price: 45000,
        rating: 4.8,
        soldCount: '680 terjual',
        storeName: 'Bakso Barokah',
        storeDistrict: 'Bogor Utara',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg',
        imageAlt: 'Bakso Sapi Urat Halus Kuah Kaldu Frozen Pack Isi 20',
    },
];

export function StorefrontHomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((product) => {
            const matchesCategory =
                activeCategory === 'all' || product.category === activeCategory;
            const matchesSearch =
                searchQuery.trim() === '' ||
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.storeName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

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

                {/* Product Grid Section */}
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </StorefrontLayout>
    );
}
