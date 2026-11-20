import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/categories';
import { CategoryIndexToolbar } from './components/category-index-toolbar';
import { CategoryStatCards } from './components/category-stat-cards';
import { CategoryTable } from './components/category-table';
import type {
    CategoryFilters,
    CategoryStats,
    PaginatedCategories,
} from './types';

type Props = {
    categories: PaginatedCategories;
    stats: CategoryStats;
    filters: CategoryFilters | [];
};

export default function CategoriesIndex({ categories, stats, filters }: Props) {
    const safeFilters = Array.isArray(filters) ? {} : filters;

    return (
        <>
            <Head title="Kelola Kategori" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Kelola Kategori
                    </h1>
                    <p className="text-sm text-gray-500">
                        Atur daftar kategori produk UMKM yang tampil di beranda
                        dan katalog Kossuma.
                    </p>
                </div>

                <CategoryStatCards stats={stats} />

                <CategoryIndexToolbar filters={safeFilters} />

                <CategoryTable categories={categories} filters={safeFilters} />
            </div>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Kategori',
            href: index(),
        },
    ],
};
