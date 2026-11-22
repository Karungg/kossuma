import { Link, usePage } from '@inertiajs/react';
import { Search, ShoppingCart, User } from 'lucide-react';
import { cart, home, login, register } from '@/routes';
import { dashboard } from '@/routes/admin';

interface HomeHeaderProps {
    cartCount?: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function HomeHeader({
    cartCount = 2,
    searchQuery,
    onSearchChange,
}: HomeHeaderProps) {
    const { auth } = usePage().props as unknown as {
        auth?: { user?: { name: string } | null };
    };

    return (
        <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Brand Logo & Name */}
                <Link
                    href={home()}
                    className="flex shrink-0 cursor-pointer items-center gap-3 rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394]"
                >
                    <img
                        alt="Kossuma Logo"
                        className="h-14 w-auto cursor-pointer object-contain"
                        src="/assets/images/logo/logo.png"
                    />
                </Link>

                {/* Search Bar */}
                <div className="mx-2 hidden max-w-xl flex-1 md:block">
                    <div className="relative flex w-full items-center">
                        <Search className="pointer-events-none absolute left-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Cari risol mayo, ayam ungkep, ikan nila..."
                            className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pr-4 pl-11 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7D3394] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Right Actions: Cart & Auth Navigation */}
                <div className="flex shrink-0 items-center gap-3">
                    <Link
                        href={cart()}
                        aria-label="Keranjang Belanja"
                        className="relative flex cursor-pointer items-center justify-center rounded-full p-2.5 text-gray-700 focus:ring-2 focus:ring-[#7D3394] focus:outline-none"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1 text-xs leading-none font-bold text-white shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <div className="hidden h-6 w-px bg-gray-200 sm:block" />

                    {auth?.user ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E2C9EB] px-3.5 py-1.5 text-sm font-semibold text-[#7D3394]"
                        >
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href={login()}
                                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={register()}
                                className="cursor-pointer rounded-lg bg-[#7D3394] px-3.5 py-1.5 text-sm font-bold text-white shadow-sm"
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
