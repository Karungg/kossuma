import { ChevronRight, Info, Receipt, ShoppingBag, Ticket } from 'lucide-react';
import type { CartCalculation } from '../types';

interface OrderSummaryCardProps {
    calculation: CartCalculation;
    onOpenCheckoutModal: () => void;
}

export function OrderSummaryCard({
    calculation,
    onOpenCheckoutModal,
}: OrderSummaryCardProps) {
    const {
        selectedCount,
        itemsTotal,
        discountTotal,
        shippingFee,
        shippingDiscount,
        serviceFee,
        grandTotal,
    } = calculation;

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5 sticky top-36">
            <h2 className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <span>Ringkasan Belanja</span>
                <Receipt className="text-[#7D3394] w-5 h-5" />
            </h2>

            {/* Voucher & Promo Card */}
            <div className="rounded-xl bg-[#F7F2F9] border border-[#E2C9EB] p-3.5 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                    <Ticket className="text-[#7D3394] w-5 h-5 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">
                            Makin Hemat Pakai Promo
                        </span>
                        <span className="text-[11px] text-[#7D3394] font-semibold">
                            Kupon DISKON10K Tersedia
                        </span>
                    </div>
                </div>
                <ChevronRight className="text-gray-400 w-4 h-4" />
            </div>

            {/* Price Breakdown Calculation */}
            <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                    <span>Total Harga ({selectedCount} Produk)</span>
                    <span className="font-semibold text-gray-900">
                        {formatRupiah(itemsTotal)}
                    </span>
                </div>

                {discountTotal > 0 && (
                    <div className="flex items-center justify-between text-gray-600">
                        <span>Total Diskon Produk</span>
                        <span className="font-semibold text-[#DC2626]">
                            -{formatRupiah(discountTotal)}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold text-gray-900">
                        {selectedCount > 0 ? formatRupiah(shippingFee) : 'Rp0'}
                    </span>
                </div>

                {selectedCount > 0 && shippingDiscount > 0 && (
                    <div className="flex items-center justify-between text-gray-600">
                        <span>Diskon Ongkos Kirim</span>
                        <span className="font-bold text-[#059669]">
                            -{formatRupiah(shippingDiscount)} (Gratis)
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-1">
                        <span>Biaya Layanan &amp; Infaq Koperasi</span>
                        <span title="Infaq Rp500 & Layanan Rp500" className="cursor-help">
                            <Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                        {selectedCount > 0 ? formatRupiah(serviceFee) : 'Rp0'}
                    </span>
                </div>

                {/* Visual Separator */}
                <div className="h-px bg-gray-200 my-1" />

                {/* Grand Total Row */}
                <div className="flex items-baseline justify-between pt-1">
                    <div className="flex flex-col">
                        <span className="text-base font-extrabold text-gray-900">
                            Total Pembayaran
                        </span>
                        <span className="text-[11px] text-gray-500">
                            Termasuk infaq berkah Rp500
                        </span>
                    </div>
                    <span className="text-xl sm:text-2xl text-[#DC2626] font-extrabold tracking-tight">
                        {formatRupiah(grandTotal)}
                    </span>
                </div>
            </div>

            {/* Primary Checkout Button */}
            <button
                type="button"
                onClick={onOpenCheckoutModal}
                disabled={selectedCount === 0}
                className="w-full py-4 px-6 rounded-xl bg-[#7D3394] text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
                <ShoppingBag className="w-5 h-5" />
                <span>
                    {selectedCount > 0
                        ? `Beli Sekarang (${selectedCount} Item)`
                        : 'Pilih Item untuk Checkout'}
                </span>
            </button>

            {/* Cooperative Trust Assurance */}
            <div className="pt-1 flex flex-col gap-1 text-[11px] text-gray-500 text-center">
                <span>100% Produk Halal &amp; Higienis Mitra UMKM Binaan Kossuma</span>
            </div>
        </div>
    );
}

