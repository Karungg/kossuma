import { Head } from '@inertiajs/react';
import { ProductDetailPage } from '../storefront/product-detail';

export default function Show() {
    return (
        <>
            <Head title="Ayam Ungkep Bumbu Kuning Siap Goreng - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Ayam Ungkep Bumbu Kuning Lengkuas Siap Goreng khas UMKM Muslimah Kossuma Kota Bogor. 100% Halal, higienis, bumbu meresap."
                />
            </Head>
            <ProductDetailPage />
        </>
    );
}

