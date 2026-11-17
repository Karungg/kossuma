import { useState, useMemo } from 'react';
import type { CartCalculation, CartItem, RecommendationProduct, StoreGroup } from './types';
import { HomeLayout } from '@/layouts/home-layout';
import { CartBreadcrumbBar } from './components/cart-breadcrumb-bar';
import { StoreCartGroup } from './components/store-cart-group';
import { CartRecommendations } from './components/cart-recommendations';
import { OrderSummaryCard } from './components/order-summary-card';
import { ShoppingBag } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import { checkout } from '@/routes';

const INITIAL_STORES: StoreGroup[] = [
    {
        id: 'store-1',
        name: 'Dapur Ummi Salma — Tanah Sareal',
        district: 'Tanah Sareal',
        city: 'Kota Bogor',
        notePlaceholder: 'Tulis catatan untuk Ummi (misal: minta kirim frozen beku, pisahkan saus sambal)...',
        note: '',
    },
    {
        id: 'store-2',
        name: 'Pawon Ibu Fatimah — Bogor Barat',
        district: 'Semplak',
        city: 'Bogor Barat',
        notePlaceholder: 'Tulis catatan untuk Bu Fatimah (misal: sambal bawang ekstra pedas)...',
        note: '',
    },
];

const INITIAL_ITEMS: CartItem[] = [
    {
        id: 'item-1',
        storeId: 'store-1',
        name: 'Risol Mayo Smoked Beef & Telur Keju Lumer',
        variant: 'Varian: 450 gr (Isi 10 pcs)',
        price: 35000,
        originalPrice: 38000,
        imageUrl: '',
        imageAlt: 'Warm golden crispy indonesian mayo risoles',
        quantity: 1,
        isSelected: true,
    },
    {
        id: 'item-2',
        storeId: 'store-2',
        name: 'Ayam Ungkep Bumbu Kuning Lengkuas Siap Goreng',
        variant: 'Varian: 850 gr (1 Ekor Potong 8)',
        price: 65000,
        originalPrice: 72000,
        discountPercent: 10,
        imageUrl: '',
        imageAlt: 'Traditional Indonesian spiced yellow chicken Ayam Ungkep Bumbu Kuning',
        quantity: 1,
        isSelected: false,
    },
];

const INITIAL_RECOMMENDATIONS: RecommendationProduct[] = [
    {
        id: 'rec-1',
        storeId: 'store-1',
        storeName: 'Dapur Ummi Salma',
        name: 'Sambal Cumi Judes',
        price: 28000,
        imageUrl: '',
        imageAlt: 'Traditional Indonesian sambal cumi pedas glass jar',
        variant: 'Botol 150 gr',
    },
    {
        id: 'rec-2',
        storeId: 'store-2',
        storeName: 'Pawon Ibu Fatimah',
        name: 'Pastel Sayur Telur (5 Pcs)',
        price: 22500,
        imageUrl: '',
        imageAlt: 'Indonesian fresh pastel sayur telor golden brown pastry',
        variant: 'Isi 5 pcs',
    },
    {
        id: 'rec-3',
        storeId: 'store-3',
        storeName: 'Herbal Barokah',
        name: 'Sirup Jahe Merah Rempah',
        price: 32000,
        imageUrl: '',
        imageAlt: 'Traditional Indonesian rempah drink wedang uwuh spiced herbal infusion',
        variant: 'Botol 250 ml',
    },
    {
        id: 'rec-4',
        storeId: 'store-4',
        storeName: 'Snack Berkah',
        name: 'Kripik Pisang Cokelat',
        price: 18000,
        imageUrl: '',
        imageAlt: 'Crunchy Indonesian keripik pisang lumer chocolate coated banana chips',
        variant: 'Pouch 200 gr',
    },
];

