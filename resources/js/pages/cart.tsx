import { Head } from '@inertiajs/react';
import { CustomerCartPage } from './customer/cart';

export default function Cart() {
    return (
        <>
            <Head title="Keranjang Belanja - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Keranjang Belanja Multi-Toko UMKM Kossuma Kota Bogor — Halal Food & Local UMKM E-Commerce"
                />
            </Head>
            <CustomerCartPage />
        </>
    );
}

