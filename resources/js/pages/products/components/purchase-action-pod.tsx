import { router } from '@inertiajs/react';
import {
    AlertCircle,
    Heart,
    Loader2,
    MessageSquare,
    Share2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { QuantityStepper } from '@/components/commerce';
import { StorefrontImage } from '@/components/media';
import { store as storeCartItem } from '@/routes/cart/items';
import type { ProductDetail } from '../types';

interface PurchaseActionPodProps {
    product: ProductDetail;
}

export function PurchaseActionPod({ product }: PurchaseActionPodProps) {
    const stock = Math.max(0, product.stockCount ?? 0);
    const isOutOfStock = stock <= 0;

    const [quantity, setQuantity] = useState(1);
    const [isQuantityExceeding, setIsQuantityExceeding] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [submittingMode, setSubmittingMode] = useState<'cart' | 'buy' | null>(
        null,
    );

    const effectiveQty = isOutOfStock ? 0 : Math.min(quantity, stock);
    const subtotal = effectiveQty * product.price;
    const originalSubtotal =
        product.originalPrice > product.price
            ? effectiveQty * product.originalPrice
            : 0;

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const submitToCart = (buyNow: boolean) => {
        if (isOutOfStock || isQuantityExceeding || submittingMode !== null) {
            return;
        }

        setSubmittingMode(buyNow ? 'buy' : 'cart');

        router.post(
            storeCartItem.url(),
            {
                product_id: Number(product.id),
                quantity: effectiveQty,
                buy_now: buyNow,
            },
            {
                preserveScroll: !buyNow,
                onError: (errors) => {
                    const message =
                        errors.quantity ??
                        errors.product_id ??
                        'Gagal menambahkan produk ke keranjang.';
                    toast.error(message);
                },
                onFinish: () => {
                    setSubmittingMode(null);
                },
            },
        );
    };

    const handleShareClick = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(window.location.href);
            toast.success('Tautan produk berhasil disalin.');
        }
    };

    const primaryImage = product.images[0];
    const isActionDisabled =
        isOutOfStock || isQuantityExceeding || submittingMode !== null;

    return (
        <div className="flex flex-col gap-3">
            {product.discountPercent > 0 && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-[#7D3394] px-4 py-2.5 text-white shadow-xs">
                    <span className="text-xs font-bold">Spesial Diskon</span>
                    <span className="rounded bg-white px-2 py-0.5 text-xs font-extrabold text-[#7D3394]">
                        Hemat {product.discountPercent}%
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                <h2 className="text-sm font-bold text-gray-900">
                    Atur jumlah pembelian
                </h2>

                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                        <StorefrontImage
                            src={
                                primaryImage?.thumbnailUrl ?? primaryImage?.url
                            }
                            fallbackSrc={primaryImage?.url}
                            alt={product.name}
                            compact
                        />
                    </div>
                    <span className="line-clamp-2 text-xs font-medium text-gray-700">
                        {product.unitLabel ?? '1 Pack'}
                    </span>
                </div>

                {isOutOfStock ? (
                    <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-[#DC2626]">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold">Stok Habis</span>
                            <span className="text-red-700/80">
                                Produk ini sedang habis dan belum dapat dibeli.
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-3">
                            <QuantityStepper
                                value={effectiveQty}
                                max={stock}
                                disabled={submittingMode !== null}
                                size="md"
                                onChange={setQuantity}
                                onExceedStateChange={setIsQuantityExceeding}
                                inputDataTest="product-quantity-input"
                            />

                            <div className="pt-2 text-xs text-gray-600 tabular-nums">
                                Stok:{' '}
                                <strong
                                    className={
                                        stock <= 5
                                            ? 'text-amber-600'
                                            : 'text-gray-900'
                                    }
                                >
                                    {stock}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-end justify-between border-t border-gray-100 pt-2">
                    <span className="text-xs text-gray-500 sm:text-sm">
                        Subtotal
                    </span>
                    <div className="flex flex-col items-end tabular-nums">
                        {originalSubtotal > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                                {formatRupiah(originalSubtotal)}
                            </span>
                        )}
                        <span className="text-lg font-extrabold text-[#DC2626]">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => submitToCart(false)}
                        disabled={isActionDisabled}
                        data-test="add-to-cart-button"
                        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#7D3394] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        {submittingMode === 'cart' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        <span>
                            {isOutOfStock
                                ? 'Stok Habis'
                                : submittingMode === 'cart'
                                  ? 'Menambahkan...'
                                  : '+ Keranjang'}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => submitToCart(true)}
                        disabled={isActionDisabled}
                        data-test="buy-now-button"
                        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#7D3394] text-sm font-bold text-[#7D3394] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        {submittingMode === 'buy' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        <span>Beli Langsung</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 border-t border-gray-100 pt-2 text-xs font-bold text-gray-700">
                    <a
                        href="#ulasan-produk"
                        className="flex cursor-pointer items-center justify-center gap-1.5 border-r border-gray-200 py-1"
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat</span>
                    </a>
                    <button
                        type="button"
                        onClick={() => setIsWishlisted((prev) => !prev)}
                        className={`flex cursor-pointer items-center justify-center gap-1.5 border-r border-gray-200 py-1 ${
                            isWishlisted ? 'text-[#DC2626]' : 'text-gray-700'
                        }`}
                    >
                        <Heart
                            className={`h-3.5 w-3.5 ${
                                isWishlisted
                                    ? 'fill-[#DC2626] text-[#DC2626]'
                                    : ''
                            }`}
                        />
                        <span>Wishlist</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleShareClick}
                        className="flex cursor-pointer items-center justify-center gap-1.5 py-1"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