export default function CartPage() {
    const [stores, setStores] = useState<StoreGroup[]>(INITIAL_STORES);
    const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
    const [searchQuery, setSearchQuery] = useState('');

    // Selected Calculations (hanya subtotal & diskon barang yang diterapkan)
    const selectedItems = useMemo(() => items.filter((i) => i.isSelected), [items]);
    const selectedCount = selectedItems.length;
    const isAllSelected = items.length > 0 && items.every((i) => i.isSelected);

    const calculation: CartCalculation = useMemo(() => {
        const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const discountTotal = selectedItems.reduce(
            (acc, i) =>
                acc +
                (i.originalPrice && i.originalPrice > i.price
                    ? (i.originalPrice - i.price) * i.quantity
                    : 0),
            0,
        );
        const originalItemsTotal = subtotal + discountTotal;

        return {
            selectedCount,
            originalItemsTotal,
            discountTotal,
            subtotal,
        };
    }, [selectedItems, selectedCount]);

    // Handlers
    const handleToggleSelectAll = (checked: boolean) => {
        setItems((prev) => prev.map((item) => ({ ...item, isSelected: checked })));
    };

    const handleToggleStore = (storeId: string, checked: boolean) => {
        setItems((prev) =>
            prev.map((item) =>
                item.storeId === storeId ? { ...item, isSelected: checked } : item,
            ),
        );
    };

    const handleToggleItem = (itemId: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, isSelected: !item.isSelected } : item,
            ),
        );
    };

    const handleUpdateQuantity = (itemId: string, delta: number) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === itemId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            }),
        );
    };

    const handleRemoveItem = (itemId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const handleDeleteSelected = () => {
        setItems((prev) => prev.filter((item) => !item.isSelected));
    };

    const handleUpdateNote = (storeId: string, note: string) => {
        setStores((prev) =>
            prev.map((store) => (store.id === storeId ? { ...store, note } : store)),
        );
    };

    const handleAddToCart = (recProduct: RecommendationProduct) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.name === recProduct.name);
            if (existing) {
                return prev.map((item) =>
                    item.id === existing.id
                        ? { ...item, quantity: item.quantity + 1, isSelected: true }
                        : item,
                );
            }

            // Ensure store exists
            setStores((prevStores) => {
                if (!prevStores.some((s) => s.id === recProduct.storeId)) {
                    return [
                        ...prevStores,
                        {
                            id: recProduct.storeId,
                            name: `${recProduct.storeName} — Kota Bogor`,
                            district: 'Bogor',
                            city: 'Kota Bogor',
                            notePlaceholder: `Tulis catatan untuk ${recProduct.storeName}...`,
                            note: '',
                        },
                    ];
                }
                return prevStores;
            });

            const newItem: CartItem = {
                id: `cart-${Date.now()}`,
                storeId: recProduct.storeId,
                name: recProduct.name,
                variant: recProduct.variant,
                price: recProduct.price,
                imageUrl: recProduct.imageUrl,
                imageAlt: recProduct.imageAlt,
                quantity: 1,
                isSelected: true,
            };

            return [...prev, newItem];
        });
    };

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    // Filter items per store
    const filteredStores = stores.filter((store) =>
        items.some((item) => item.storeId === store.id),
    );

    return (
        <HomeLayout
            cartCount={items.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        >
            <Head title="Keranjang Belanja - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Keranjang Belanja Multi-Toko UMKM Kossuma Kota Bogor — Halal Food & Local UMKM E-Commerce"
                />
            </Head>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
                {/* Breadcrumbs & Bulk Selection Bar */}
                <CartBreadcrumbBar
                    totalItemCount={items.length}
                    selectedCount={selectedCount}
                    isAllSelected={isAllSelected}
                    onToggleSelectAll={handleToggleSelectAll}
                    onDeleteSelected={handleDeleteSelected}
                />

                {/* Shopping Cart Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Cart Items & Store Groups (8 cols on desktop) */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                        {/* Global Select Bar Card */}
                        <div className="bg-white rounded-xl p-4 shadow-2xs border border-gray-100 flex items-center justify-between gap-3">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                                    className="w-5 h-5 rounded text-[#7D3394] focus:ring-[#7D3394] accent-[#7D3394] cursor-pointer"
                                />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                    <span className="text-sm sm:text-base font-bold text-gray-900">
                                        Pilih Semua Produk
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ({selectedCount} item terpilih dari {filteredStores.length} toko UMKM Binaan)
                                    </span>
                                </div>
                            </label>
                            <button
                                type="button"
                                onClick={handleDeleteSelected}
                                disabled={selectedCount === 0}
                                className="text-xs sm:text-sm font-semibold text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Hapus
                            </button>
                        </div>

                        {/* Store Groups */}
                        {filteredStores.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center gap-3">
                                <ShoppingBag className="w-12 h-12 text-gray-300" />
                                <h3 className="text-lg font-bold text-gray-900">
                                    Keranjang Belanja Anda Kosong
                                </h3>
                                <p className="text-sm text-gray-500 max-w-sm">
                                    Yuk jelajahi produk makanan halal, camilan, dan lauk siap saji UMKM binaan Kossuma di bawah ini!
                                </p>
                            </div>
                        ) : (
                            filteredStores.map((store) => (
                                <StoreCartGroup
                                    key={store.id}
                                    store={store}
                                    items={items.filter((item) => item.storeId === store.id)}
                                    onToggleStore={handleToggleStore}
                                    onToggleItem={handleToggleItem}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                    onUpdateNote={handleUpdateNote}
                                />
                            ))
                        )}

                        {/* Recommendations Carousel Mini Strip */}
                        <CartRecommendations
                            items={INITIAL_RECOMMENDATIONS}
                            onAddToCart={handleAddToCart}
                        />
                    </div>

                    {/* Right Column: Sticky Order Summary (4 cols on desktop) */}
                    <div className="lg:col-span-4">
                        <OrderSummaryCard calculation={calculation} />
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Bottom Checkout Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) => handleToggleSelectAll(e.target.checked)}
                            className="w-4 h-4 rounded text-[#7D3394] focus:ring-[#7D3394] accent-[#7D3394] cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-gray-800">
                            Pilih Semua
                        </span>
                    </label>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                            <span className="text-[11px] text-gray-500">Subtotal:</span>
                            <span className="text-base font-extrabold text-[#DC2626]">
                                {formatRupiah(calculation.subtotal)}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (selectedCount > 0) {
                                    router.visit(checkout());
                                }
                            }}
                            disabled={selectedCount === 0}
                            className="py-2.5 px-4 rounded-xl bg-[#7D3394] text-white disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Checkout ({selectedCount})</span>
                        </button>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

