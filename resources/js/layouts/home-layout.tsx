import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    LogOut,
    Menu,
    Search,
    ShoppingCart,
    User,
    X,
} from 'lucide-react';
import { cart, dashboard, home, login, logout, register } from '@/routes';
import { NotificationBellSheet } from '@/components/notifications/notification-bell-sheet';
import { CartFooter } from '@/pages/customer/cart/components/cart-footer';
import { INSTITUTIONAL_NAV_ITEMS } from './navigation';

interface HomeLayoutProps {
    children: React.ReactNode;
    cartCount?: number;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export function HomeLayout({
    children,
    cartCount = 2,
    searchQuery = '',
    onSearchChange,
}: HomeLayoutProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [expandedMobileAccordions, setExpandedMobileAccordions] = useState<
        Record<string, boolean>
    >({});

    const navRef = useRef<HTMLDivElement>(null);

    const { auth } = usePage().props as unknown as {
        auth?: {
            user?: { name: string } | null;
            roles?: string[];
        };
    };

    const isAdmin = auth?.roles?.includes('Admin') ?? false;

    const handleSearch = (val: string) => {
        setLocalSearch(val);
        if (onSearchChange) {
            onSearchChange(val);
        }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !onSearchChange) {
            const trimmed = localSearch.trim();
            router.get(
                home.url({
                    query: trimmed !== '' ? { search: trimmed } : undefined,
                }),
            );
        }
    };

    // Close desktop dropdown on click outside or escape key
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleDropdown = (id: string) => {
        setActiveDropdown((prev) => (prev === id ? null : id));
    };

