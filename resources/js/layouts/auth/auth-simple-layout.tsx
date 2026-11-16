import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col justify-between items-center bg-[#F8F9FB] px-4 py-8 sm:px-6 sm:py-12">
            {/* Header Brand */}
            <div className="flex flex-col items-center">
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394] rounded-xl p-1 cursor-pointer"
                >
                    <img
                        src="/assets/images/logo/logo.png"
                        alt="Kossuma Kota Bogor"
                        className="h-14 sm:h-16 w-auto object-contain cursor-pointer"
                    />
                    <span className="sr-only">Kossuma Kota Bogor</span>
                </Link>
                <p className="mt-1 text-xs text-gray-500 font-medium tracking-normal text-center">
                    Koperasi Konsumen Syariah Mandiri Kota Bogor
                </p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-md my-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>

            {/* Footer Navigation & Copyright */}
            <div className="flex flex-col items-center gap-3 text-center">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#7D3394] transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Beranda</span>
                </Link>
                <p className="text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Kossuma Kota Bogor. Belanja berkah &amp; amanah.
                </p>
            </div>
        </div>
    );
}
