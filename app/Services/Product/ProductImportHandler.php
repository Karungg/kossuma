<?php

namespace App\Services\Product;

use App\Concerns\GeneratesUniqueSlug;
use App\Contracts\Import\TabularImportHandlerInterface;
use App\Enums\Notification\NotificationCategory;
use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Store\Store;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductImportHandler implements TabularImportHandlerInterface
{
    use GeneratesUniqueSlug;

    public function __construct(
        public readonly ProductImageOptimizationService $imageOptimizationService,
    ) {}

    public function templateFilePrefix(): string
    {
        return 'produk-kossuma';
    }

    public function templateSheetName(): string
    {
        return 'Template Produk';
    }

    public function guideSheetName(): string
    {
        return 'Panduan Pengisian';
    }

    public function templateHeaders(): array
    {
        return [
            'name',
            'slug',
            'category_slug',
            'store_slug',
            'price',
            'original_price',
            'stock',
            'unit_label',
            'weight_grams',
            'is_preorder',
            'preorder_days',
            'is_active',
            'description',
            'composition',
            'cooking_instructions',
            'image_files',
        ];
    }

    public function templateExampleRows(): array
    {
        $firstCategory = Category::query()->orderBy('name')->value('slug') ?? 'frozen-food';
        $firstStore = Store::query()->orderBy('name')->value('slug') ?? 'dapur-umkm-bogor';

        return [
            [
                'Risol Mayo Smoked Beef',
                'risol-mayo-smoked-beef',
                $firstCategory,
                $firstStore,
                35000,
                40000,
                25,
                '1 Pack (Isi 10)',
                350,
                'tidak',
                '',
                'ya',
                'Risol mayo isi daging asap halal dan telur rebus segar siap goreng.',
                'Tepung terigu, smoked beef halal, mayones, telur, susu, bumbu rempah.',
                'Diamkan di suhu ruang sebelum digoreng atau dimasak.|Goreng dengan api sedang hingga kuning keemasan.',
                'risol-1.jpg|risol-2.jpg',
            ],
        ];
    }

    public function templateGuideRows(): array
    {
        $rows = [
            ['name', 'Wajib', 'Nama produk UMKM (maks. 200 karakter).', 'Risol Mayo Smoked Beef'],
            ['slug', 'Opsional', 'Slug unik URL. Jika diisi & sudah ada, produk akan diperbarui (upsert). Jika kosong, dibuat otomatis.', 'risol-mayo-smoked-beef'],
            ['category_slug', 'Wajib', 'Slug atau nama kategori yang sudah terdaftar di sistem.', 'frozen-food'],
            ['store_slug', 'Wajib', 'Slug atau nama toko UMKM yang sudah terdaftar di sistem.', 'dapur-umkm-bogor'],
            ['price', 'Wajib', 'Harga jual dalam Rupiah (angka bulat tanpa Rp/titik).', '35000'],
            ['original_price', 'Opsional', 'Harga sebelum diskon (harus >= harga jual jika diisi).', '40000'],
            ['stock', 'Wajib', 'Jumlah stok tersedia (angka >= 0).', '25'],
            ['unit_label', 'Opsional', 'Label porsi atau kemasan produk.', '1 Pack (Isi 10)'],
            ['weight_grams', 'Opsional', 'Berat produk dalam gram (angka > 0).', '350'],
            ['is_preorder', 'Opsional', 'Isi ya/tidak (default: tidak).', 'tidak'],
            ['preorder_days', 'Kondisional', 'Wajib diisi angka (1–60) jika is_preorder = ya.', '3'],
            ['is_active', 'Opsional', 'Isi ya/tidak untuk menampilkan di katalog (default: ya).', 'ya'],
            ['description', 'Wajib', 'Deskripsi lengkap produk.', 'Risol mayo halal siap goreng...'],
            ['composition', 'Opsional', 'Daftar bahan/komposisi produk.', 'Tepung terigu, daging asap...'],
            ['cooking_instructions', 'Opsional', 'Langkah penyajian dipisahkan tanda |.', 'Diamkan di suhu ruang...|Goreng api sedang...'],
            ['image_files', 'Opsional', 'Nama file foto di dalam file .zip opsional, dipisahkan tanda |. Foto pertama menjadi Foto Utama.', 'risol-1.jpg|risol-2.jpg'],
            ['', '', '', ''],
            ['Daftar Kategori Tersedia', 'Referensi', 'Gunakan nilai di kolom Contoh pada category_slug', ''],
        ];

        $categories = Category::query()->orderBy('name')->get(['name', 'slug']);

        foreach ($categories as $category) {
            $rows[] = [$category->name, 'Kategori', 'Slug kategori', $category->slug];
        }

        $rows[] = ['', '', '', ''];
        $rows[] = ['Daftar Toko UMKM Tersedia', 'Referensi', 'Gunakan nilai di kolom Contoh pada store_slug', ''];

        $stores = Store::query()->orderBy('name')->get(['name', 'slug']);

        foreach ($stores as $store) {
            $rows[] = [$store->name, 'Toko UMKM', 'Slug toko', $store->slug];
        }

        return $rows;
    }

    public function notificationCategory(): NotificationCategory
    {
        return NotificationCategory::Product;
    }

    public function itemLabel(): string
    {
        return 'produk';
    }

    public function importRow(array $row, int $rowNumber, array $context = []): string
    {
        $categoryValue = trim((string) ($row['category_slug'] ?? $row['kategori'] ?? ''));
        $storeValue = trim((string) ($row['store_slug'] ?? $row['toko'] ?? ''));

        $category = $this->resolveCategory($categoryValue);
        $store = $this->resolveStore($storeValue);

        $isPreorder = $this->parseBoolean($row['is_preorder'] ?? false, false);
        $isActive = $this->parseBoolean($row['is_active'] ?? true, true);

        $rawSlug = trim((string) ($row['slug'] ?? ''));
        $normalizedSlug = $rawSlug !== '' ? Str::slug($rawSlug) : '';

        $payload = [
            'name' => trim((string) ($row['name'] ?? '')),
            'slug' => $normalizedSlug !== '' ? $normalizedSlug : null,
            'category_id' => $category?->id,
            'store_id' => $store?->id,
            'description' => trim((string) ($row['description'] ?? '')),
            'price' => $this->parseNullableInt($row['price'] ?? null),
            'original_price' => $this->parseNullableInt($row['original_price'] ?? null),
            'stock' => $this->parseNullableInt($row['stock'] ?? 0) ?? 0,
            'unit_label' => $this->parseNullableString($row['unit_label'] ?? null),
            'weight_grams' => $this->parseNullableInt($row['weight_grams'] ?? null),
            'is_preorder' => $isPreorder,
            'preorder_days' => $isPreorder ? $this->parseNullableInt($row['preorder_days'] ?? null) : null,
            'is_active' => $isActive,
            'composition' => $this->parseNullableString($row['composition'] ?? null),
        ];

        $validator = Validator::make($payload, [
            'name' => ['required', 'string', 'max:200'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'store_id' => ['required', 'integer', 'exists:stores,id'],
            'description' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'integer', 'min:100'],
            'original_price' => ['nullable', 'integer', 'gte:price'],
            'stock' => ['required', 'integer', 'min:0'],
            'unit_label' => ['nullable', 'string', 'max:100'],
            'weight_grams' => ['nullable', 'integer', 'min:1'],
            'is_preorder' => ['boolean'],
            'preorder_days' => ['nullable', 'required_if:is_preorder,true', 'integer', 'min:1', 'max:60'],
            'is_active' => ['boolean'],
            'composition' => ['nullable', 'string', 'max:3000'],
        ], [
            'name.required' => 'Nama produk wajib diisi.',
            'category_id.required' => "Kategori '{$categoryValue}' tidak ditemukan.",
            'store_id.required' => "Toko UMKM '{$storeValue}' tidak ditemukan.",
            'description.required' => 'Deskripsi produk wajib diisi.',
            'price.required' => 'Harga produk wajib diisi.',
            'price.min' => 'Harga produk minimal Rp100.',
            'original_price.gte' => 'Harga coret harus lebih besar atau sama dengan harga jual.',
            'stock.min' => 'Stok tidak boleh kurang dari 0.',
            'preorder_days.required_if' => 'Jumlah hari pre-order wajib diisi saat produk bertipe pre-order.',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $instructionsRaw = trim((string) ($row['cooking_instructions'] ?? ''));
        $cookingInstructions = $instructionsRaw !== ''
            ? array_values(array_filter(array_map('trim', explode('|', $instructionsRaw)), static fn (string $s): bool => $s !== ''))
            : null;

        $existingProduct = $normalizedSlug !== ''
            ? Product::query()->where('slug', $normalizedSlug)->first()
            : null;

        $attributes = [
            'category_id' => $payload['category_id'],
            'store_id' => $payload['store_id'],
            'name' => $payload['name'],
            'description' => $payload['description'],
            'price' => $payload['price'],
            'original_price' => $payload['original_price'],
            'stock' => $payload['stock'],
            'unit_label' => $payload['unit_label'],
            'weight_grams' => $payload['weight_grams'],
            'is_preorder' => $payload['is_preorder'],
            'preorder_days' => $payload['preorder_days'],
            'is_active' => $payload['is_active'],
            'composition' => $payload['composition'],
            'cooking_instructions' => $cookingInstructions,
        ];

        if ($existingProduct instanceof Product) {
            $existingProduct->update($attributes);
            $this->attachImportedImages($existingProduct, $row['image_files'] ?? null, $context['image_files'] ?? []);

            return 'updated';
        }

        $uniqueSlug = $this->resolveUniqueSlug(
            modelClass: Product::class,
            slug: $normalizedSlug !== '' ? $normalizedSlug : null,
            fallbackSource: $payload['name'],
            defaultSlug: 'produk',
        );

        $product = Product::query()->create([
            ...$attributes,
            'slug' => $uniqueSlug,
        ]);

        $this->attachImportedImages($product, $row['image_files'] ?? null, $context['image_files'] ?? []);

        return 'created';
    }

    private function attachImportedImages(Product $product, mixed $imageFilesCell, array $zipImageMap): void
    {
        $raw = trim((string) ($imageFilesCell ?? ''));

        if ($raw === '' || $zipImageMap === []) {
            return;
        }

        $requestedNames = array_values(array_filter(
            array_map('trim', explode('|', $raw)),
            static fn (string $name): bool => $name !== '',
        ));

        if ($requestedNames === []) {
            return;
        }

        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        $nextSortOrder = (int) ($product->images()->max('sort_order') ?? -1) + 1;

        foreach ($requestedNames as $name) {
            $lookupKey = strtolower(basename($name));
            $fileEntry = $zipImageMap[$lookupKey] ?? null;

            if (! is_array($fileEntry) || ! isset($fileEntry['path']) || ! is_file($fileEntry['path'])) {
                continue;
            }

            $extension = (string) ($fileEntry['extension'] ?? 'jpg');
            $storedPath = $this->imageOptimizationService->storeFromLocalPath(
                (string) $fileEntry['path'],
                $extension,
            );

            if ($storedPath === '') {
                continue;
            }

            $product->images()->create([
                'image_path' => $storedPath,
                'alt' => $product->name,
                'label' => $product->name,
                'is_primary' => ! $hasPrimary,
                'sort_order' => $nextSortOrder,
            ]);

            $hasPrimary = true;
            $nextSortOrder++;
        }
    }

    private function resolveCategory(string $value): ?Category
    {
        if ($value === '') {
            return null;
        }

        return Category::query()
            ->where('slug', $value)
            ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($value)])
            ->first();
    }

    private function resolveStore(string $value): ?Store
    {
        if ($value === '') {
            return null;
        }

        return Store::query()
            ->where('slug', $value)
            ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($value)])
            ->first();
    }

    private function parseBoolean(mixed $value, bool $default): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        $normalized = mb_strtolower(trim((string) $value));

        if ($normalized === '') {
            return $default;
        }

        if (in_array($normalized, ['1', 'true', 'ya', 'yes', 'aktif', 'y'], true)) {
            return true;
        }

        if (in_array($normalized, ['0', 'false', 'tidak', 'no', 'nonaktif', 'n'], true)) {
            return false;
        }

        return $default;
    }

    private function parseNullableInt(mixed $value): ?int
    {
        if ($value === null) {
            return null;
        }

        $cleaned = preg_replace('/[^\d-]/', '', trim((string) $value));

        if (! is_string($cleaned) || $cleaned === '' || ! is_numeric($cleaned)) {
            return null;
        }

        return (int) $cleaned;
    }

    private function parseNullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed !== '' ? $trimmed : null;
    }
}
