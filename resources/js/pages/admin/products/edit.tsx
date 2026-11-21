import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { dashboard } from '@/routes';
import { edit, index } from '@/routes/admin/products';
import { ProductForm } from './components/product-form';
import type { ProductFormOptions, ProductItem } from './types';

type Props = {
    product: ProductItem;
    options: ProductFormOptions;
};

export default function ProductsEdit({ product, options }: Props) {
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: dashboard(),
            },
            {
                title: 'Produk',
                href: index(),
            },
            {
                title: `Ubah: ${product.name}`,
                href: edit(product.id),
            },
        ],
    });

    return (
        <>
            <Head title={`Ubah Produk - ${product.name}`} />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                            Ubah Produk
                        </h1>
                        <p className="text-sm text-gray-500">
                            Perbarui foto, informasi, harga, stok, dan status
                            produk {product.name}.
                        </p>
                    </div>

                    <Link
                        href={index()}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-700 sm:text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali</span>
                    </Link>
                </div>

                <ProductForm product={product} options={options} />
            </div>
        </>
    );
}
