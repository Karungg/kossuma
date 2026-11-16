import { Head } from '@inertiajs/react';
import { CheckoutPage } from './customer/checkout';

export default function Checkout() {
    return (
        <>
            <Head title="Checkout Pesanan - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Pilih alamat pengiriman, kurir, voucher, dan metode pembayaran untuk pesanan UMKM Kossuma Kota Bogor."
                />
            </Head>
            <CheckoutPage />
        </>
    );
}
