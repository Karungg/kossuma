import { useForm } from '@inertiajs/react';
import { Lock, Send } from 'lucide-react';
import InputError from '@/components/input-error';
import { store as storeInternalNote } from '@/routes/admin/orders/internal-notes';
import type { AdminOrderInternalNote } from '../types';

type Props = {
    orderId: number;
    notes: AdminOrderInternalNote[];
};

export function OrderInternalNotesCard({ orderId, notes }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        note: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post(storeInternalNote.url(orderId), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-1 pb-4">
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#7D3394]" />
                    <h2 className="text-base font-bold text-gray-900">
                        Catatan Internal Admin
                    </h2>
                </div>
                <p className="text-xs text-gray-500">
                    Khusus tim Admin Kossuma untuk mencatat hasil tindak lanjut.
                    Tidak ditampilkan ke pembeli.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2.5 border-t border-gray-100 pt-4"
            >
                <textarea
                    rows={3}
                    value={data.note}
                    onChange={(event) => setData('note', event.target.value)}
                    placeholder="Contoh: Sudah menghubungi Ibu Rina (Toko), paket dipickup kurir pukul 14.00 WIB."
                    data-test="internal-note-input"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                />
                <InputError message={errors.note} />

                <button
                    type="submit"
                    disabled={processing}
                    data-test="internal-note-submit"
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-xs font-semibold text-white disabled:opacity-60"
                >
                    <Send className="h-3.5 w-3.5" />
                    <span>
                        {processing ? 'Menyimpan...' : 'Simpan Catatan'}
                    </span>
                </button>
            </form>

            <div className="mt-4 flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                {notes.length === 0 ? (
                    <p className="pt-4 text-xs text-gray-400">
                        Belum ada catatan tindak lanjut internal.
                    </p>
                ) : (
                    notes.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-1 py-3 last:pb-0"
                        >
                            <p className="text-xs leading-relaxed text-gray-700">
                                {item.note}
                            </p>
                            <span className="text-[11px] text-gray-400">
                                {item.adminName} • {item.createdAtLabel}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
