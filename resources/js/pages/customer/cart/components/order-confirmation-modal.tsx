import { useEffect } from 'react';
import { CheckCircle2, Store, Truck, X } from 'lucide-react';
import type { CartCalculation, CartItem } from '../types';

interface OrderConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: CartItem[];
    calculation: CartCalculation;
}

export function OrderConfirmationModal({
    isOpen,
    onClose,
    selectedItems,
    calculation,
}: OrderConfirmationModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto transform transition-all border border-gray-100">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 p-1.5 rounded-full cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Success Animation Icon */}
                <div className="flex flex-col items-center text-center gap-3 pt-2">
                    <div className="w-16 h-16 rounded-full bg-[#F0E6F5] flex items-center justify-center text-[#7D3394] relative">
                        <CheckCircle2 className="w-9 h-9" />
                        <div className="absolute inset-0 rounded-full border-2 border-[#7D3394] animate-ping opacity-25" />
                    </div>

                    <div>
                        <span className="text-xs text-[#7D3394] font-extrabold">
                            Alhamdulillah
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5">
                            Pesanan Berhasil Dibuat!
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            Jazakillahu khairan! Terima kasih telah berbelanja dan mendukung kemandirian UMKM Muslimah Kossuma Kota Bogor.
                        </p>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold font-mono">
                        No. Pesanan: #KSSM-202505-0891
                    </div>
                </div>

                {/* Order Details Summary Box */}
                <div className="rounded-2xl bg-gray-50 border border-gray-200/70 p-4 flex flex-col gap-3">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                        Rincian Pembelian ({selectedItems.length} Produk):
                    </span>

                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {selectedItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs"
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.imageAlt}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-gray-900 truncate">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                                        <span>{item.quantity} pack x {formatRupiah(item.price)}</span>
                                        <span className="font-bold text-gray-900">
                                            {formatRupiah(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs text-gray-600 pt-1 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span>Metode Pembayaran:</span>
                            <span className="font-bold text-gray-900">
                                QRIS / VA Bank Syariah Indonesia (BSI)
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Biaya Layanan &amp; Infaq:</span>
                            <span className="text-gray-900">
                                {formatRupiah(calculation.serviceFee)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Ongkir Bogor Sameday:</span>
                            <span className="text-[#059669] font-bold">
                                GRATIS Promo
                            </span>
                        </div>
                        <div className="h-px bg-gray-200 my-0.5" />
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-gray-900">Total Pembayaran:</span>
                            <span className="font-extrabold text-[#DC2626] text-base">
                                {formatRupiah(calculation.grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#7D3394] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                        <span>Selesai &amp; Lanjut Belanja</span>
                        <Store className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 px-6 rounded-xl bg-gray-100 text-[#7D3394] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Truck className="w-4 h-4" />
                        <span>Lihat Status Pengiriman</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

