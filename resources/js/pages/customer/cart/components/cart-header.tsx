import { Link, usePage } from '@inertiajs/react';
import { Search, ShoppingCart, User } from 'lucide-react';
import { cart, dashboard, login, register, home } from '@/routes';

interface CartHeaderProps {
    cartCount: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function CartHeader({
    cartCount,
    searchQuery,
    onSearchChange,
}: CartHeaderProps) {
    const { auth } = usePage().props as unknown as { auth?: { user?: { name: string } | null } };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-gray-100">
            <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                {/* Brand Logo & Name */}
                <Link
                    href={home()}
                    className="flex items-center gap-3 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394] rounded-lg p-1 cursor-pointer"
                >
                    <img
                        alt="Kossuma Logo"
                        className="h-14 w-auto object-contain cursor-pointer"
                        src="/assets/images/logo/logo.png"
                    />
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-2 hidden md:block">
                    <div className="relative flex items-center w-full">
                        <Search className="absolute left-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Cari risol mayo, ayam ungkep, ikan nila..."
                            className="w-full h-11 pl-11 pr-4 rounded-full bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7D3394] focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Right Actions: Cart & Auth Navigation */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href={cart()}
                        aria-label="Keranjang Belanja"
                        className="relative p-2.5 rounded-full text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#7D3394] cursor-pointer"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-5 h-5 px-1 bg-[#DC2626] text-white font-bold text-xs rounded-full leading-none shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block" />

                    {auth?.user ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E2C9EB] text-sm font-semibold text-[#7D3394] cursor-pointer"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href={login()}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={register()}
                                className="px-3.5 py-1.5 rounded-lg text-sm font-bold bg-[#7D3394] text-white shadow-sm cursor-pointer"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

