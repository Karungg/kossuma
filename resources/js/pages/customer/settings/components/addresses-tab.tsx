import { router } from '@inertiajs/react';
import { CheckCircle2, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    destroy as destroyAddress,
    primary as setPrimaryAddress,
} from '@/routes/customer/settings/addresses';
import type { CustomerAddress } from '../types';
import { AddressFormDialog } from './address-form-dialog';

interface AddressesTabProps {
    addresses: CustomerAddress[];
    defaultRecipientName: string;
    defaultPhone: string;
}

export function AddressesTab({
    addresses,
    defaultRecipientName,
    defaultPhone,
}: AddressesTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] =
        useState<CustomerAddress | null>(null);
    const [deletingAddress, setDeletingAddress] =
        useState<CustomerAddress | null>(null);
    const [busyAddressId, setBusyAddressId] = useState<string | null>(null);

    const handleOpenCreate = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (address: CustomerAddress) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleSetPrimary = (address: CustomerAddress) => {
        if (busyAddressId !== null || address.isPrimary) {
            return;
        }

        setBusyAddressId(address.id);
        router.patch(
            setPrimaryAddress.url(Number(address.id)),
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyAddressId(null),
            },
        );
    };

    const handleConfirmDelete = () => {
        if (!deletingAddress || busyAddressId !== null) {
            return;
        }

        setBusyAddressId(deletingAddress.id);
        router.delete(destroyAddress.url(Number(deletingAddress.id)), {
            preserveScroll: true,
            onSuccess: () => setDeletingAddress(null),
            onFinish: () => setBusyAddressId(null),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                        Daftar Alamat
                    </h2>
                    <p className="text-xs text-gray-500 sm:text-sm">
                        Kelola alamat pengiriman dan pilih alamat utama agar
                        checkout lebih cepat.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    data-test="add-address-button"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#7D3394] px-4 py-2.5 text-xs font-bold text-white sm:text-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Alamat Baru</span>
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E6F5] text-[#7D3394]">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                        Belum Ada Alamat Tersimpan
                    </h3>
                    <p className="max-w-sm text-xs text-gray-500 sm:text-sm">
                        Tambahkan alamat rumah atau kantor Anda untuk
                        mempercepat proses pengiriman produk UMKM Kossuma.
                    </p>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#7D3394] px-5 py-2.5 text-sm font-bold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Alamat Pertama</span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                    {addresses.map((address) => {
                        const isBusy = busyAddressId === address.id;

                        return (
                            <div
                                key={address.id}
                                data-test={`address-item-${address.id}`}
                                className={`flex flex-col gap-3 py-5 first:pt-1 last:pb-1 sm:flex-row sm:items-start sm:justify-between ${
                                    address.isPrimary
                                        ? '-mx-5 rounded-xl bg-[#F9F5FB]/60 px-5 sm:-mx-6 sm:px-6'
                                        : ''
                                }`}
                            >
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">
                                            {address.label}
                                        </span>
                                        {address.isPrimary && (
                                            <span
                                                data-test="primary-address-badge"
                                                className="inline-flex items-center gap-1 rounded-md border border-[#E2C9EB] bg-[#F0E6F5] px-2 py-0.5 text-[11px] font-bold text-[#7D3394]"
                                            >
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Alamat Utama</span>
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm font-medium text-gray-800">
                                        {address.recipientName}{' '}
                                        <span className="text-gray-400">•</span>{' '}
                                        <span className="font-normal text-gray-600">
                                            {address.phone}
                                        </span>
                                    </p>

                                    <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                                        {address.fullAddress},{' '}
                                        {address.district}, {address.city}
                                        {address.postalCode
                                            ? ` ${address.postalCode}`
                                            : ''}
                                    </p>

                                    {address.courierNote && (
                                        <p className="text-xs text-gray-500">
                                            Patokan: {address.courierNote}
                                        </p>
                                    )}
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 sm:pt-0">
                                    {!address.isPrimary && (
                                        <button
                                            type="button"
                                            disabled={isBusy}
                                            onClick={() =>
                                                handleSetPrimary(address)
                                            }
                                            data-test={`set-primary-address-${address.id}`}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] px-3 py-1.5 text-xs font-bold text-[#7D3394] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Star className="h-3.5 w-3.5" />
                                            <span>Jadikan Utama</span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => handleOpenEdit(address)}
                                        data-test={`edit-address-${address.id}`}
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span>Ubah</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() =>
                                            setDeletingAddress(address)
                                        }
                                        data-test={`delete-address-${address.id}`}
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Hapus</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AddressFormDialog
                open={isFormOpen}
                editingAddress={editingAddress}
                defaultRecipientName={defaultRecipientName}
                defaultPhone={defaultPhone}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingAddress(null);
                }}
            />

            <Dialog
                open={deletingAddress !== null}
                onOpenChange={(open) => !open && setDeletingAddress(null)}
            >
                <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Hapus Alamat Pengiriman
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            {deletingAddress
                                ? `Apakah Anda yakin ingin menghapus alamat "${deletingAddress.label}"?`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-end gap-2.5 pt-3">
                        <button
                            type="button"
                            onClick={() => setDeletingAddress(null)}
                            className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={busyAddressId !== null}
                            onClick={handleConfirmDelete}
                            data-test="confirm-delete-address-button"
                            className="cursor-pointer rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {busyAddressId !== null
                                ? 'Menghapus...'
                                : 'Ya, Hapus'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
