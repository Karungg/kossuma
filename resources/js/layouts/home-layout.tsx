import { useState, useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    LogOut,
    Menu,
    Phone,
    Search,
    ShoppingCart,
    User,
    X,
} from "lucide-react";
import { cart, dashboard, home, login, logout, register } from "@/routes";
import { CartFooter } from "@/pages/customer/cart/components/cart-footer";
import { INSTITUTIONAL_NAV_ITEMS, type NavigationItem } from "./navigation";

interface HomeLayoutProps {
    children: React.ReactNode;
    cartCount?: number;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export function HomeLayout({
    children,
    cartCount = 2,
    searchQuery = "",
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

    const isAdmin = auth?.roles?.includes("Admin") ?? false;

    const handleSearch = (val: string) => {
        setLocalSearch(val);
        if (onSearchChange) {
            onSearchChange(val);
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
            if (e.key === "Escape") {
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
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
        <div className="bg-[#F8F9FB] min-h-screen text-[#1F2937] font-sans antialiased flex flex-col justify-between">
            {/* Unified Fixed Header: Two-Tier */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-gray-100">
                {/* Tier 1: Top Utility Bar with Popover Sub-menus */}
                <div className="bg-[#F8F9FB] border-b border-gray-100/90 hidden sm:block relative">
                    <div
                        ref={navRef}
                        className="h-9 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end text-xs"
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
                                                className={`flex items-center gap-1 cursor-pointer focus:outline-none ${
                                                    isOpen
                                                        ? "text-[#7D3394] font-bold"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                <span>{item.label}</span>
                                                <ChevronDown
                                                    className={`w-3 h-3 text-gray-400 transition-transform ${
                                                        isOpen
                                                            ? "rotate-180 text-[#7D3394]"
                                                            : ""
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
                                            <div className="absolute top-full right-0 mt-2 w-80 bg-white/98 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl p-2.5 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
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
                                                        className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center shrink-0">
                                                            <sub.icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-bold text-gray-900 leading-tight">
                                                                    {sub.label}
                                                                </span>
                                                                {sub.badge && (
                                                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#F0E6F5] text-[#7D3394] font-bold">
                                                                        {
                                                                            sub.badge
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] text-gray-500 line-clamp-1 leading-normal">
                                                                {
                                                                    sub.description
                                                                }
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}

                                                <div className="pt-1.5 mt-1 border-t border-gray-100">
                                                    <Link
                                                        href={item.href}
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                null,
                                                            )
                                                        }
                                                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#7D3394] cursor-pointer"
                                                    >
                                                        <span>
                                                            Lihat {item.label}
                                                        </span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
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
                    <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                        {/* Left: Mobile Menu Button + Brand Logo */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                aria-label="Toggle Navigation Menu"
                                className="sm:hidden p-2 rounded-lg text-gray-700 cursor-pointer focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>

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
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl mx-2 hidden md:block">
                            <div className="relative flex items-center w-full">
                                <Search className="absolute left-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
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
                                isAdmin ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E2C9EB] text-sm font-semibold text-[#7D3394] cursor-pointer"
                                    >
                                        <User className="w-4 h-4" />
                                        <span className="hidden sm:inline">
                                            Dashboard
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="hidden sm:inline text-sm font-medium text-gray-700">
                                            {auth.user.name}
                                        </span>
                                        <Link
                                            href={logout()}
                                            method="post"
                                            as="button"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Keluar</span>
                                        </Link>
                                    </div>
                                )
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
                </div>

                {/* Mobile Drawer / Slide-down Hierarchical Menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-lg max-h-[80vh] overflow-y-auto">
                        <nav className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                            <Link
                                href={home()}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="py-2.5 px-3 rounded-lg bg-[#F0E6F5] text-[#7D3394] font-bold cursor-pointer"
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
                                            className="py-2.5 px-3 rounded-lg cursor-pointer"
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
                                            className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer focus:outline-none"
                                        >
                                            <span className="font-semibold text-gray-900">
                                                {item.label}
                                            </span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                                    isExpanded
                                                        ? "rotate-180 text-[#7D3394]"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        {isExpanded && item.subItems && (
                                            <div className="pl-3 pr-1 py-1 flex flex-col gap-1 border-l-2 border-[#E2C9EB] ml-3 my-1">
                                                {item.subItems.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={sub.href}
                                                        onClick={() =>
                                                            setIsMobileMenuOpen(
                                                                false,
                                                            )
                                                        }
                                                        className="flex items-start gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer text-xs"
                                                    >
                                                        <sub.icon className="w-4 h-4 text-[#7D3394] shrink-0 mt-0.5" />
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-900">
                                                                    {sub.label}
                                                                </span>
                                                                {sub.badge && (
                                                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#F0E6F5] text-[#7D3394] font-bold">
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
                                                    className="text-xs font-bold text-[#7D3394] py-1.5 px-2.5 flex items-center gap-1 cursor-pointer pt-2"
                                                >
                                                    <span>
                                                        Lihat {item.label}
                                                    </span>
                                                    <ArrowRight className="w-3 h-3" />
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
            <main className="w-full pt-20 sm:pt-[116px] flex-1">
                {children}
            </main>

            {/* Unified Footer */}
            <CartFooter />
        </div>
    );
}

export default HomeLayout;
