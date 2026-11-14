import { Head } from '@inertiajs/react';
import { StorefrontHomePage } from './storefront/home';

export default function Welcome() {
    return (
        <>
            <Head title="Kossuma Kota Bogor — Sajian Pangan Halal & Praktis UMKM Muslimah">
                <meta
                    name="description"
                    content="Koperasi Usaha Persaudaraan Muslimah Kota Bogor — Platform kurasi produk pangan halal, frozen food, dan kuliner khas UMKM perempuan tangguh di Kota Bogor."
                />
            </Head>
            <StorefrontHomePage />
        </>
    );
}
