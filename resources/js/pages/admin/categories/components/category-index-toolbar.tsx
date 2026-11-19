import { Link, router } from '@inertiajs/react';
import { Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { create, index } from '@/routes/admin/categories';
import type { CategoryFilters } from '../types';

type Props = {
    filters: CategoryFilters;
};

export function CategoryIndexToolbar({ filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(
            index.url({
                query: {
                    search: search.trim() || undefined,
                    sort: filters.sort ?? undefined,
                    direction: filters.direction ?? undefined,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleReset = () => {
        setSearch('');
        router.get(index.url(), {}, { preserveState: true, replace: true });
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form
                onSubmit={handleSearch}
                className="flex max-w-md flex-1 items-center gap-2"
            >
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau slug kategori..."
                        className="h-11 rounded-xl border-gray-200 bg-white pr-9 pl-10 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                    />
                    {search !== '' && (
                        <button
                            type="button"
                            onClick={handleReset}
                            aria-label="Hapus pencarian"
                            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <button
                    type="submit"
                    className="h-11 shrink-0 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                >
                    Cari
                </button>
            </form>

            <Link
                href={create()}
                className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-5 text-sm font-bold text-white"
            >
                <Plus className="h-4 w-4" />
                <span>Tambah Kategori</span>
            </Link>
        </div>
    );
}
