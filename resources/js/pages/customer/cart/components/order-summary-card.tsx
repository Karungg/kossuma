import { router } from '@inertiajs/react';
import { AlertCircle, Receipt, ShoppingBag } from 'lucide-react';
import { checkout } from '@/routes';
import type { CartCalculation } from '../types';

interface OrderSummaryCardProps {
    calculation: CartCalculation;
}

export function OrderSummaryCard({ calculation }: OrderSummaryCardProps) {
    const {
        selectedCount,
        selectedUnits,
        originalItemsTotal,
        discountTotal,
        subtotal,
        hasBlockingSelectionIssue,
    } = calculation;

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');
    const canProceed = selectedCount > 0 && !hasBlockingSelectionIssue;

    const handleProceedToCheckout = () => {
        if (canProceed) {
            router.visit(checkout());
        }
    };

    return (
        <div className="sticky top-36 flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <h2 className="flex items-center justify-between text-lg font-bold text-gray-900">
                <span>Ringkasan Belanja</span>
                <Receipt className="h-5 w-5 text-[#7D3394]" />
            </h2>

            <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                    <span>Total Harga ({selectedUnits} Barang)</span>
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

                <div className="my-1 h-px bg-gray-100" />

                <div className="flex items-baseline justify-between pt-1">
                    <span className="text-base font-extrabold text-gray-900">
                        Subtotal
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-[#DC2626] sm:text-2xl">
                        {formatRupiah(subtotal)}
                    </span>
                </div>
            </div>

            {hasBlockingSelectionIssue && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                        Ada produk terpilih yang jumlahnya melebihi stok
                        tersedia. Sesuaikan jumlah terlebih dahulu sebelum
                        melanjutkan.
                    </span>
                </div>
            )}

            <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={!canProceed}
                data-test="proceed-checkout-button"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-6 py-3.5 text-sm font-bold text-white shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ShoppingBag className="h-5 w-5" />
                <span>
                    {canProceed
                        ? `Lanjut ke Checkout (${selectedCount})`
                        : hasBlockingSelectionIssue
                          ? 'Sesuaikan Stok Terlebih Dahulu'
                          : 'Pilih Produk untuk Melanjutkan'}
                </span>
            </button>

            <div className="flex flex-col gap-1 pt-1 text-center text-[11px] text-gray-500">
                <span>
                    Catatan pesanan, alamat, pengiriman, dan voucher diisi di
                    halaman checkout
                </span>
            </div>
        </div>
    );
}
