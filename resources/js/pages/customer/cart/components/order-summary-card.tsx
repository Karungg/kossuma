import { Receipt, ShoppingBag } from 'lucide-react';
import { router } from '@inertiajs/react';
import { checkout } from '@/routes';
import type { CartCalculation } from '../types';

interface OrderSummaryCardProps {
    calculation: CartCalculation;
}

export function OrderSummaryCard({ calculation }: OrderSummaryCardProps) {
    const { selectedCount, originalItemsTotal, discountTotal, subtotal } = calculation;

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const handleProceedToCheckout = () => {
        if (selectedCount > 0) {
            router.visit(checkout());
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5 sticky top-36">
            <h2 className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <span>Ringkasan Belanja</span>
                <Receipt className="text-[#7D3394] w-5 h-5" />
            </h2>

            {/* Rincian Subtotal & Diskon Produk */}
            <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                    <span>Total Harga ({selectedCount} Produk)</span>
                    <span className="font-semibold text-gray-900">
                        {formatRupiah(originalItemsTotal)}
                    </span>
                </div>

                {discountTotal > 0 && (
                    <div className="flex items-center justify-between text-gray-600">
                        <span>Diskon Produk</span>
                        <span className="font-semibold text-[#DC2626]">
                            -{formatRupiah(discountTotal)}
                        </span>
                    </div>
                )}

                <div className="h-px bg-gray-200 my-1" />

                <div className="flex items-baseline justify-between pt-1">
                    <span className="text-base font-extrabold text-gray-900">
                        Subtotal
                    </span>
                    <span className="text-xl sm:text-2xl text-[#DC2626] font-extrabold tracking-tight">
                        {formatRupiah(subtotal)}
                    </span>
                </div>
            </div>

            {/* Tombol Lanjut ke Checkout */}
            <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={selectedCount === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-[#7D3394] text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
                <ShoppingBag className="w-5 h-5" />
                <span>
                    {selectedCount > 0
                        ? `Lanjut ke Checkout (${selectedCount})`
                        : 'Pilih Produk untuk Melanjutkan'}
                </span>
            </button>

            <div className="pt-1 flex flex-col gap-1 text-[11px] text-gray-500 text-center">
                <span>Alamat, pengiriman, dan voucher dipilih di halaman checkout</span>
            </div>
        </div>
    );
}
