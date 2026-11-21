import { Link, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ImageGalleryUpload } from '@/components/file-upload';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index, store, update } from '@/routes/admin/products';
import type { ExistingFileItem } from '@/types/file-upload';
import type {
    ProductFormOptions,
    ProductItem,
    ProductSpecificationItem,
} from '../types';

type Props = {
    product?: ProductItem;
    options: ProductFormOptions;
};

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export function ProductForm({ product, options }: Props) {
    const isEdit = product !== undefined;

    const initialExistingImages: ExistingFileItem[] = (
        product?.images ?? []
    ).map((image) => ({
        id: image.id,
        url: image.url ?? image.image_path,
        thumbnailUrl: image.thumbnail_url ?? image.url ?? image.image_path,
        alt: image.alt,
        label: image.label,
        name: image.label ?? image.alt ?? `Foto #${image.id}`,
        isPrimary: image.is_primary,
    }));

    const initialPrimaryExisting = initialExistingImages.find(
        (image) => image.isPrimary,
    );

    const [name, setName] = useState(product?.name ?? '');
    const [slug, setSlug] = useState(product?.slug ?? '');
    const [categoryId, setCategoryId] = useState(
        product?.category_id ? String(product.category_id) : '',
    );
    const [storeId, setStoreId] = useState(
        product?.store_id ? String(product.store_id) : '',
    );
    const [description, setDescription] = useState(product?.description ?? '');
    const [composition, setComposition] = useState(product?.composition ?? '');
    const [price, setPrice] = useState(
        product?.price !== undefined ? String(product.price) : '',
    );
    const [originalPrice, setOriginalPrice] = useState(
        product?.original_price ? String(product.original_price) : '',
    );
    const [stock, setStock] = useState(
        product?.stock !== undefined ? String(product.stock) : '0',
    );
    const [unitLabel, setUnitLabel] = useState(product?.unit_label ?? '');
    const [weightGrams, setWeightGrams] = useState(
        product?.weight_grams ? String(product.weight_grams) : '',
    );
    const [isActive, setIsActive] = useState(product?.is_active ?? true);
    const [isPreorder, setIsPreorder] = useState(product?.is_preorder ?? false);
    const [preorderDays, setPreorderDays] = useState(
        product?.preorder_days ? String(product.preorder_days) : '',
    );

    const [cookingInstructions, setCookingInstructions] = useState<string[]>(
        product?.cooking_instructions && product.cooking_instructions.length > 0
            ? product.cooking_instructions
            : [''],
    );
    const [specifications, setSpecifications] = useState<
        ProductSpecificationItem[]
    >(
        product?.specifications && product.specifications.length > 0
            ? product.specifications
            : [],
    );

    const [existingImages, setExistingImages] = useState<ExistingFileItem[]>(
        initialExistingImages,
    );
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [primaryImageKey, setPrimaryImageKey] = useState<string | null>(
        initialPrimaryExisting
            ? `existing:${initialPrimaryExisting.id}`
            : initialExistingImages[0]
              ? `existing:${initialExistingImages[0].id}`
              : null,
    );

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialExistingIds = initialExistingImages.map((image) =>
        Number(image.id),
    );
    const currentExistingIds = existingImages.map((image) => Number(image.id));
    const removedImageIds = initialExistingIds.filter(
        (id) => !currentExistingIds.includes(id),
    );

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});

        const payload = {
            category_id: categoryId,
            store_id: storeId,
            name,
            slug,
            description,
            composition,
            price,
            original_price: originalPrice,
            stock,
            unit_label: unitLabel,
            weight_grams: weightGrams,
            is_active: isActive ? 1 : 0,
            is_preorder: isPreorder ? 1 : 0,
            preorder_days: isPreorder ? preorderDays : '',
            cooking_instructions: cookingInstructions.filter(
                (item) => item.trim() !== '',
            ),
            specifications: specifications.filter(
                (item) => item.title.trim() !== '' || item.value.trim() !== '',
            ),
            images: newImageFiles,
            existing_image_ids: currentExistingIds,
            removed_image_ids: removedImageIds,
            primary_image_key: primaryImageKey ?? '',
            ...(isEdit ? { _method: 'put' } : {}),
        };

        const targetUrl = isEdit ? update.url(product.id) : store.url();

        router.post(targetUrl, payload, {
            forceFormData: true,
            onError: (serverErrors) => {
                setErrors(serverErrors);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const imageError =
        errors.images ??
        Object.entries(errors).find(([key]) => key.startsWith('images.'))?.[1];

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
            <div className="flex flex-col gap-6 lg:col-span-8">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-base font-bold text-gray-900">
                            Foto Produk
                        </h2>
                        <p className="text-xs text-gray-500">
                            Unggah hingga 8 foto. Klik tanda bintang untuk
                            menentukan Foto Utama yang tampil di katalog.
                        </p>
                    </div>

                    <ImageGalleryUpload
                        existingImages={existingImages}
                        onExistingImagesChange={setExistingImages}
                        files={newImageFiles}
                        onFilesChange={setNewImageFiles}
                        primaryKey={primaryImageKey}
                        onPrimaryKeyChange={setPrimaryImageKey}
                        disabled={processing}
                        error={imageError}
                        dataTest="product-image-gallery-upload"
                    />
                </div>

                <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <h2 className="text-base font-bold text-gray-900">
                        Informasi Produk
                    </h2>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="name"
                            className="text-sm font-medium text-gray-700"
                        >
                            Nama Produk
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!isEdit) {
                                    setSlug(toSlug(e.target.value));
                                }
                            }}
                            placeholder="Contoh: Risol Mayo Smoked Beef"
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
                            value={slug}
                            onChange={(e) => setSlug(toSlug(e.target.value))}
                            placeholder="risol-mayo-smoked-beef"
                            className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                        />
                        <p className="text-xs text-gray-500">
                            Otomatis dibuat dari nama produk dan dapat
                            disesuaikan.
                        </p>
                        <InputError message={errors.slug} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Kategori
                            </Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                            >
                                <SelectTrigger
                                    data-test="product-category-select"
                                    className="h-11 w-full cursor-pointer rounded-xl border-gray-200 bg-white"
                                >
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 bg-white">
                                    {options.categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                            className="cursor-pointer"
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Toko UMKM
                            </Label>
                            <Select value={storeId} onValueChange={setStoreId}>
                                <SelectTrigger
                                    data-test="product-store-select"
                                    className="h-11 w-full cursor-pointer rounded-xl border-gray-200 bg-white"
                                >
                                    <SelectValue placeholder="Pilih toko UMKM" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 bg-white">
                                    {options.stores.map((storeItem) => (
                                        <SelectItem
                                            key={storeItem.id}
                                            value={String(storeItem.id)}
                                            className="cursor-pointer"
                                        >
                                            {storeItem.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.store_id} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="description"
                            className="text-sm font-medium text-gray-700"
                        >
                            Deskripsi Produk
                        </Label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Jelaskan rasa, tekstur, keunggulan, dan cara penyimpanan produk..."
                            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="composition"
                            className="text-sm font-medium text-gray-700"
                        >
                            Komposisi Bahan (Opsional)
                        </Label>
                        <textarea
                            id="composition"
                            name="composition"
                            rows={2}
                            value={composition}
                            onChange={(e) => setComposition(e.target.value)}
                            placeholder="Contoh: Tepung terigu, daging asap halal, telur, mayones, bumbu rempah."
                            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7D3394] focus:ring-2 focus:ring-[#7D3394]/20 focus:outline-none"
                        />
                        <InputError message={errors.composition} />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Saran Penyajian (Opsional)
                            </Label>
                            <button
                                type="button"
                                onClick={() =>
                                    setCookingInstructions((prev) => [
                                        ...prev,
                                        '',
                                    ])
                                }
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#F0E6F5] px-2.5 py-1 text-xs font-semibold text-[#7D3394]"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Tambah Langkah</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {cookingInstructions.map((step, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        type="text"
                                        value={step}
                                        onChange={(e) =>
                                            setCookingInstructions((prev) =>
                                                prev.map((item, i) =>
                                                    i === idx
                                                        ? e.target.value
                                                        : item,
                                                ),
                                            )
                                        }
                                        placeholder="Contoh: Diamkan di suhu ruang sebelum digoreng/dimasak"
                                        className="h-10 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                                    />
                                    {cookingInstructions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCookingInstructions((prev) =>
                                                    prev.filter(
                                                        (_, i) => i !== idx,
                                                    ),
                                                )
                                            }
                                            aria-label="Hapus langkah"
                                            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-[#DC2626]"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Spesifikasi Tambahan (Opsional)
                            </Label>
                            <button
                                type="button"
                                onClick={() =>
                                    setSpecifications((prev) => [
                                        ...prev,
                                        {
                                            title: '',
                                            value: '',
                                            description: '',
                                        },
                                    ])
                                }
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#F0E6F5] px-2.5 py-1 text-xs font-semibold text-[#7D3394]"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Tambah Spesifikasi</span>
                            </button>
                        </div>

                        {specifications.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {specifications.map((spec, idx) => (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-1 gap-2 border-b border-gray-100 pb-3 sm:grid-cols-12"
                                    >
                                        <Input
                                            type="text"
                                            value={spec.title}
                                            onChange={(e) =>
                                                setSpecifications((prev) =>
                                                    prev.map((item, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...item,
                                                                  title: e
                                                                      .target
                                                                      .value,
                                                              }
                                                            : item,
                                                    ),
                                                )
                                            }
                                            placeholder="Judul (mis. Daya Simpan)"
                                            className="h-10 rounded-xl border-gray-200 sm:col-span-4"
                                        />
                                        <Input
                                            type="text"
                                            value={spec.value}
                                            onChange={(e) =>
                                                setSpecifications((prev) =>
                                                    prev.map((item, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...item,
                                                                  value: e
                                                                      .target
                                                                      .value,
                                                              }
                                                            : item,
                                                    ),
                                                )
                                            }
                                            placeholder="Nilai (mis. 3 Bulan Freezer)"
                                            className="h-10 rounded-xl border-gray-200 sm:col-span-3"
                                        />
                                        <div className="flex items-center gap-2 sm:col-span-5">
                                            <Input
                                                type="text"
                                                value={spec.description}
                                                onChange={(e) =>
                                                    setSpecifications((prev) =>
                                                        prev.map((item, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...item,
                                                                      description:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Keterangan singkat"
                                                className="h-10 rounded-xl border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSpecifications((prev) =>
                                                        prev.filter(
                                                            (_, i) => i !== idx,
                                                        ),
                                                    )
                                                }
                                                aria-label="Hapus spesifikasi"
                                                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-[#DC2626]"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-4">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <h2 className="text-base font-bold text-gray-900">
                        Harga & Stok
                    </h2>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="price"
                            className="text-sm font-medium text-gray-700"
                        >
                            Harga Jual (Rp)
                        </Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            min={100}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="35000"
                            required
                            className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                        />
                        <InputError message={errors.price} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="original_price"
                            className="text-sm font-medium text-gray-700"
                        >
                            Harga Coret (Opsional)
                        </Label>
                        <Input
                            id="original_price"
                            name="original_price"
                            type="number"
                            min={100}
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            placeholder="40000"
                            className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                        />
                        <InputError message={errors.original_price} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="stock"
                            className="text-sm font-medium text-gray-700"
                        >
                            Stok Tersedia
                        </Label>
                        <Input
                            id="stock"
                            name="stock"
                            type="number"
                            min={0}
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                            className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                        />
                        <InputError message={errors.stock} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="unit_label"
                                className="text-sm font-medium text-gray-700"
                            >
                                Satuan / Porsi (Opsional)
                            </Label>
                            <Input
                                id="unit_label"
                                name="unit_label"
                                type="text"
                                value={unitLabel}
                                onChange={(e) => setUnitLabel(e.target.value)}
                                placeholder="Contoh: 1 Pack (Isi 10)"
                                className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                            />
                            <InputError message={errors.unit_label} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="weight_grams"
                                className="text-sm font-medium text-gray-700"
                            >
                                Berat (gram, Opsional)
                            </Label>
                            <Input
                                id="weight_grams"
                                name="weight_grams"
                                type="number"
                                min={1}
                                value={weightGrams}
                                onChange={(e) => setWeightGrams(e.target.value)}
                                placeholder="350"
                                className="h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                            />
                            <InputError message={errors.weight_grams} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <h2 className="text-base font-bold text-gray-900">
                        Status & Pre-order
                    </h2>

                    <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                            checked={isActive}
                            onCheckedChange={(checked) =>
                                setIsActive(checked === true)
                            }
                            className="mt-0.5 cursor-pointer border-gray-300 data-[state=checked]:border-[#7D3394] data-[state=checked]:bg-[#7D3394]"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-gray-900">
                                Tampilkan di Katalog
                            </span>
                            <span className="text-xs text-gray-500">
                                Produk aktif dapat dilihat dan dibeli pelanggan.
                            </span>
                        </div>
                    </label>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                        <label className="flex cursor-pointer items-start gap-3">
                            <Checkbox
                                checked={isPreorder}
                                onCheckedChange={(checked) =>
                                    setIsPreorder(checked === true)
                                }
                                className="mt-0.5 cursor-pointer border-gray-300 data-[state=checked]:border-[#7D3394] data-[state=checked]:bg-[#7D3394]"
                            />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-gray-900">
                                    Produk Pre-order
                                </span>
                                <span className="text-xs text-gray-500">
                                    Aktifkan jika produk dibuat berdasarkan
                                    pesanan khusus.
                                </span>
                            </div>
                        </label>

                        {isPreorder && (
                            <div className="grid gap-2 pl-7">
                                <Label
                                    htmlFor="preorder_days"
                                    className="text-xs font-medium text-gray-700"
                                >
                                    Estimasi Pre-order (hari)
                                </Label>
                                <Input
                                    id="preorder_days"
                                    name="preorder_days"
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={preorderDays}
                                    onChange={(e) =>
                                        setPreorderDays(e.target.value)
                                    }
                                    placeholder="3"
                                    required
                                    className="h-10 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
                                />
                                <InputError message={errors.preorder_days} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            data-test="submit-product-button"
                            className="h-11 w-full cursor-pointer rounded-xl bg-[#7D3394] px-6 text-sm font-bold text-white disabled:opacity-50"
                        >
                            {processing
                                ? 'Menyimpan...'
                                : isEdit
                                  ? 'Simpan Perubahan'
                                  : 'Simpan Produk'}
                        </button>
                        <Link
                            href={index()}
                            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-gray-100 px-5 text-sm font-semibold text-gray-700"
                        >
                            Batal
                        </Link>
                    </div>
                </div>
            </div>
        </form>
    );
}
