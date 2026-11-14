import { ChevronDown, FileText, MapPin, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem, StoreGroup } from '../types';

interface StoreCartGroupProps {
    store: StoreGroup;
    items: CartItem[];
    onToggleStore: (storeId: string, checked: boolean) => void;
    onToggleItem: (itemId: string) => void;
    onUpdateQuantity: (itemId: string, delta: number) => void;
    onRemoveItem: (itemId: string) => void;
    onUpdateNote: (storeId: string, note: string) => void;
}

export function StoreCartGroup({
    store,
    items,
    onToggleStore,
    onToggleItem,
    onUpdateQuantity,
    onRemoveItem,
    onUpdateNote,
}: StoreCartGroupProps) {
    if (items.length === 0) {
        return null;
    }

    const isStoreChecked = items.length > 0 && items.every((i) => i.isSelected);

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
            {/* Store Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 bg-gray-50/70 -mx-5 -mt-5 px-5 pt-4 rounded-t-2xl border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={isStoreChecked}
                        onChange={(e) => onToggleStore(store.id, e.target.checked)}
                        className="w-4 h-4 rounded text-[#7D3394] focus:ring-[#7D3394] accent-[#7D3394] cursor-pointer"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-sm sm:text-base font-bold text-gray-900">
                            {store.name}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#7D3394]" />
                            <span>{store.district}, {store.city}</span>
                        </div>
                    </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F0E6F5] text-[#7D3394] text-xs font-bold">
                    {store.badge}
                </span>
            </div>

            {/* Product Items in this Store */}
            <div className="flex flex-col divide-y divide-gray-100">
                {items.map((item) => {
                    const itemSubtotal = item.price * item.quantity;

                    return (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row gap-4 py-4 items-start sm:items-center first:pt-1 last:pb-1"
                        >
                            {/* Checkbox & Thumbnail */}
                            <div className="flex items-center gap-3 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={item.isSelected}
                                    onChange={() => onToggleItem(item.id)}
                                    className="w-4 h-4 rounded text-[#7D3394] focus:ring-[#7D3394] accent-[#7D3394] cursor-pointer"
                                />
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.imageAlt}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                                item.stockInfo.includes('Sisa')
                                                    ? 'bg-amber-50 text-amber-700'
                                                    : 'bg-emerald-50 text-emerald-700'
                                            }`}
                                        >
                                            {item.stockInfo}
                                        </span>
                                    </div>

                                    <h2 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2">
                                        {item.name}
                                    </h2>

                                    {/* Variant selector pill */}
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs w-fit">
                                        <span>{item.variant}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                    </div>
                                </div>

                                {/* Price Row */}
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-lg sm:text-xl font-extrabold text-[#DC2626]">
                                        {formatRupiah(item.price)}
                                    </span>
                                    {item.originalPrice && (
                                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                                            {formatRupiah(item.originalPrice)}
                                        </span>
                                    )}
                                    {item.discountPercent && (
                                        <span className="text-xs font-bold text-[#DC2626] bg-red-50 px-1.5 py-0.5 rounded">
                                            -{item.discountPercent}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quantity Controls & Subtotal */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0">
                                <div className="flex items-center rounded-lg bg-gray-100 p-1 border border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (item.quantity === 1) {
                                                onRemoveItem(item.id);
                                            } else {
                                                onUpdateQuantity(item.id, -1);
                                            }
                                        }}
                                        title={item.quantity === 1 ? 'Hapus item' : 'Kurangi kuantitas'}
                                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-700 shadow-2xs cursor-pointer"
                                    >
                                        {item.quantity === 1 ? (
                                            <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                                        ) : (
                                            <Minus className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                    <span className="w-10 text-center font-bold text-sm text-gray-900">
                                        {item.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        title="Tambah kuantitas"
                                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-[#7D3394] shadow-2xs cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block sm:hidden">
                                        Subtotal:
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        Subtotal: {formatRupiah(itemSubtotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Note to seller */}
            <div className="pt-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-[#7D3394] transition-colors">
                    <FileText className="w-4 h-4 text-[#7D3394] shrink-0" />
                    <input
                        type="text"
                        value={store.note}
                        onChange={(e) => onUpdateNote(store.id, e.target.value)}
                        placeholder={store.notePlaceholder}
                        className="bg-transparent text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 w-full focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}

