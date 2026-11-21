import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { HomeLayout } from '@/layouts/home-layout';
import { checkout, home } from '@/routes';
import {
    destroy as destroyCartItem,
    destroySelected as destroySelectedCartItems,
    destroyUnavailable as destroyUnavailableCartItems,
    store as storeCartItem,
    update as updateCartItem,
} from '@/routes/cart/items';
import { update as updateCartSelection } from '@/routes/cart/selection';
import { CartBreadcrumbBar } from './components/cart-breadcrumb-bar';
import { CartRecommendations } from './components/cart-recommendations';
import { OrderSummaryCard } from './components/order-summary-card';
import { StoreCartGroup } from './components/store-cart-group';
import type {
    CartCalculation,
    CartItem,
    RecommendationProduct,
    StoreGroup,
} from './types';

interface CartPageProps {
    stores: StoreGroup[];
    items: CartItem[];
    calculation: CartCalculation;
    recommendations: RecommendationProduct[];
}

const QUANTITY_SYNC_DEBOUNCE_MS = 350;

export default function CartPage({
    stores,
    items,
    calculation,
    recommendations,
}: CartPageProps) {
    const [localQuantities, setLocalQuantities] = useState<
        Record<string, number>
    >({});
    const [exceedingItemIds, setExceedingItemIds] = useState<
        Record<string, boolean>
    >({});
    const [deletingItemIds, setDeletingItemIds] = useState<
        Record<string, boolean>
    >({});
    const [isGlobalBusy, setIsGlobalBusy] = useState(false);
    const [addingProductId, setAddingProductId] = useState<number | null>(null);

    const syncTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
        new Map(),
    );
    const pendingTargetQtyRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        const timers = syncTimersRef.current;

        return () => {
            for (const timer of timers.values()) {
                clearTimeout(timer);
            }
            timers.clear();
        };
    }, []);

    const effectiveItems = useMemo(() => {
        return items.map((item) => {
            const optimisticQty = localQuantities[item.id];

            if (optimisticQty === undefined) {
                return item;
            }

            const exceedsStock = item.isAvailable && optimisticQty > item.stock;

            return {
                ...item,
                quantity: optimisticQty,
                exceedsStock,
                canCheckout: item.isAvailable && !exceedsStock,
            };
        });
    }, [items, localQuantities]);

    const effectiveCalculation = useMemo<CartCalculation>(() => {
        let selectedCount = 0;
        let selectedUnits = 0;
        let subtotal = 0;
        let discountTotal = 0;
        let hasBlockingSelectionIssue = false;

        for (const item of effectiveItems) {
            if (!item.isSelected || !item.isAvailable) {
                continue;
            }

            selectedCount += 1;
            selectedUnits += item.quantity;
            subtotal += item.price * item.quantity;

            if (item.originalPrice && item.originalPrice > item.price) {
                discountTotal +=
                    (item.originalPrice - item.price) * item.quantity;
            }

            if (item.exceedsStock || exceedingItemIds[item.id]) {
                hasBlockingSelectionIssue = true;
            }
        }

        return {
            selectedCount,
            selectedUnits,
            originalItemsTotal: subtotal + discountTotal,
            discountTotal,
            subtotal,
            hasBlockingSelectionIssue,
            unavailableCount: calculation.unavailableCount,
        };
    }, [calculation.unavailableCount, effectiveItems, exceedingItemIds]);

    const availableItems = effectiveItems.filter((item) => item.isAvailable);
    const hasAvailableItems = availableItems.length > 0;
    const isAllSelected =
        hasAvailableItems && availableItems.every((item) => item.isSelected);
    const canCheckout =
        effectiveCalculation.selectedCount > 0 &&
        !effectiveCalculation.hasBlockingSelectionIssue;

    const setItemDeleting = (itemId: string, deleting: boolean) => {
        setDeletingItemIds((prev) => {
            if (!deleting) {
                const next = { ...prev };
                delete next[itemId];

                return next;
            }

            return { ...prev, [itemId]: true };
        });
    };

    const showFirstError = (errors: Record<string, string>) => {
        const firstMessage = Object.values(errors)[0];
        toast.error(firstMessage || 'Terjadi kesalahan. Silakan coba lagi.');
    };

    const clearPendingSyncForItem = (itemId: string) => {
        const existingTimer = syncTimersRef.current.get(itemId);

        if (existingTimer) {
            clearTimeout(existingTimer);
            syncTimersRef.current.delete(itemId);
        }

        pendingTargetQtyRef.current.delete(itemId);
        setLocalQuantities((prev) => {
            if (prev[itemId] === undefined) {
                return prev;
            }

            const next = { ...prev };
            delete next[itemId];

            return next;
        });
    };

    const handleExceedStateChange = (itemId: string, isExceeding: boolean) => {
        setExceedingItemIds((prev) => {
            if (!isExceeding) {
                if (!prev[itemId]) {
                    return prev;
                }

                const next = { ...prev };
                delete next[itemId];

                return next;
            }

            return { ...prev, [itemId]: true };
        });
    };

    const handleToggleSelectAll = (checked: boolean) => {
        if (!hasAvailableItems || isGlobalBusy) {
            return;
        }

        setIsGlobalBusy(true);
        router.patch(
            updateCartSelection.url(),
            { is_selected: checked },
            {
                only: ['stores', 'items', 'calculation'],
                preserveState: true,
                preserveScroll: true,
                showProgress: false,
                onError: showFirstError,
                onFinish: () => setIsGlobalBusy(false),
            },
        );
    };

    const handleToggleStore = (storeId: string, checked: boolean) => {
        if (isGlobalBusy) {
            return;
        }

        setIsGlobalBusy(true);
        router.patch(
            updateCartSelection.url(),
            { store_id: Number(storeId), is_selected: checked },
            {
                only: ['stores', 'items', 'calculation'],
                preserveState: true,
                preserveScroll: true,
                showProgress: false,
                onError: showFirstError,
                onFinish: () => setIsGlobalBusy(false),
            },
        );
    };

    const handleToggleItem = (item: CartItem) => {
        if (!item.isAvailable || deletingItemIds[item.id] || isGlobalBusy) {
            return;
        }

        router.patch(
            updateCartItem.url(Number(item.id)),
            { is_selected: !item.isSelected },
            {
                only: ['stores', 'items', 'calculation'],
                preserveState: true,
                preserveScroll: true,
                showProgress: false,
                onError: showFirstError,
            },
        );
    };

    const handleSetQuantity = (item: CartItem, nextQuantity: number) => {
        if (!item.isAvailable || deletingItemIds[item.id] || isGlobalBusy) {
            return;
        }

        const clamped = Math.max(1, Math.min(item.stock, nextQuantity));

        setLocalQuantities((prev) => ({
            ...prev,
            [item.id]: clamped,
        }));
        pendingTargetQtyRef.current.set(item.id, clamped);

        const existingTimer = syncTimersRef.current.get(item.id);

        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
            syncTimersRef.current.delete(item.id);

            router.patch(
                updateCartItem.url(Number(item.id)),
                { quantity: clamped },
                {
                    only: ['stores', 'items', 'calculation'],
                    preserveState: true,
                    preserveScroll: true,
                    showProgress: false,
                    onSuccess: () => {
                        if (
                            pendingTargetQtyRef.current.get(item.id) === clamped
                        ) {
                            pendingTargetQtyRef.current.delete(item.id);
                            setLocalQuantities((prev) => {
                                const next = { ...prev };
                                delete next[item.id];

                                return next;
                            });
                        }
                    },
                    onError: (errors) => {
                        pendingTargetQtyRef.current.delete(item.id);
                        setLocalQuantities((prev) => {
                            const next = { ...prev };
                            delete next[item.id];

                            return next;
                        });
                        showFirstError(errors);
                    },
                },
            );
        }, QUANTITY_SYNC_DEBOUNCE_MS);

        syncTimersRef.current.set(item.id, timer);
    };

    const handleRemoveItem = (item: CartItem) => {
        if (deletingItemIds[item.id] || isGlobalBusy) {
            return;
        }

        clearPendingSyncForItem(item.id);
        setItemDeleting(item.id, true);
        router.delete(destroyCartItem.url(Number(item.id)), {
            preserveScroll: true,
            onError: showFirstError,
            onFinish: () => setItemDeleting(item.id, false),
        });
    };

    const handleDeleteSelected = () => {
        if (effectiveCalculation.selectedCount === 0 || isGlobalBusy) {
            return;
        }

        setIsGlobalBusy(true);
        router.delete(destroySelectedCartItems.url(), {
            preserveScroll: true,
            onError: showFirstError,
            onFinish: () => setIsGlobalBusy(false),
        });
    };

    const handleDeleteUnavailable = () => {
        if (effectiveCalculation.unavailableCount === 0 || isGlobalBusy) {
            return;
        }

        setIsGlobalBusy(true);
        router.delete(destroyUnavailableCartItems.url(), {
            preserveScroll: true,
            onError: showFirstError,
            onFinish: () => setIsGlobalBusy(false),
        });
    };

    const handleAddRecommendation = (product: RecommendationProduct) => {
        if (addingProductId !== null || isGlobalBusy) {
            return;
        }

        setAddingProductId(product.productId);
        router.post(
            storeCartItem.url(),
            {
                product_id: product.productId,
                quantity: 1,
                buy_now: false,
            },
            {
                preserveScroll: true,
                onError: showFirstError,
                onFinish: () => setAddingProductId(null),
            },
        );
    };

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const visibleStores = stores.filter((store) =>
        effectiveItems.some((item) => item.storeId === store.id),
    );

    return (
        <HomeLayout cartCount={effectiveItems.length}>
            <Head title="Keranjang Belanja - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Keranjang Belanja Multi-Toko UMKM Kossuma Kota Bogor — Belanja Kuliner Halal & Produk UMKM Lokal"
                />
            </Head>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 pb-24 sm:gap-8 sm:px-6 lg:px-8 lg:pb-8">
                <CartBreadcrumbBar totalItemCount={effectiveItems.length} />

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    <div className="flex flex-col gap-5 lg:col-span-8">
                        {effectiveItems.length > 0 && (
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-2xs">
                                <label
                                    className={`flex items-center gap-3 select-none ${
                                        hasAvailableItems && !isGlobalBusy
                                            ? 'cursor-pointer'
                                            : 'cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        disabled={
                                            !hasAvailableItems || isGlobalBusy
                                        }
                                        onChange={(event) =>
                                            handleToggleSelectAll(
                                                event.target.checked,
                                            )
                                        }
                                        data-test="cart-select-all-checkbox"
                                        className="h-5 w-5 cursor-pointer rounded text-[#7D3394] accent-[#7D3394] focus:ring-[#7D3394] disabled:cursor-not-allowed"
                                    />
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        <span className="text-sm font-bold text-gray-900 sm:text-base">
                                            Pilih Semua Produk
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            (
                                            {effectiveCalculation.selectedCount}{' '}
                                            terpilih dari {visibleStores.length}{' '}
                                            toko UMKM)
                                        </span>
                                    </div>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleDeleteSelected}
                                    disabled={
                                        effectiveCalculation.selectedCount ===
                                            0 || isGlobalBusy
                                    }
                                    data-test="cart-delete-selected-button"
                                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Hapus Terpilih</span>
                                </button>
                            </div>
                        )}

                        {effectiveCalculation.unavailableCount > 0 && (
                            <div
                                data-test="cart-unavailable-banner"
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-xs text-[#DC2626] sm:text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>
                                        {effectiveCalculation.unavailableCount}{' '}
                                        produk di keranjang sedang habis atau
                                        tidak tersedia dan tidak dapat
                                        di-checkout.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    disabled={isGlobalBusy}
                                    onClick={handleDeleteUnavailable}
                                    data-test="cart-delete-unavailable-button"
                                    className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#DC2626] shadow-2xs disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Hapus yang Tidak Tersedia
                                </button>
                            </div>
                        )}

                        {visibleStores.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E6F5] text-[#7D3394]">
                                    <ShoppingBag className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Keranjang Belanja Anda Kosong
                                </h3>
                                <p className="max-w-sm text-sm text-gray-500">
                                    Yuk jelajahi aneka olahan pangan halal,
                                    camilan, dan lauk siap saji dari UMKM binaan
                                    Kossuma Kota Bogor.
                                </p>
                                <Link
                                    href={home()}
                                    className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#7D3394] px-6 py-2.5 text-sm font-bold text-white"
                                >
                                    <span>Mulai Belanja</span>
                                </Link>
                            </div>
                        ) : (
                            visibleStores.map((store) => (
                                <StoreCartGroup
                                    key={store.id}
                                    store={store}
                                    items={effectiveItems.filter(
                                        (item) => item.storeId === store.id,
                                    )}
                                    deletingItemIds={deletingItemIds}
                                    isGlobalBusy={isGlobalBusy}
                                    onToggleStore={handleToggleStore}
                                    onToggleItem={handleToggleItem}
                                    onSetQuantity={handleSetQuantity}
                                    onExceedStateChange={
                                        handleExceedStateChange
                                    }
                                    onRemoveItem={handleRemoveItem}
                                />
                            ))
                        )}

                        <CartRecommendations
                            items={recommendations}
                            addingProductId={addingProductId}
                            onAddToCart={handleAddRecommendation}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <OrderSummaryCard calculation={effectiveCalculation} />
                    </div>
                </div>
            </div>

            {effectiveItems.length > 0 && (
                <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <label
                            className={`flex items-center gap-2 select-none ${
                                hasAvailableItems && !isGlobalBusy
                                    ? 'cursor-pointer'
                                    : 'cursor-not-allowed opacity-60'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                disabled={!hasAvailableItems || isGlobalBusy}
                                onChange={(event) =>
                                    handleToggleSelectAll(event.target.checked)
                                }
                                className="h-4 w-4 cursor-pointer rounded text-[#7D3394] accent-[#7D3394] focus:ring-[#7D3394] disabled:cursor-not-allowed"
                            />
                            <span className="text-xs font-semibold text-gray-800">
                                Pilih Semua
                            </span>
                        </label>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col text-right tabular-nums">
                                <span className="text-[11px] text-gray-500">
                                    Subtotal:
                                </span>
                                <span className="text-base font-extrabold text-[#DC2626]">
                                    {formatRupiah(
                                        effectiveCalculation.subtotal,
                                    )}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (canCheckout) {
                                        router.visit(checkout());
                                    }
                                }}
                                disabled={!canCheckout}
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#7D3394] px-4 py-2.5 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <span>
                                    Checkout (
                                    {effectiveCalculation.selectedCount})
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HomeLayout>
    );
}
