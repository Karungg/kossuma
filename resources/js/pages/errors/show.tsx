import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, LogIn, RefreshCw } from 'lucide-react';
import { CartFooter } from '@/pages/customer/cart/components/cart-footer';
import { home, login } from '@/routes';

type ErrorDetails = {
    title: string;
    description: string;
};

const ERROR_MESSAGES: Record<number, ErrorDetails> = {
    401: {
        title: 'Sesi Anda Telah Berakhir',
        description:
            'Silakan masuk kembali ke akun Anda untuk melanjutkan aktivitas.',
    },
    403: {
        title: 'Akses Tidak Diizinkan',
        description:
            'Maaf, Anda tidak memiliki izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        description:
            'Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau alamatnya keliru.',
    },
    419: {
        title: 'Halaman Kedaluwarsa',
        description:
            'Halaman sudah terlalu lama terbuka. Silakan muat ulang halaman lalu coba kembali.',
    },
    429: {
        title: 'Terlalu Banyak Permintaan',
        description:
            'Mohon tunggu sebentar sebelum mencoba kembali.',
    },
    500: {
        title: 'Terjadi Gangguan Sistem',
        description:
            'Maaf, sistem kami sedang mengalami kendala. Silakan coba beberapa saat lagi.',
    },
    503: {
        title: 'Sedang Dalam Pemeliharaan',
        description:
            'Layanan Kossuma sedang diperbarui sebentar. Silakan kunjungi kembali beberapa menit lagi.',
    },
};

function getErrorDetails(status: number): ErrorDetails {
    if (ERROR_MESSAGES[status]) {
        return ERROR_MESSAGES[status];
    }

    if (status >= 500) {
        return ERROR_MESSAGES[500];
    }

    return {
        title: 'Permintaan Tidak Dapat Diproses',
        description:
            'Terjadi kendala saat memproses permintaan Anda. Silakan kembali ke beranda atau coba lagi.',
    };
}

export default function ErrorShow({ status }: { status: number }) {
    const details = getErrorDetails(status);
    const isUnauthorized = status === 401;

    return (
        <div className="bg-[#F8F9FB] min-h-screen text-[#1F2937] font-sans antialiased flex flex-col justify-between">
            <Head title={`${status} - ${details.title}`} />

            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-gray-100">
                <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    <Link
                        href={home()}
                        className="flex items-center gap-3 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394] rounded-lg p-1 cursor-pointer"
                    >
                        <img
                            src="/assets/images/logo/logo.png"
                            alt="Kossuma Kota Bogor"
                            className="h-14 w-auto object-contain cursor-pointer"
                        />
                        <span className="sr-only">Kossuma Kota Bogor</span>
                    </Link>

                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#7D3394] transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>
            </header>

            <main className="w-full pt-28 pb-6 px-4 sm:px-6 flex-1 flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 text-center flex flex-col items-center gap-5">
                    <span className="px-3.5 py-1 rounded-full bg-[#F0E6F5] text-[#7D3394] border border-[#E2C9EB] text-xs font-bold">
                        Kode {status}
                    </span>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            {details.title}
                        </h1>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {details.description}
                        </p>
                    </div>

                    <div className="w-full pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {isUnauthorized ? (
                            <Link
                                href={login()}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7D3394] text-white text-sm font-bold cursor-pointer"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Masuk Sekarang</span>
                            </Link>
                        ) : (
                            <Link
                                href={home()}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7D3394] text-white text-sm font-bold cursor-pointer"
                            >
                                <Home className="w-4 h-4" />
                                <span>Kembali ke Beranda</span>
                            </Link>
                        )}

                        {isUnauthorized ? (
                            <Link
                                href={home()}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold cursor-pointer"
                            >
                                <Home className="w-4 h-4" />
                                <span>Kembali ke Beranda</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Muat Ulang</span>
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <CartFooter />
        </div>
    );
}
