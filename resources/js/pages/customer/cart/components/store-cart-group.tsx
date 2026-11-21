import { Link } from '@inertiajs/react';
import { AlertCircle, MapPin, Trash2 } from 'lucide-react';
import { QuantityStepper } from '@/components/commerce';
import { StorefrontImage } from '@/components/media';
import { show as showProduct } from '@/routes/products';
import type { CartItem, StoreGroup } from '../types';

interface StoreCartGroupProps {
    store: StoreGroup;
    items: CartItem[];
    deletingItemIds: Record<string, boolean>;
    isGlobalBusy: boolean;
    onToggleStore: (storeId: string, checked: boolean) => void;
    onToggleItem: (item: CartItem) => void;
    onSetQuantity: (item: CartItem, nextQuantity: number) => void;
    onExceedStateChange: (itemId: string, isExceeding: boolean) => void;
    onRemoveItem: (item: CartItem) => void;
}

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function StoreCartGroup({
    store,
    items,
    deletingItemIds,
    isGlobalBusy,
    onToggleStore,
    onToggleItem,
    onSetQuantity,
    onExceedStateChange,
    onRemoveItem,
}: StoreCartGroupProps) {
    if (items.length === 0) {
        return null;
    }

    const availableItems = items.filter((item) => item.isAvailable);
    const hasAvailableItems = availableItems.length > 0;
    const isStoreChecked =
        hasAvailableItems && availableItems.every((item) => item.isSelected);

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
            <div className="-mx-5 -mt-5 flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-gray-100 bg-gray-50/70 px-5 pt-4 pb-3.5">
                <label
                    className={`flex items-center gap-3 select-none ${
                        hasAvailableItems && !isGlobalBusy
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed opacity-60'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={isStoreChecked}
                        disabled={!hasAvailableItems || isGlobalBusy}
                        onChange={(event) =>
                            onToggleStore(store.id, event.target.checked)
                        }
                        aria-label={`Pilih semua produk tersedia dari ${store.name}`}
                        className="h-4 w-4 cursor-pointer rounded text-[#7D3394] accent-[#7D3394] focus:ring-[#7D3394] disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-sm font-bold text-gray-900 sm:text-base">
                            {store.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-[#7D3394]" />
                            <span>
                                {store.district}, {store.city}
                            </span>
                        </div>
                    </div>
                </label>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
                {items.map((item) => {
                    const itemSubtotal = item.price * item.quantity;
                    const isDeleting =
                        isGlobalBusy || Boolean(deletingItemIds[item.id]);
                    const unavailableLabel =
                        item.unavailableReason === 'inactive'
                            ? 'Produk Tidak Tersedia'
                            : 'Stok Habis';

                    return (
                        <div
                            key={item.id}
                            data-test={`cart-item-${item.productId}`}
                            className="flex flex-col items-start gap-4 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center"
                        >
                            <div className="flex shrink-0 items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.isSelected}
                                    disabled={!item.isAvailable || isDeleting}
                                    onChange={() => onToggleItem(item)}
                                    aria-label={`Pilih ${item.name}`}
                                    data-test={`cart-item-checkbox-${item.productId}`}
                                    className="h-4 w-4 cursor-pointer rounded text-[#7D3394] accent-[#7D3394] focus:ring-[#7D3394] disabled:cursor-not-allowed disabled:opacity-40"
                                />
                                <Link
                                    href={showProduct({ slug: item.slug })}
                                    className={`relative block h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:h-24 sm:w-24 ${
                                        !item.isAvailable ? 'opacity-60' : ''
                                    }`}
                                >
                                    <StorefrontImage
                                        src={item.imageUrl}
                                        fallbackSrc={item.imageFullUrl}
                                        alt={item.imageAlt}
                                        compact
                                    />
                                </Link>
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {!item.isAvailable && (
                                            <span
                                                data-test={`cart-item-unavailable-badge-${item.productId}`}
                                                className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-[#DC2626]"
                                            >
                                                {unavailableLabel}
                                            </span>
                                        )}
                                        {item.isPreorder && (
                                            <span className="inline-flex items-center rounded border border-[#E2C9EB] bg-[#F0E6F5] px-2 py-0.5 text-[10px] font-bold text-[#7D3394]">
                                                {item.preorderDays
                                                    ? `Pre-order ${item.preorderDays} hari`
                                                    : 'Pre-order'}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={showProduct({ slug: item.slug })}
                                        className={`line-clamp-2 cursor-pointer text-sm leading-snug font-medium sm:text-base ${
                                            item.isAvailable
                                                ? 'text-gray-900'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>

                                    <span className="w-fit rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                                        {item.variant}
                                    </span>
                                </div>

                                <div className="mt-1 flex flex-wrap items-baseline gap-2 tabular-nums">
                                    <span
                                        className={`text-base font-extrabold sm:text-lg ${
                                            item.isAvailable
                                                ? 'text-[#DC2626]'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        {formatRupiah(item.price)}
                                    </span>
                                    {item.originalPrice &&
                                        item.originalPrice > item.price && (
                                            <span className="text-xs text-gray-400 line-through sm:text-sm">
                                                {formatRupiah(
                                                    item.originalPrice,
                                                )}
                                            </span>
                                        )}
                                    {item.discountPercent &&
                                        item.discountPercent > 0 && (
                                            <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-bold text-[#DC2626]">
                                                -{item.discountPercent}%
                                            </span>
                                        )}
                                </div>

                                {!item.isAvailable ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#DC2626]">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            Produk ini tidak dapat di-checkout
                                        </span>
                                    </div>
                                ) : item.exceedsStock ? (
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-amber-700">
                                        <span className="inline-flex items-center gap-1 font-medium">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                            Stok tersisa {item.stock}. Sesuaikan
                                            jumlah sebelum checkout.
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() =>
                                                onSetQuantity(item, item.stock)
                                            }
                                            data-test={`adjust-stock-${item.productId}`}
                                            className="cursor-pointer rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Sesuaikan ke {item.stock}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        {item.stock <= 5 && (
                                            <span className="font-medium text-amber-600">
                                                Tersisa {item.stock} stok
                                            </span>
                                        )}
                                        {item.priceChanged &&
                                            item.priceSnapshot && (
                                                <span className="text-gray-500">
                                                    Harga diperbarui dari{' '}
                                                    {formatRupiah(
                                                        item.priceSnapshot,
                                                    )}
                                                </span>
                                            )}
                                    </div>
                                )}
                            </div>

                            <div className="flex w-full shrink-0 items-start justify-between gap-3 pt-2 sm:w-auto sm:min-w-[176px] sm:flex-col sm:items-end sm:pt-0">
                                <div className="flex items-start gap-2">
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => onRemoveItem(item)}
                                        aria-label={`Hapus ${item.name} dari keranjang`}
                                        data-test={`remove-cart-item-${item.productId}`}
                                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Trash2 className="h-4 w-4 text-[#DC2626]" />
                                    </button>

                                    <QuantityStepper
                                        value={item.quantity}
                                        max={Math.max(1, item.stock)}
                                        disabled={
                                            !item.isAvailable || isDeleting
                                        }
                                        size="sm"
                                        alignMessage="right"
                                        onChange={(nextQuantity) =>
                                            onSetQuantity(item, nextQuantity)
                                        }
                                        onExceedStateChange={(isExceeding) =>
                                            onExceedStateChange(
                                                item.id,
                                                isExceeding,
                                            )
                                        }
                                        onRemoveAtMin={() => onRemoveItem(item)}
                                        decrementAriaLabel={
                                            item.quantity <= 1
                                                ? `Hapus ${item.name}`
                                                : `Kurangi jumlah ${item.name}`
                                        }
                                        incrementAriaLabel={`Tambah jumlah ${item.name}`}
                                        inputAriaLabel={`Jumlah ${item.name}`}
                                        incrementDataTest={`increment-cart-item-${item.productId}`}
                                        inputDataTest={`cart-item-quantity-input-${item.productId}`}
                                    />
                                </div>

                                {item.isAvailable ? (
                                    <div className="text-right tabular-nums">
                                        <span className="block text-xs text-gray-500 sm:hidden">
                                            Subtotal:
                                        </span>
                                        <span className="text-sm font-bold whitespace-nowrap text-gray-900">
                                            Subtotal:{' '}
                                            {formatRupiah(itemSubtotal)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-medium text-gray-400">
                                        Tidak masuk hitungan
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
