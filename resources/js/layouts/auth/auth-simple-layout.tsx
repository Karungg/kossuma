import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { CartFooter } from '@/pages/customer/cart/components/cart-footer';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="bg-[#F8F9FB] min-h-screen text-[#1F2937] font-sans antialiased flex flex-col justify-between">
            {/* Focused Auth Header: Navbar without storefront distractions */}
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

            {/* Main Auth Content */}
            <main className="w-full pt-28 pb-6 px-4 sm:px-6 flex-1 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8">
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
            </main>

            {/* Unified Storefront Footer */}
            <CartFooter />
        </div>
    );
}
