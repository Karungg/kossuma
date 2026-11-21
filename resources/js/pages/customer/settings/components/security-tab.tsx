import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { update as updateCustomerPassword } from '@/routes/customer/settings/password';

export function SecurityTab() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(updateCustomerPassword.url(), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    Keamanan Akun
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                    Perbarui kata sandi secara berkala untuk menjaga keamanan
                    akun belanja Anda.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex max-w-lg flex-col gap-5"
            >
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="customer-current-password"
                        className="text-sm font-medium text-gray-800"
                    >
                        Kata Sandi Saat Ini
                    </label>
                    <PasswordInput
                        id="customer-current-password"
                        name="current_password"
                        value={data.current_password}
                        onChange={(event) =>
                            setData('current_password', event.target.value)
                        }
                        autoComplete="current-password"
                        placeholder="Masukkan kata sandi saat ini"
                        className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                    />
                    <InputError message={errors.current_password} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="customer-new-password"
                        className="text-sm font-medium text-gray-800"
                    >
                        Kata Sandi Baru
                    </label>
                    <PasswordInput
                        id="customer-new-password"
                        name="password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        autoComplete="new-password"
                        placeholder="Masukkan kata sandi baru"
                        className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="customer-confirm-password"
                        className="text-sm font-medium text-gray-800"
                    >
                        Konfirmasi Kata Sandi Baru
                    </label>
                    <PasswordInput
                        id="customer-confirm-password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData('password_confirmation', event.target.value)
                        }
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi baru"
                        className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <div className="flex items-center justify-end border-t border-gray-100 pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        data-test="customer-password-save-button"
                        className="cursor-pointer rounded-xl bg-[#7D3394] px-6 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
