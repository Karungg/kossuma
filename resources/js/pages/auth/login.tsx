import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <PasskeyVerify />

            {status && (
                <div className="mb-5 rounded-xl bg-green-50 p-3.5 text-center text-sm font-medium text-green-700 border border-green-200">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-[#7D3394] hover:text-[#6c2b81] no-underline hover:underline cursor-pointer"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi"
                                    className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="data-[state=checked]:bg-[#7D3394] data-[state=checked]:border-[#7D3394] focus-visible:ring-[#7D3394]/20 cursor-pointer rounded-md"
                                />
                                <Label htmlFor="remember" className="text-sm font-normal text-gray-600 cursor-pointer select-none">
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-[#7D3394] hover:bg-[#6c2b81] text-white font-medium rounded-xl transition-colors cursor-pointer text-sm shadow-none"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Masuk Sekarang
                            </Button>
                        </div>

                        <div className="mt-2 text-center text-sm text-gray-500">
                            Belum punya akun?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-semibold text-[#7D3394] hover:text-[#6c2b81] no-underline hover:underline cursor-pointer"
                            >
                                Daftar sekarang
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Akun',
    description: 'Masukkan alamat email dan kata sandi Anda untuk melanjutkan berbelanja',
};