    const toggleMobileAccordion = (id: string) => {
        setExpandedMobileAccordions((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-[#F8F9FB] font-sans text-[#1F2937] antialiased">
            {/* Unified Fixed Header: Two-Tier */}
            <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                {/* Tier 1: Top Utility Bar with Popover Sub-menus */}
                <div className="relative hidden border-b border-gray-100/90 bg-[#F8F9FB] sm:block">
                    <div
                        ref={navRef}
                        className="mx-auto flex h-9 max-w-7xl items-center justify-end px-4 text-xs sm:px-6 lg:px-8"
                    >
                        <nav className="flex items-center gap-3.5 text-xs font-medium text-gray-600">
                            {INSTITUTIONAL_NAV_ITEMS.map((item, index) => {
                                const isOpen = activeDropdown === item.id;
                                const hasSubItems = Boolean(
                                    item.subItems && item.subItems.length > 0,
                                );

                                return (
                                    <div
                                        key={item.id}
                                        className="relative flex items-center gap-3.5"
                                    >
                                        {hasSubItems ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleDropdown(item.id)
                                                }
                                                className={`flex cursor-pointer items-center gap-1 focus:outline-none ${
                                                    isOpen
                                                        ? 'font-bold text-[#7D3394]'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                <span>{item.label}</span>
                                                <ChevronDown
                                                    className={`h-3 w-3 text-gray-400 transition-transform ${
                                                        isOpen
                                                            ? 'rotate-180 text-[#7D3394]'
                                                            : ''
                                                    }`}
                                                />
                                            </button>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="cursor-pointer"
                                            >
                                                {item.label}
                                            </Link>
                                        )}

                                        {/* Desktop Popover Island Card */}
                                        {isOpen && item.subItems && (
                                            <div className="absolute top-full right-0 z-50 mt-2 flex w-80 animate-in flex-col gap-1 rounded-2xl border border-gray-100 bg-white/98 p-2.5 shadow-xl backdrop-blur-md duration-150 zoom-in-95 fade-in">
                                                <div className="px-2.5 py-1 text-xs font-bold text-gray-500">
                                                    {item.label}
                                                </div>

                                                {item.subItems.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={sub.href}
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                null,
                                                            )
                                                        }
                                                        className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5"
                                                    >
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0E6F5] text-[#7D3394]">
                                                            <sub.icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex min-w-0 flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs leading-tight font-bold text-gray-900">
                                                                    {sub.label}
                                                                </span>
                                                                {sub.badge && (
                                                                    <span className="py-0.2 rounded bg-[#F0E6F5] px-1.5 text-[10px] font-bold text-[#7D3394]">
                                                                        {
                                                                            sub.badge
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="line-clamp-1 text-[11px] leading-normal text-gray-500">
                                                                {
                                                                    sub.description
                                                                }
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}

                                                <div className="mt-1 border-t border-gray-100 pt-1.5">
                                                    <Link
                                                        href={item.href}
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                null,
                                                            )
                                                        }
                                                        className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#7D3394]"
                                                    >
                                                        <span>
                                                            Lihat {item.label}
                                                        </span>
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        {index <
                                            INSTITUTIONAL_NAV_ITEMS.length -
                                                1 && (
                                            <span className="text-gray-300">
                                                /
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tier 2: Main Commerce Bar */}
                <div className="bg-white/95 backdrop-blur-md">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        {/* Left: Mobile Menu Button + Brand Logo */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                aria-label="Toggle Navigation Menu"
                                className="cursor-pointer rounded-lg p-2 text-gray-700 focus:outline-none sm:hidden"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>

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
                        </div>

                        {/* Search Bar */}
                        <div className="mx-2 hidden max-w-xl flex-1 md:block">
                            <div className="relative flex w-full items-center">
                                <Search className="pointer-events-none absolute left-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={
                                        onSearchChange
                                            ? searchQuery
                                            : localSearch
                                    }
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Cari risol mayo, ayam ungkep, ikan nila..."
                                    className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pr-10 pl-11 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7D3394] focus:outline-none"
                                />
                                {(onSearchChange
                                    ? searchQuery
                                    : localSearch) !== '' && (
                                    <button
                                        type="button"
                                        onClick={() => handleSearch('')}
                                        aria-label="Hapus kata kunci pencarian"
                                        className="absolute right-3 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-200/80 text-gray-500"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Actions: Cart, Notifications & Auth Navigation */}
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

                            {auth?.user && <NotificationBellSheet />}

                            <div className="hidden h-6 w-px bg-gray-200 sm:block" />

                            {auth?.user ? (
                                isAdmin ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E2C9EB] px-3.5 py-1.5 text-sm font-semibold text-[#7D3394]"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            Dashboard
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                                            {auth.user.name}
                                        </span>
                                        <Link
                                            href={logout()}
                                            method="post"
                                            as="button"
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Keluar</span>
                                        </Link>
                                    </div>
                                )
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
                </div>

                {/* Mobile Drawer / Slide-down Hierarchical Menu */}
                {isMobileMenuOpen && (
                    <div className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto border-t border-gray-100 bg-white px-4 py-4 shadow-lg sm:hidden">
                        <nav className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            <Link
                                href={home()}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="cursor-pointer rounded-lg bg-[#F0E6F5] px-3 py-2.5 font-bold text-[#7D3394]"
                            >
                                Katalog Produk
                            </Link>

                            {INSTITUTIONAL_NAV_ITEMS.map((item) => {
                                const isExpanded = Boolean(
                                    expandedMobileAccordions[item.id],
                                );
                                const hasSubItems = Boolean(
                                    item.subItems && item.subItems.length > 0,
                                );

                                if (!hasSubItems) {
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="cursor-pointer rounded-lg px-3 py-2.5"
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleMobileAccordion(item.id)
                                            }
                                            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 focus:outline-none"
                                        >
                                            <span className="font-semibold text-gray-900">
                                                {item.label}
                                            </span>
                                            <ChevronDown
                                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                                    isExpanded
                                                        ? 'rotate-180 text-[#7D3394]'
                                                        : ''
                                                }`}
                                            />
                                        </button>

                                        {isExpanded && item.subItems && (
                                            <div className="my-1 ml-3 flex flex-col gap-1 border-l-2 border-[#E2C9EB] py-1 pr-1 pl-3">
                                                {item.subItems.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={sub.href}
                                                        onClick={() =>
                                                            setIsMobileMenuOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs"
                                                    >
                                                        <sub.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#7D3394]" />
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-900">
                                                                    {sub.label}
                                                                </span>
                                                                {sub.badge && (
                                                                    <span className="py-0.2 rounded bg-[#F0E6F5] px-1.5 text-[9px] font-bold text-[#7D3394]">
                                                                        {
                                                                            sub.badge
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-gray-500">
                                                                {
                                                                    sub.description
                                                                }
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}

                                                <Link
                                                    href={item.href}
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false,
                                                        )
                                                    }
                                                    className="flex cursor-pointer items-center gap-1 px-2.5 py-1.5 pt-2 text-xs font-bold text-[#7D3394]"
                                                >
                                                    <span>
                                                        Lihat {item.label}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Viewport Shell: pt-[116px] for desktop, pt-20 for mobile */}
            <main className="w-full flex-1 pt-20 sm:pt-[116px]">
                {children}
            </main>

            {/* Unified Footer */}
            <CartFooter />
        </div>
    );
}

export default HomeLayout;
