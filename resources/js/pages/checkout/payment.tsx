import { Head } from '@inertiajs/react';
import { PaymentPage } from '../customer/payment';

interface PaymentProps {
    method: string;
    bank: string;
    total: number;
    orderId: string;
}

export default function Payment({
    method,
    bank,
    total,
    orderId,
}: PaymentProps) {
    return (
        <>
            <Head title="Pembayaran Pesanan - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Selesaikan pembayaran pesanan UMKM Kossuma Kota Bogor."
                />
            </Head>
            <PaymentPage
                method={method}
                bank={bank}
                total={total}
                orderId={orderId}
            />
        </>
    );
}
