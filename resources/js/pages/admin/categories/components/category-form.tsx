import { Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store, update } from '@/routes/admin/categories';
import type { CategoryItem } from '../types';

type Props = {
    category?: CategoryItem;
};

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export function CategoryForm({ category }: Props) {
    const isEdit = category !== undefined;

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEdit) {
            put(update.url(category.id));
            return;
        }

        post(store.url());
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6"
        >
            <div className="grid gap-2">
                <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                >
                    Nama Kategori
                </Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    onKeyUp={(e) =>
                        setData('slug', toSlug(e.currentTarget.value))
                    }
                    placeholder="Contoh: Kue & Camilan"
                    required
                    className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label
                    htmlFor="slug"
                    className="text-sm font-medium text-gray-700"
                >
                    Slug URL
                </Label>
                <Input
                    id="slug"
                    name="slug"
                    type="text"
                    value={data.slug}
                    disabled
                    placeholder="contoh: kue-camilan"
                    className="h-11 cursor-not-allowed rounded-xl border-gray-200 bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">
                    Slug dibuat otomatis dari nama kategori.
                </p>
                <InputError message={errors.slug} />
            </div>

            <div className="grid gap-2">
                <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                >
                    Deskripsi
                </Label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Tuliskan penjelasan singkat tentang produk di kategori ini..."
                    className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                />
                <InputError message={errors.description} />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
                <Link
                    href={index()}
                    className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-gray-100 px-5 text-sm font-semibold text-gray-700"
                >
                    Batal
                </Link>
                <button
                    type="submit"
                    disabled={processing}
                    data-test="submit-category-button"
                    className="h-11 cursor-pointer rounded-xl bg-[#7D3394] px-6 text-sm font-bold text-white disabled:opacity-50"
                >
                    {processing
                        ? 'Menyimpan...'
                        : isEdit
                          ? 'Simpan Perubahan'
                          : 'Simpan Kategori'}
                </button>
            </div>
        </form>
    );
}
