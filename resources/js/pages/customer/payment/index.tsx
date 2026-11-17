import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    CheckCircle2,
    Clock,
    Copy,
    Home,
    QrCode,
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { checkout, home } from '@/routes';
import { HomeLayout } from '@/layouts/home-layout';

interface PaymentPageProps {
    method: 'qris' | 'bank' | 'cod' | string;
    bank: 'bsi' | 'bca' | 'mandiri' | 'bri' | string;
    total: number;
    orderId: string;
}

const BANK_DETAILS: Record<
    string,
    { name: string; vaNumber: string }
> = {
    bsi: {
        name: 'Bank Syariah Indonesia (BSI)',
        vaNumber: '9008 0812 8844 1122',
    },
    bca: {
        name: 'Bank Central Asia (BCA)',
        vaNumber: '3901 0812 8844 1122',
    },
    mandiri: {
        name: 'Bank Mandiri',
        vaNumber: '8950 8812 8844 1122',
    },
    bri: {
        name: 'Bank Rakyat Indonesia (BRI)',
        vaNumber: '1280 0812 8844 1122',
    },
};

export default function PaymentPage({
    method = 'qris',
    bank = 'bsi',
    total = 35000,
    orderId = 'KSM-20261115-0842',
}: PaymentPageProps) {
    const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 59 * 60 + 50);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        if (isPaid) {
            return;
        }
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaid]);

    const formatCountdown = (secs: number) => {
        const hrs = Math.floor(secs / 3600)
            .toString()
            .padStart(2, '0');
        const mins = Math.floor((secs % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const remSecs = (secs % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${remSecs}`;
    };

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const handleCopy = (text: string, label: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedText(label);
            setTimeout(() => setCopiedText(null), 2000);
        }
    };

    const bankInfo = BANK_DETAILS[bank] ?? BANK_DETAILS.bsi;

    return (
        <HomeLayout cartCount={isPaid ? 0 : 1}>
            <Head title="Pembayaran Pesanan - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Selesaikan pembayaran pesanan UMKM Kossuma Kota Bogor."
                />
            </Head>
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
                {!isPaid ? (
                    <>
                        {/* Tombol Kembali */}
                        <div className="flex items-center justify-between gap-3">
                            <Link
                                href={checkout()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-[#7D3394] text-xs font-bold cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Ubah Metode Pembayaran</span>
                            </Link>
                            <span className="text-xs font-semibold text-gray-500">
                                Mode Demo Pembayaran
                            </span>
                        </div>

                        {/* Header Status Pembayaran */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-gray-500">
                                        Nomor Pesanan
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {orderId}
                                    </span>
                                </div>

                                {method !== 'cod' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                                        <Clock className="w-4 h-4 shrink-0" />
                                        <span>Selesaikan dalam {formatCountdown(secondsLeft)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-gray-500">
                                        Total Tagihan
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-extrabold text-[#DC2626]">
                                        {formatRupiah(total)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(String(total), 'nominal')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>
                                        {copiedText === 'nominal' ? 'Tersalin' : 'Salin Nominal'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Konten Khusus Metode Pembayaran */}
                        {method === 'qris' && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center gap-5 text-center">
                                <div className="flex items-center gap-2 text-[#7D3394]">
                                    <QrCode className="w-6 h-6" />
                                    <h1 className="text-lg font-extrabold text-gray-900">
                                        Pembayaran QRIS
                                    </h1>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-gray-900">
                                        Kossuma Kota Bogor
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        NMID: ID1020304050607 (Contoh Demo)
                                    </span>
                                </div>

                                {/* QR Code SVG Dummy Bersih */}
                                <div className="p-4 rounded-2xl bg-white border-2 border-gray-200">
                                    <svg
                                        width="192"
                                        height="192"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-label="QR Code Pembayaran Dummy"
                                        className="text-gray-900"
                                    >
                                        <rect x="2" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                                        <rect x="4" y="4" width="3" height="3" fill="currentColor" />
                                        <rect x="15" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                                        <rect x="17" y="4" width="3" height="3" fill="currentColor" />
                                        <rect x="2" y="15" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                                        <rect x="4" y="17" width="3" height="3" fill="currentColor" />
                                        <path
                                            d="M11 3H13V5H11V3ZM11 7H13V11H11V7ZM3 11H7V13H3V11ZM9 11H11V13H9V11ZM13 11H15V13H13V11ZM17 11H22V13H17V11ZM11 13H13V17H11V13ZM15 15H17V17H15V15ZM19 15H22V17H19V15ZM13 17H15V19H13V17ZM17 17H19V21H17V17ZM11 19H13V22H11V19ZM15 19H17V22H15V19ZM19 19H22V22H19V19Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>

                                <div className="w-full text-left p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                                    <span className="text-xs font-bold text-gray-900">
                                        Cara Membayar dengan QRIS:
                                    </span>
                                    <ol className="list-decimal pl-4 text-xs text-gray-600 space-y-1">
                                        <li>Buka aplikasi pembayaran atau m-Banking pilihan Anda.</li>
                                        <li>Pilih menu pindai QR / QRIS.</li>
                                        <li>Arahkan kamera ke kode QR di atas, pastikan nama penerima Kossuma Kota Bogor.</li>
                                        <li>Periksa total nominal lalu masukkan PIN untuk menyelesaikan pembayaran.</li>
                                    </ol>
                                </div>
                            </div>
                        )}

                        {method === 'bank' && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col gap-5">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                                    <Building2 className="w-6 h-6 text-[#7D3394]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">
                                            Transfer Virtual Account
                                        </span>
                                        <h1 className="text-base sm:text-lg font-extrabold text-gray-900">
                                            {bankInfo.name}
                                        </h1>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-[#F0E6F5]/40 border border-[#E2C9EB] flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-gray-600">
                                            Nomor Virtual Account
                                        </span>
                                        <span className="text-xl sm:text-2xl font-extrabold text-[#7D3394] tracking-wide">
                                            {bankInfo.vaNumber}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy(
                                                bankInfo.vaNumber.replace(/\s+/g, ''),
                                                'va',
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E2C9EB] text-xs font-bold text-[#7D3394] cursor-pointer"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>
                                            {copiedText === 'va' ? 'Nomor Disalin' : 'Salin Nomor'}
                                        </span>
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                                    <span className="text-xs font-bold text-gray-900">
                                        Petunjuk Pembayaran:
                                    </span>
                                    <ol className="list-decimal pl-4 text-xs text-gray-600 space-y-1">
                                        <li>Masuk ke aplikasi m-Banking {bankInfo.name} atau ATM terdekat.</li>
                                        <li>Pilih menu Transfer &rarr; Virtual Account Billing.</li>
                                        <li>Masukkan nomor Virtual Account di atas lalu periksa rincian tagihan.</li>
                                        <li>Selesaikan transaksi dengan PIN Anda.</li>
                                    </ol>
                                </div>
                            </div>
                        )}

                        {method === 'cod' && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col gap-4">
                                <div className="flex items-center gap-2.5">
                                    <Banknote className="w-6 h-6 text-[#7D3394]" />
                                    <h1 className="text-lg font-extrabold text-gray-900">
                                        Bayar di Tempat (COD)
                                    </h1>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Pesanan Anda akan segera disiapkan oleh mitra UMKM Kossuma Kota Bogor. Silakan siapkan uang tunai sejumlah{' '}
                                    <strong className="text-gray-900">{formatRupiah(total)}</strong>{' '}
                                    untuk dibayarkan langsung kepada kurir saat pesanan tiba.
                                </p>
                            </div>
                        )}

                        {/* Tombol Simulasi Demo */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col gap-3">
                            <span className="text-xs text-gray-500 text-center">
                                Tombol simulasi di bawah ini hanya untuk keperluan demo sebelum terhubung ke payment gateway
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsPaid(true)}
                                className="w-full py-3.5 px-6 rounded-xl bg-[#059669] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>
                                    {method === 'cod'
                                        ? 'Konfirmasi Pesanan COD'
                                        : 'Simulasi Pembayaran Berhasil'}
                                </span>
                            </button>
                        </div>
                    </>
                ) : (
                    /* Tampilan Status Pembayaran Lunas / Berhasil */
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col items-center text-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                {method === 'cod'
                                    ? 'Pesanan Berhasil Dikonfirmasi!'
                                    : 'Pembayaran Berhasil!'}
                            </h1>
                            <p className="text-sm text-gray-600 max-w-md">
                                Terima kasih telah berbelanja produk UMKM halal di Kossuma Kota Bogor. Pesanan Anda dengan nomor{' '}
                                <strong className="text-gray-900">{orderId}</strong> sedang diteruskan ke produsen untuk segera diproses.
                            </p>
                        </div>

                        <div className="w-full max-w-sm p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nomor Pesanan</span>
                                <span className="font-bold text-gray-900">{orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Pembayaran</span>
                                <span className="font-bold text-[#DC2626]">
                                    {formatRupiah(total)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-[#059669]">
                                    {method === 'cod' ? 'Diproses (Bayar di Tempat)' : 'Lunas'}
                                </span>
                            </div>
                        </div>

                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7D3394] text-white text-sm font-bold cursor-pointer"
                        >
                            <Home className="w-4 h-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
}
