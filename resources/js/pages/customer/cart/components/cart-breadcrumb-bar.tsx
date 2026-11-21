import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { home } from '@/routes';

interface CartBreadcrumbBarProps {
    totalItemCount: number;
}

export function CartBreadcrumbBar({ totalItemCount }: CartBreadcrumbBarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
                <Link
                    href={home()}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-[#7D3394]"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Kembali ke Beranda</span>
                </Link>
                <div className="h-4 w-px bg-gray-200" />
                <h1 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
                    Keranjang Belanja
                </h1>
            </div>

            {totalItemCount > 0 && (
                <span className="text-xs font-medium text-gray-500 sm:text-sm">
                    {totalItemCount} produk di keranjang
                </span>
            )}
        </div>
    );
}
