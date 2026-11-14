import { useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cart } from '@/routes';

interface PurchaseActionPodProps {
    unitPrice: number;
    productName: string;
    onAddToCart: (quantity: number) => void;
}

export function PurchaseActionPod({
    unitPrice,
    productName,
    onAddToCart,
}: PurchaseActionPodProps) {
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);

    const subtotal = quantity * unitPrice;
    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const handleIncrement = () => setQuantity((prev) => Math.min(24, prev + 1));
    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

    const handleAddToCartClick = () => {
        onAddToCart(quantity);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3500);
    };

    return (
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Stepper */}
                <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-bold text-gray-700">
                        Jumlah Pack:
                    </span>
                    <div className="inline-flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            aria-label="Kurangi jumlah"
                            className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center font-bold text-base focus:outline-none cursor-pointer shadow-2xs"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            readOnly
                            value={quantity}
                            className="w-10 text-center bg-transparent font-bold text-sm text-gray-900 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleIncrement}
                            aria-label="Tambah jumlah"
                            className="w-8 h-8 rounded-full bg-white text-[#7D3394] flex items-center justify-center font-bold text-base focus:outline-none cursor-pointer shadow-2xs"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Subtotal calculation display */}
                <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-500">Total Nilai Pesanan:</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#DC2626]">
                        {formatRupiah(subtotal)}
                    </span>
                </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-1">
                <button
                    type="button"
                    onClick={handleAddToCartClick}
                    className="w-full h-12 rounded-full bg-[#7D3394] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span>+ Keranjang Belanja</span>
                </button>
            </div>

            {/* Toast Notification Component */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="p-4 rounded-xl bg-gray-900 text-white shadow-2xl flex items-center justify-between gap-3 border border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold">Berhasil Ditambahkan!</span>
                                <span className="text-xs text-gray-300 line-clamp-1">
                                    {quantity} pack {productName} masuk keranjang.
                                </span>
                            </div>
                        </div>
                        <Link
                            href={cart()}
                            className="px-3 py-1.5 rounded-full bg-[#7D3394] text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                            Lihat
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

