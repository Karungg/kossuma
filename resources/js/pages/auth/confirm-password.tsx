import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import PasskeyVerify from '@/components/passkey-verify';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi Kata Sandi" />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label="Konfirmasi dengan passkey"
                loadingLabel="Mengonfirmasi..."
                separator="Atau konfirmasi dengan kata sandi"
            />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Kata Sandi
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Masukkan kata sandi"
                                autoComplete="current-password"
                                autoFocus
                                className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                            />

                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <Button
                            className="mt-2 h-11 w-full bg-[#7D3394] hover:bg-[#6c2b81] text-white font-medium rounded-xl transition-colors cursor-pointer text-sm shadow-none"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Konfirmasi Kata Sandi
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi Kata Sandi',
    description:
        'Area ini memerlukan konfirmasi keamanan. Silakan konfirmasi kata sandi Anda sebelum melanjutkan.',
};
