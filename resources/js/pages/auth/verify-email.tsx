import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verifikasi Email" />

            {status === 'verification-link-sent' && (
                <div className="mb-5 rounded-xl bg-green-50 p-3.5 text-center text-sm font-medium text-green-700 border border-green-200">
                    Tautan verifikasi baru telah berhasil dikirim ke alamat email yang Anda daftarkan.
                </div>
            )}

            <Form {...send.form()} className="space-y-4 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="h-11 w-full bg-[#7D3394] hover:bg-[#6c2b81] text-white font-medium rounded-xl transition-colors cursor-pointer text-sm shadow-none"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Kirim Ulang Email Verifikasi
                        </Button>

                        <div className="pt-2">
                            <TextLink
                                href={logout()}
                                className="text-sm font-medium text-gray-500 hover:text-gray-800 no-underline hover:underline cursor-pointer"
                            >
                                Keluar dari Akun
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi Email',
    description:
        'Mohon verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan.',
};
