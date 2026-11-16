import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Kata Sandi" />

            {status && (
                <div className="mb-5 rounded-xl bg-green-50 p-3.5 text-center text-sm font-medium text-green-700 border border-green-200">
                    {status}
                </div>
            )}

            <div className="space-y-5">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="nama@email.com"
                                    className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <Button
                                className="mt-1 h-11 w-full bg-[#7D3394] hover:bg-[#6c2b81] text-white font-medium rounded-xl transition-colors cursor-pointer text-sm shadow-none"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Kirim Tautan Atur Ulang
                            </Button>
                        </div>
                    )}
                </Form>

                <div className="mt-2 text-center text-sm text-gray-500">
                    <span>Kembali ke </span>
                    <TextLink
                        href={login()}
                        className="font-semibold text-[#7D3394] hover:text-[#6c2b81] no-underline hover:underline cursor-pointer"
                    >
                        halaman masuk
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi',
    description: 'Masukkan alamat email Anda untuk menerima tautan atur ulang kata sandi',
};
