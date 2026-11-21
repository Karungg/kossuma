import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    store as storeAddress,
    update as updateAddress,
} from '@/routes/customer/settings/addresses';
import type { CustomerAddress } from '../types';

interface AddressFormDialogProps {
    open: boolean;
    editingAddress: CustomerAddress | null;
    defaultRecipientName: string;
    defaultPhone: string;
    onClose: () => void;
}

const BOGOR_DISTRICTS = [
    'Bogor Barat',
    'Bogor Selatan',
    'Bogor Tengah',
    'Bogor Timur',
    'Bogor Utara',
    'Tanah Sareal',
    'Cibinong',
    'Bojonggede',
    'Ciomas',
    'Dramaga',
];

const QUICK_LABELS = ['Rumah', 'Kantor', 'Rumah Orang Tua', 'Kos'];

export function AddressFormDialog({
    open,
    editingAddress,
    defaultRecipientName,
    defaultPhone,
    onClose,
}: AddressFormDialogProps) {
    const isEditing = editingAddress !== null;

    const {
        data,
        setData,
        post,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        label: 'Rumah',
        recipient_name: defaultRecipientName,
        phone: defaultPhone,
        full_address: '',
        district: '',
        city: 'Kota Bogor, Jawa Barat',
        postal_code: '',
        courier_note: '',
        is_primary: false,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();

        if (editingAddress) {
            setData({
                label: editingAddress.label,
                recipient_name: editingAddress.recipientName,
                phone: editingAddress.phone,
                full_address: editingAddress.fullAddress,
                district: editingAddress.district,
                city: editingAddress.city,
                postal_code: editingAddress.postalCode,
                courier_note: editingAddress.courierNote,
                is_primary: editingAddress.isPrimary,
            });
        } else {
            setData({
                label: 'Rumah',
                recipient_name: defaultRecipientName,
                phone: defaultPhone,
                full_address: '',
                district: '',
                city: 'Kota Bogor, Jawa Barat',
                postal_code: '',
                courier_note: '',
                is_primary: false,
            });
        }
    }, [open, editingAddress, defaultRecipientName, defaultPhone]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (isEditing && editingAddress) {
            patch(updateAddress.url(Number(editingAddress.id)), options);
        } else {
            post(storeAddress.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        {isEditing
                            ? 'Ubah Alamat Pengiriman'
                            : 'Tambah Alamat Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Pastikan detail alamat dan patokan kurir sudah benar
                        agar pesanan tiba tepat waktu.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 pt-2"
                >
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="address-label"
                            className="text-sm font-medium text-gray-800"
                        >
                            Label Alamat
                        </label>
                        <input
                            id="address-label"
                            type="text"
                            value={data.label}
                            onChange={(event) =>
                                setData('label', event.target.value)
                            }
                            required
                            placeholder="Misal: Rumah, Kantor"
                            data-test="address-label-input"
                            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {QUICK_LABELS.map((quick) => (
                                <button
                                    key={quick}
                                    type="button"
                                    onClick={() => setData('label', quick)}
                                    className={`cursor-pointer rounded-full px-2.5 py-1 text-xs ${
                                        data.label === quick
                                            ? 'bg-[#F0E6F5] font-bold text-[#7D3394]'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {quick}
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.label} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="address-recipient"
                                className="text-sm font-medium text-gray-800"
                            >
                                Nama Penerima
                            </label>
                            <input
                                id="address-recipient"
                                type="text"
                                value={data.recipient_name}
                                onChange={(event) =>
                                    setData(
                                        'recipient_name',
                                        event.target.value,
                                    )
                                }
                                required
                                placeholder="Nama lengkap penerima"
                                data-test="address-recipient-input"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={errors.recipient_name} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="address-phone"
                                className="text-sm font-medium text-gray-800"
                            >
                                Nomor HP Penerima
                            </label>
                            <input
                                id="address-phone"
                                type="tel"
                                value={data.phone}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                                required
                                placeholder="0812xxxxxxxx"
                                data-test="address-phone-input"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="address-district"
                                className="text-sm font-medium text-gray-800"
                            >
                                Kecamatan
                            </label>
                            <input
                                id="address-district"
                                type="text"
                                list="bogor-districts-list"
                                value={data.district}
                                onChange={(event) =>
                                    setData('district', event.target.value)
                                }
                                required
                                placeholder="Misal: Tanah Sareal"
                                data-test="address-district-input"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <datalist id="bogor-districts-list">
                                {BOGOR_DISTRICTS.map((district) => (
                                    <option key={district} value={district} />
                                ))}
                            </datalist>
                            <InputError message={errors.district} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="address-city"
                                className="text-sm font-medium text-gray-800"
                            >
                                Kota / Kabupaten
                            </label>
                            <input
                                id="address-city"
                                type="text"
                                value={data.city}
                                onChange={(event) =>
                                    setData('city', event.target.value)
                                }
                                required
                                placeholder="Kota Bogor, Jawa Barat"
                                data-test="address-city-input"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={errors.city} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="address-postal"
                                className="text-sm font-medium text-gray-800"
                            >
                                Kode Pos
                            </label>
                            <input
                                id="address-postal"
                                type="text"
                                inputMode="numeric"
                                value={data.postal_code}
                                onChange={(event) =>
                                    setData('postal_code', event.target.value)
                                }
                                placeholder="16164"
                                data-test="address-postal-input"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                            />
                            <InputError message={errors.postal_code} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="address-full"
                            className="text-sm font-medium text-gray-800"
                        >
                            Alamat Lengkap
                        </label>
                        <textarea
                            id="address-full"
                            rows={3}
                            value={data.full_address}
                            onChange={(event) =>
                                setData('full_address', event.target.value)
                            }
                            required
                            placeholder="Nama jalan, nomor rumah, blok, RT/RW, kelurahan..."
                            data-test="address-full-input"
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <InputError message={errors.full_address} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="address-note"
                            className="text-sm font-medium text-gray-800"
                        >
                            Patokan untuk Kurir (Opsional)
                        </label>
                        <input
                            id="address-note"
                            type="text"
                            value={data.courier_note}
                            onChange={(event) =>
                                setData('courier_note', event.target.value)
                            }
                            placeholder="Misal: Rumah pagar putih sebelah masjid"
                            data-test="address-note-input"
                            className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <InputError message={errors.courier_note} />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-gray-700 select-none">
                        <input
                            type="checkbox"
                            checked={data.is_primary}
                            onChange={(event) =>
                                setData('is_primary', event.target.checked)
                            }
                            data-test="address-primary-checkbox"
                            className="h-4 w-4 cursor-pointer rounded accent-[#7D3394]"
                        />
                        <span>Jadikan sebagai alamat utama</span>
                    </label>

                    <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            data-test="address-save-button"
                            className="cursor-pointer rounded-xl bg-[#7D3394] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Alamat'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
