import { useState } from 'react';
import {
    CheckCircle2,
    Heart,
    MessageSquare,
    Minus,
    Pencil,
    Plus,
    Share2,
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { cart } from '@/routes';
import type { ProductDetail } from '../types';

interface PurchaseActionPodProps {
    product: ProductDetail;
    onAddToCart: (quantity: number) => void;
}

export function PurchaseActionPod({
    product,
    onAddToCart,
}: PurchaseActionPodProps) {
    const [quantity, setQuantity] = useState(1);
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [note, setNote] = useState('');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const maxStock = product.stockCount ?? 24;
    const subtotal = quantity * product.price;
    const originalSubtotal =
        product.originalPrice > 0 ? quantity * product.originalPrice : 0;

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const handleIncrement = () =>
        setQuantity((prev) => Math.min(maxStock, prev + 1));
    const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3500);
    };

    const handleAddToCartClick = () => {
        onAddToCart(quantity);
        triggerToast(`${quantity} pack ${product.name} masuk keranjang.`);
    };

    const handleBuyNowClick = () => {
        onAddToCart(quantity);
        router.visit(cart());
    };

    const handleShareClick = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            triggerToast('Tautan produk berhasil disalin.');
        }
    };

    const thumbnailImage = product.images[0]?.url;

    return (
        <div className="flex flex-col gap-3">
            {/* Banner Promo / Diskon */}
            {product.discountPercent > 0 && (
                <div className="px-4 py-2.5 rounded-xl bg-[#7D3394] text-white flex items-center justify-between gap-2 shadow-xs">
                    <span className="text-xs font-bold">Spesial Diskon</span>
                    <span className="px-2 py-0.5 rounded bg-white text-[#7D3394] text-xs font-extrabold">
                        Hemat {product.discountPercent}%
                    </span>
                </div>
            )}

            {/* Card Atur Jumlah & Checkout */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-bold text-gray-900">
                    Atur jumlah dan catatan
                </h2>

                {/* Mini Preview Varian */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                    <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                        {thumbnailImage ? (
                            <img
                                src={thumbnailImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-[10px] text-gray-400">Foto</span>
                        )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 line-clamp-2">
                        {product.unitLabel ?? '1 Pack'}
                    </span>
                </div>

                {/* Counter & Info Stok */}
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                            aria-label="Kurangi jumlah"
                            className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:text-gray-300 cursor-pointer"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                            type="text"
                            readOnly
                            value={quantity}
                            aria-label="Jumlah pembelian"
                            className="w-9 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleIncrement}
                            disabled={quantity >= maxStock}
                            aria-label="Tambah jumlah"
                            className="w-8 h-8 flex items-center justify-center text-[#7D3394] disabled:text-gray-300 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="text-xs text-gray-600">
                        Stok:{' '}
                        <strong className="text-gray-900">
                            {product.stockCount ?? 'Tersedia'}
                        </strong>
                    </div>
                </div>

                {/* Tambah Catatan */}
                <div className="flex flex-col gap-2">
                    {!showNoteInput ? (
                        <button
                            type="button"
                            onClick={() => setShowNoteInput(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7D3394] w-fit cursor-pointer"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Tambah Catatan</span>
                        </button>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Contoh: Sambal dipisah ya Bu"
                                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:border-[#7D3394] focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNoteInput(false)}
                                className="text-[11px] font-medium text-gray-500 w-fit cursor-pointer"
                            >
                                Tutup catatan
                            </button>
                        </div>
                    )}
                </div>

                {/* Subtotal */}
                <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-500">
                        Subtotal
                    </span>
                    <div className="flex flex-col items-end">
                        {originalSubtotal > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                                {formatRupiah(originalSubtotal)}
                            </span>
                        )}
                        <span className="text-lg font-extrabold text-gray-900">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={handleAddToCartClick}
                        className="w-full h-10 rounded-lg bg-[#7D3394] text-white font-bold text-sm flex items-center justify-center cursor-pointer"
                    >
                        + Keranjang
                    </button>
                    <button
                        type="button"
                        onClick={handleBuyNowClick}
                        className="w-full h-10 rounded-lg border border-[#7D3394] text-[#7D3394] font-bold text-sm flex items-center justify-center cursor-pointer"
                    >
                        Beli Langsung
                    </button>
                </div>

                {/* Baris Aksi Bawah: Chat, Wishlist, Share */}
                <div className="grid grid-cols-3 pt-2 border-t border-gray-100 text-xs font-bold text-gray-700">
                    <a
                        href="#ulasan-produk"
                        className="flex items-center justify-center gap-1.5 py-1 border-r border-gray-200 cursor-pointer"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                    </a>
                    <button
                        type="button"
                        onClick={() => setIsWishlisted((prev) => !prev)}
                        className={`flex items-center justify-center gap-1.5 py-1 border-r border-gray-200 cursor-pointer ${
                            isWishlisted ? 'text-[#DC2626]' : 'text-gray-700'
                        }`}
                    >
                        <Heart
                            className={`w-3.5 h-3.5 ${
                                isWishlisted ? 'fill-[#DC2626] text-[#DC2626]' : ''
                            }`}
                        />
                        <span>Wishlist</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleShareClick}
                        className="flex items-center justify-center gap-1.5 py-1 cursor-pointer"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
                    <div className="p-4 rounded-xl bg-gray-900 text-white shadow-2xl flex items-center justify-between gap-3 border border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold">Berhasil!</span>
                                <span className="text-xs text-gray-300 line-clamp-1">
                                    {toastMessage}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={cart()}
                            className="px-3 py-1.5 rounded-full bg-[#7D3394] text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                            Keranjang
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
