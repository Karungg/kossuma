import { Head } from '@inertiajs/react';
import { ProductDetailPage, getProductDetail } from '../storefront/product-detail';

interface ShowProps {
    slug?: string;
}

export default function Show({ slug }: ShowProps) {
    const product = getProductDetail(slug);

    return (
        <>
            <Head title={`${product.name} - Kossuma Kota Bogor`}>
                <meta
                    name="description"
                    content={product.description}
                />
            </Head>
            <ProductDetailPage slug={slug} />
        </>
    );
}
