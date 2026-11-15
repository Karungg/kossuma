import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { home } from '@/routes';

interface CartBreadcrumbBarProps {
    totalItemCount: number;
    selectedCount: number;
    isAllSelected: boolean;
    onToggleSelectAll: (checked: boolean) => void;
    onDeleteSelected: () => void;
}

export function CartBreadcrumbBar({
    totalItemCount,
    selectedCount,
    isAllSelected,
    onToggleSelectAll,
    onDeleteSelected,
}: CartBreadcrumbBarProps) {
    return (
        <div className="bg-white rounded-xl px-4 py-3.5 border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-[#7D3394] text-xs font-bold shrink-0 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Beranda</span>
                </Link>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                        Keranjang Belanja
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => onToggleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded text-[#7D3394] focus:ring-[#7D3394] accent-[#7D3394] cursor-pointer"
                    />
                    <span className="text-gray-900 font-semibold">
                        Pilih Semua ({selectedCount})
                    </span>
                </label>
                <div className="h-4 w-px bg-gray-200" />
                <button
                    type="button"
                    onClick={onDeleteSelected}
                    disabled={selectedCount === 0}
                    className="text-[#DC2626] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 font-semibold focus:outline-none cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Terpilih</span>
                </button>
            </div>
        </div>
    );
}

