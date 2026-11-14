import { Truck } from 'lucide-react';

interface ShippingProgressBannerProps {
    currentTotal: number;
    threshold: number;
}

export function ShippingProgressBanner({
    currentTotal,
    threshold,
}: ShippingProgressBannerProps) {
    const remaining = Math.max(0, threshold - currentTotal);
    const progressPercent = Math.min(100, Math.round((currentTotal / threshold) * 100));
    const isFreeShipping = remaining === 0;

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div className="bg-[#F7F2F9] border border-[#E2C9EB] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#7D3394] text-white flex items-center justify-center shrink-0 shadow-md">
                <Truck className="w-6 h-6" />
            </div>

            <div className="flex-1 w-full flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-sm font-bold text-gray-900">
                        {isFreeShipping ? (
                            <span className="text-[#059669]">
                                Alhamdulillah! Anda Mendapatkan Promo Bebas Ongkir Se-Kota Bogor!
                            </span>
                        ) : (
                            <>
                                Tambah{' '}
                                <span className="text-[#DC2626]">
                                    {formatRupiah(remaining)} lagi
                                </span>{' '}
                                untuk Promo Bebas Ongkir Se-Kota Bogor!
                            </>
                        )}
                    </p>
                    <span className="text-xs font-bold text-[#7D3394]">
                        {formatRupiah(currentTotal)} / {formatRupiah(threshold)}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                        className="bg-[#7D3394] h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <p className="text-[11px] text-gray-500">
                    Didukung kurir kemitraan santun Kossuma Express dengan jaminan penanganan produk makanan halal &amp; higienis.
                </p>
            </div>
        </div>
    );
}

