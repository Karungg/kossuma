import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, ShieldCheck, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HomeLayout } from '@/layouts/home-layout';
import { home } from '@/routes';
import { index as customerSettingsIndex } from '@/routes/customer/settings';
import { AddressesTab } from './components/addresses-tab';
import { ProfileTab } from './components/profile-tab';
import { SecurityTab } from './components/security-tab';
import type {
    CustomerAddress,
    CustomerProfileData,
    CustomerSettingsTab,
} from './types';

interface CustomerSettingsPageProps {
    activeTab: CustomerSettingsTab;
    mustVerifyEmail: boolean;
    status?: string;
    profile: CustomerProfileData;
    addresses: CustomerAddress[];
}

const SETTINGS_TABS: Array<{
    id: CustomerSettingsTab;
    label: string;
    icon: typeof User;
}> = [
    { id: 'profile', label: 'Profil Saya', icon: User },
    { id: 'addresses', label: 'Daftar Alamat', icon: MapPin },
    { id: 'security', label: 'Keamanan', icon: ShieldCheck },
];

export default function CustomerSettingsPage({
    activeTab,
    mustVerifyEmail,
    status,
    profile,
    addresses,
}: CustomerSettingsPageProps) {
    const [currentTab, setCurrentTab] =
        useState<CustomerSettingsTab>(activeTab);

    useEffect(() => {
        setCurrentTab(activeTab);
    }, [activeTab]);

    const handleSelectTab = (tab: CustomerSettingsTab) => {
        setCurrentTab(tab);
        router.get(
            customerSettingsIndex.url({ query: { tab } }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['activeTab'],
            },
        );
    };

    return (
        <HomeLayout>
            <Head title="Pengaturan Akun - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Atur profil akun, foto profil, daftar alamat pengiriman utama, dan keamanan akun Kossuma Kota Bogor."
                />
            </Head>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 lg:px-8">
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
                            Pengaturan Akun
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <aside className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xs lg:col-span-3 lg:p-4">
                        <nav
                            aria-label="Menu Pengaturan Akun"
                            className="flex flex-row gap-1.5 overflow-x-auto lg:flex-col"
                        >
                            {SETTINGS_TABS.map((tab) => {
                                const isActive = currentTab === tab.id;
                                const Icon = tab.icon;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => handleSelectTab(tab.id)}
                                        data-test={`settings-tab-${tab.id}`}
                                        className={`flex shrink-0 cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs sm:text-sm ${
                                            isActive
                                                ? 'bg-[#F0E6F5] font-bold text-[#7D3394]'
                                                : 'font-medium text-gray-600'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span>{tab.label}</span>
                                        </span>
                                        {tab.id === 'addresses' &&
                                            addresses.length > 0 && (
                                                <span
                                                    className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                                                        isActive
                                                            ? 'bg-white text-[#7D3394]'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}
                                                >
                                                    {addresses.length}
                                                </span>
                                            )}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6 lg:col-span-9">
                        {currentTab === 'profile' && (
                            <ProfileTab
                                profile={profile}
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        )}

                        {currentTab === 'addresses' && (
                            <AddressesTab
                                addresses={addresses}
                                defaultRecipientName={profile.name}
                                defaultPhone={profile.phone}
                            />
                        )}

                        {currentTab === 'security' && <SecurityTab />}
                    </section>
                </div>
            </div>
        </HomeLayout>
    );
}
