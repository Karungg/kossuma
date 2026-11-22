import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { dashboard } from '@/routes/admin';
import { create, index } from '@/routes/admin/products';
import { ProductForm } from './components/product-form';
import type { ProductFormOptions } from './types';

type Props = {
    options: ProductFormOptions;
};

export default function ProductsCreate({ options }: Props) {
    return (
        <>
            <Head title="Tambah Produk" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                            Tambah Produk
                        </h1>
                        <p className="text-sm text-gray-500">
                            Tambahkan produk UMKM baru lengkap dengan foto,
                            harga, stok, dan rincian penyajian.
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

                <ProductForm options={options} />
            </div>
        </>
    );
}

ProductsCreate.layout = {
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
            title: 'Tambah Produk',
            href: create(),
        },
    ],
};
