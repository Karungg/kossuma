import { Link } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { logout } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as customerOrdersIndex } from '@/routes/customer/orders';
import { index as customerSettingsIndex } from '@/routes/customer/settings';

interface CustomerProfileDropdownProps {
    user: {
        name: string;
        email?: string;
        avatar_url?: string | null;
    };
    isAdmin: boolean;
    activeOrderCount: number;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return 'K';
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2);
    }

    return `${parts[0][0]}${parts[1][0]}`;
}

function ProfileAvatar({
    name,
    avatarUrl,
    sizeClass,
}: {
    name: string;
    avatarUrl?: string | null;
    sizeClass: string;
}) {
    const [imageError, setImageError] = useState(false);

    if (avatarUrl && !imageError) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                onError={() => setImageError(true)}
                className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-gray-200`}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-[#F0E6F5] font-bold text-[#7D3394] ring-1 ring-[#E2C9EB]`}
        >
            {getInitials(name)}
        </span>
    );
}

export function CustomerProfileDropdown({
    user,
    isAdmin,
    activeOrderCount,
}: CustomerProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const handleMouseEnter = () => {
        clearCloseTimer();
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearCloseTimer();
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative"
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label={`Menu akun ${user.name}`}
                data-test="customer-profile-trigger"
                className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-gray-50/90 py-1 pr-3 pl-1.5 text-sm font-medium text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394]"
            >
                <ProfileAvatar
                    name={user.name}
                    avatarUrl={user.avatar_url}
                    sizeClass="h-7 w-7 text-xs"
                />
                <span className="hidden max-w-[120px] truncate sm:inline">
                    {user.name}
                </span>
            </button>

            {isOpen && (
                <div
                    role="menu"
                    data-test="customer-profile-dropdown"
                    className="absolute top-full right-0 z-50 mt-2 w-64 animate-in rounded-2xl border border-gray-100 bg-white p-2 shadow-xl duration-150 zoom-in-95 fade-in"
                >
                    <div className="flex items-center gap-3 px-2.5 py-2.5">
                        <ProfileAvatar
                            name={user.name}
                            avatarUrl={user.avatar_url}
                            sizeClass="h-11 w-11 text-sm"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">
                                {user.name}
                            </p>
                            {user.email && (
                                <p className="truncate text-xs text-gray-500">
                                    {user.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="my-1 border-t border-gray-100" />

                    <div className="flex flex-col gap-0.5 py-0.5">
                        {isAdmin && (
                            <Link
                                href={dashboard()}
                                role="menuitem"
                                onClick={() => setIsOpen(false)}
                                data-test="profile-menu-dashboard"
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-[#7D3394]"
                            >
                                <LayoutDashboard className="h-4 w-4 shrink-0" />
                                <span>Dashboard Admin</span>
                            </Link>
                        )}

                        <Link
                            href={customerOrdersIndex()}
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                            data-test="profile-menu-orders"
                            className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm text-gray-700"
                        >
                            <span className="flex items-center gap-2.5">
                                <ShoppingBag className="h-4 w-4 shrink-0 text-gray-500" />
                                <span>Pembelian</span>
                            </span>
                            {activeOrderCount > 0 && (
                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#F0E6F5] px-1.5 py-0.5 text-[11px] font-bold text-[#7D3394] tabular-nums">
                                    {activeOrderCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={customerSettingsIndex()}
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                            data-test="profile-menu-settings"
                            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-gray-700"
                        >
                            <Settings className="h-4 w-4 shrink-0 text-gray-500" />
                            <span>Pengaturan</span>
                        </Link>
                    </div>

                    <div className="my-1 border-t border-gray-100" />

                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        data-test="profile-menu-logout"
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-[#DC2626]"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Keluar</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
