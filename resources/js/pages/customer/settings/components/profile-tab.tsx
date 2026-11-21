import { Link, router, useForm } from '@inertiajs/react';
import { Camera, CheckCircle2, Mail, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { update as updateCustomerProfile } from '@/routes/customer/settings/profile';
import { destroy as destroyCustomerAvatar } from '@/routes/customer/settings/profile/avatar';
import { send as sendVerification } from '@/routes/verification';
import type { CustomerProfileData } from '../types';

interface ProfileTabProps {
    profile: CustomerProfileData;
    mustVerifyEmail: boolean;
    status?: string;
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

export function ProfileTab({
    profile,
    mustVerifyEmail,
    status,
}: ProfileTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        profile.avatarUrl,
    );
    const [removingAvatar, setRemovingAvatar] = useState(false);

    const { data, setData, post, processing, errors } = useForm<{
        _method: 'patch';
        name: string;
        email: string;
        phone: string;
        avatar: File | null;
    }>({
        _method: 'patch',
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: null,
    });

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            avatar: null,
        }));
        setPreviewUrl(profile.avatarUrl);
    }, [profile.name, profile.email, profile.phone, profile.avatarUrl]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            return;
        }

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setData('avatar', file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveAvatar = () => {
        if (removingAvatar) {
            return;
        }

        if (data.avatar && !profile.avatarUrl) {
            setData('avatar', null);
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return;
        }

        setRemovingAvatar(true);
        router.delete(destroyCustomerAvatar.url(), {
            preserveScroll: true,
            onFinish: () => {
                setRemovingAvatar(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(updateCustomerProfile.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('avatar', null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    Profil Saya
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                    Kelola informasi diri dan foto profil untuk memudahkan
                    pengiriman serta komunikasi dengan mitra UMKM.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#F0E6F5] ring-2 ring-[#E2C9EB]">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt={data.name || profile.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-extrabold text-[#7D3394]">
                                {getInitials(data.name || profile.name)}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                                data-test="profile-avatar-input"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] px-3.5 py-2 text-xs font-bold text-[#7D3394] sm:text-sm"
                            >
                                <Camera className="h-4 w-4" />
                                <span>Pilih Foto</span>
                            </button>

                            {(previewUrl || profile.avatarUrl) && (
                                <button
                                    type="button"
                                    disabled={removingAvatar}
                                    onClick={handleRemoveAvatar}
                                    data-test="profile-avatar-remove"
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                >
                                    <Trash2 className="h-4 w-4 text-[#DC2626]" />
                                    <span>
                                        {removingAvatar
                                            ? 'Menghapus...'
                                            : 'Hapus Foto'}
                                    </span>
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            Format JPG, PNG, atau WebP dengan ukuran maksimal 2
                            MB.
                        </p>
                        <InputError message={errors.avatar} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="customer-profile-name"
                            className="text-sm font-medium text-gray-800"
                        >
                            Nama Lengkap
                        </label>
                        <input
                            id="customer-profile-name"
                            type="text"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            required
                            autoComplete="name"
                            placeholder="Contoh: Siti Aminah"
                            data-test="customer-profile-name-input"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="customer-profile-phone"
                            className="text-sm font-medium text-gray-800"
                        >
                            Nomor WhatsApp / HP
                        </label>
                        <input
                            id="customer-profile-phone"
                            type="tel"
                            value={data.phone}
                            onChange={(event) =>
                                setData('phone', event.target.value)
                            }
                            autoComplete="tel"
                            placeholder="Contoh: 081288441122"
                            data-test="customer-profile-phone-input"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between gap-2">
                            <label
                                htmlFor="customer-profile-email"
                                className="text-sm font-medium text-gray-800"
                            >
                                Alamat Email
                            </label>
                            {profile.emailVerifiedAt ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Terverifikasi</span>
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-amber-600">
                                    Belum terverifikasi
                                </span>
                            )}
                        </div>
                        <input
                            id="customer-profile-email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            required
                            autoComplete="username"
                            placeholder="nama@email.com"
                            data-test="customer-profile-email-input"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <InputError message={errors.email} />

                        {mustVerifyEmail &&
                            profile.emailVerifiedAt === null && (
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                    <Mail className="h-3.5 w-3.5 text-[#7D3394]" />
                                    <span>Email Anda belum diverifikasi.</span>
                                    <Link
                                        href={sendVerification()}
                                        as="button"
                                        className="cursor-pointer font-bold text-[#7D3394]"
                                    >
                                        Kirim ulang tautan verifikasi
                                    </Link>
                                </div>
                            )}

                        {status === 'verification-link-sent' && (
                            <p className="mt-1 text-xs font-medium text-emerald-600">
                                Tautan verifikasi baru telah dikirim ke alamat
                                email Anda.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end border-t border-gray-100 pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        data-test="customer-profile-save-button"
                        className="cursor-pointer rounded-xl bg-[#7D3394] px-6 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
