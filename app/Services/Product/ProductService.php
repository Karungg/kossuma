<?php

namespace App\Services\Product;

use App\Concerns\AppliesTableQuery;
use App\Concerns\GeneratesUniqueSlug;
use App\Contracts\Product\ProductServiceInterface;
use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Product\ProductImage;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ProductService implements ProductServiceInterface
{
    use AppliesTableQuery;
    use GeneratesUniqueSlug;

    public function __construct(
        public readonly ProductImageOptimizationService $imageOptimizationService,
    ) {}

    public function getStorefrontCategories(): array
    {
        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(static fn (Category $category): array => [
                'id' => $category->slug,
                'label' => $category->name,
            ])
            ->values()
            ->all();

        return [
            ['id' => 'all', 'label' => 'Semua'],
            ...$categories,
        ];
    }

    public function getStorefrontCatalog(array $filters = [], int $page = 1, int $perPage = 18): array
    {
        $query = Product::query()
            ->with([
                'category:id,name,slug',
                'store:id,name,slug,location',
                'primaryImage:id,product_id,image_path,alt,is_primary,sort_order',
            ])
            ->where('is_active', true);

        $category = trim((string) ($filters['category'] ?? ''));

        if ($category !== '' && $category !== 'all') {
            $query->whereHas('category', static function (Builder $categoryQuery) use ($category): void {
                $categoryQuery->where('slug', $category);
            });
        }

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(static function (Builder $searchQuery) use ($search): void {
                $searchQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('store', static function (Builder $storeQuery) use ($search): void {
                        $storeQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $paginator = $query
            ->orderByDesc('sold_count')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', max(1, $page));

        $items = [];

        foreach ($paginator->items() as $product) {
            if (! $product instanceof Product) {
                continue;
            }

            $storeLocation = $product->store instanceof Store ? $product->store->location : 'Kota Bogor';
            [$district] = $this->parseStoreLocation($storeLocation);

            $originalPrice = (int) ($product->original_price ?? 0);
            $primaryThumbUrl = $product->getPrimaryImageUrl(true) ?? '';
            $primaryFullUrl = $product->getPrimaryImageUrl(false) ?? '';

            $items[] = [
                'id' => (string) $product->id,
                'slug' => $product->slug,
                'title' => $product->name,
                'description' => $product->description,
                'category' => $product->category instanceof Category ? $product->category->slug : '',
                'price' => $product->price,
                'originalPrice' => $originalPrice > $product->price ? $originalPrice : null,
                'rating' => (float) $product->rating_avg,
                'soldCount' => $this->formatCatalogSoldCount($product->sold_count),
                'storeName' => $product->store instanceof Store ? $product->store->name : 'UMKM Kossuma',
                'storeDistrict' => $district,
                'imageUrl' => $primaryThumbUrl,
                'imageFullUrl' => $primaryFullUrl,
                'imageAlt' => $product->primaryImage instanceof ProductImage && is_string($product->primaryImage->alt) && trim($product->primaryImage->alt) !== ''
                    ? $product->primaryImage->alt
                    : $product->name,
                'isPreorder' => $product->is_preorder,
                'preorderDays' => $product->preorder_days,
                'stock' => $product->stock,
            ];
        }

        return [
            'data' => $items,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'has_more' => $paginator->hasMorePages(),
        ];
    }

    public function hasActiveStorefrontProducts(): bool
    {
        return Product::query()->where('is_active', true)->exists();
    }

    public function getProductDetailBySlug(string $slug): array
    {
        $product = Product::query()
            ->with([
                'category:id,name,slug',
                'store:id,name,slug,location,is_verified',
                'images:id,product_id,image_path,alt,label,is_primary,sort_order',
                'reviews' => fn ($reviewQuery) => $reviewQuery
                    ->visible()
                    ->select([
                        'id',
                        'product_id',
                        'author_name',
                        'author_location',
                        'rating',
                        'variant',
                        'comment',
                        'admin_reply',
                        'admin_replied_at',
                        'created_at',
                    ])
                    ->latest('created_at'),
            ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $originalPrice = (int) ($product->original_price ?? 0);
        $discountPercent = ($originalPrice > $product->price && $originalPrice > 0)
            ? (int) round((($originalPrice - $product->price) / $originalPrice) * 100)
            : 0;

        [$district, $city] = $this->parseStoreLocation($product->store->location);

        $relatedProducts = $this->getRelatedProducts($product);

        return [
            'id' => (string) $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'category' => $product->category->name,
            'categorySlug' => $product->category->slug,
            'description' => $product->description,
            'price' => $product->price,
            'originalPrice' => $originalPrice,
            'discountPercent' => $discountPercent,
            'rating' => (float) $product->rating_avg,
            'reviewCount' => $product->reviews_count,
            'soldCount' => $this->formatSoldCount($product->sold_count),
            'stockCount' => $product->stock,
            'stockStatus' => $this->resolveStockStatus($product),
            'unitLabel' => $product->unit_label ?? '1 Pack',
            'weight' => $product->weight_grams ? "{$product->weight_grams} gram" : null,
            'shippingFastInfo' => 'Kirim Hari yang Sama & Instan seluruh wilayah Kota & Kab Bogor.',
            'producer' => [
                'name' => $product->store->name,
                'district' => $district,
                'city' => $city,
                'activeYears' => 2,
                'verified' => $product->store->is_verified,
            ],
            'images' => $product->images->map(fn (ProductImage $image): array => [
                'id' => (string) $image->id,
                'url' => $image->resolveUrl(false) ?? '',
                'thumbnailUrl' => $image->resolveUrl(true) ?? '',
                'alt' => $image->alt ?? $product->name,
                'label' => $image->label ?? $product->name,
            ])->values()->all(),
            'specifications' => $product->specifications ?? [],
            'composition' => $product->composition ?? 'Bahan pangan segar pilihan dengan bumbu rempah alami tanpa pengawet buatan.',
            'cookingInstructions' => $product->cooking_instructions ?? [
                'Diamkan di suhu ruang sebelum digoreng atau dimasak.',
            ],
            'halalAudit' => 'Diproduksi oleh UMKM Muslimah binaan Kossuma Kota Bogor dengan standar pengolahan higienis, bahan teruji halal, dan tanpa pengawet buatan.',
            'reviews' => $product->reviews->map(fn (ProductReview $review): array => [
                'id' => (string) $review->id,
                'authorName' => $review->author_name,
                'authorLocation' => $review->author_location ?? 'Kota Bogor',
                'rating' => $review->rating,
                'date' => $review->created_at?->locale('id')->diffForHumans() ?? 'Baru saja',
                'variant' => $review->variant ?? ($product->unit_label ?? '1 Pack'),
                'comment' => $review->comment,
                'adminReply' => $review->admin_reply,
                'adminRepliedAt' => $review->admin_replied_at?->locale('id')->diffForHumans(),
            ])->values()->all(),
            'relatedProducts' => $relatedProducts->map(fn (Product $related): array => [
                'id' => (string) $related->id,
                'slug' => $related->slug,
                'name' => $related->name,
                'storeName' => $related->store->name,
                'price' => $related->price,
                'portion' => $related->unit_label ?? '1 Pack',
                'badge' => $related->is_preorder
                    ? ($related->preorder_days ? "Pre-order {$related->preorder_days} hari" : 'Pre-order')
                    : 'Pilihan Kami',
                'rating' => (float) $related->rating_avg,
                'imageUrl' => $related->getPrimaryImageUrl(true) ?? '',
                'imageFullUrl' => $related->getPrimaryImageUrl(false) ?? '',
                'imageAlt' => $related->primaryImage?->alt ?? $related->name,
            ])->values()->all(),
        ];
    }

    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getForExport(array $filters = [], array $ids = []): Collection
    {
        return $this->applyExportIds($this->buildQuery($filters), $ids)->get();
    }

    public function getStats(): array
    {
        return [
            'total' => Product::query()->count(),
            'active' => Product::query()->where('is_active', true)->count(),
            'out_of_stock' => Product::query()->where('stock', 0)->count(),
            'preorder' => Product::query()->where('is_preorder', true)->count(),
        ];
    }

    public function getFormOptions(): array
    {
        return [
            'categories' => Category::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->all(),
            'stores' => Store::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->all(),
        ];
    }

    public function create(array $data, array $uploadedImages = []): Product
    {
        return DB::transaction(function () use ($data, $uploadedImages): Product {
            $slug = $this->resolveUniqueSlug(
                modelClass: Product::class,
                slug: $data['slug'] ?? null,
                fallbackSource: $data['name'],
                defaultSlug: 'produk',
            );

            $product = Product::query()->create($this->extractAttributes($data, $slug));

            $this->syncImages(
                product: $product,
                uploadedImages: $uploadedImages,
                existingOrderIds: [],
                removedImageIds: [],
                primaryImageKey: is_string($data['primary_image_key'] ?? null) ? $data['primary_image_key'] : null,
            );

            return $product->load(['category:id,name,slug', 'store:id,name,slug', 'images']);
        });
    }

    public function update(Product $product, array $data, array $uploadedImages = []): Product
    {
        return DB::transaction(function () use ($product, $data, $uploadedImages): Product {
            $slug = $this->resolveUniqueSlug(
                modelClass: Product::class,
                slug: $data['slug'] ?? null,
                fallbackSource: $data['name'],
                defaultSlug: 'produk',
                ignoreId: $product->id,
            );

            $product->update($this->extractAttributes($data, $slug));

            $existingOrderIds = array_map('intval', $data['existing_image_ids'] ?? []);
            $removedImageIds = array_map('intval', $data['removed_image_ids'] ?? []);

            $this->syncImages(
                product: $product,
                uploadedImages: $uploadedImages,
                existingOrderIds: $existingOrderIds,
                removedImageIds: $removedImageIds,
                primaryImageKey: is_string($data['primary_image_key'] ?? null) ? $data['primary_image_key'] : null,
            );

            return $product->refresh()->load(['category:id,name,slug', 'store:id,name,slug', 'images']);
        });
    }

    public function delete(Product $product): bool
    {
        return DB::transaction(function () use ($product): bool {
            $imagePaths = $product->images()->pluck('image_path')->all();
            $deleted = (bool) $product->delete();

            if ($deleted) {
                $this->deleteStoredPublicImages($imagePaths);
            }

            return $deleted;
        });
    }

    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids): int {
            $products = Product::query()
                ->whereIn('id', $ids)
                ->with('images:id,product_id,image_path')
                ->get();

            $imagePaths = [];

            foreach ($products as $product) {
                foreach ($product->images as $image) {
                    $imagePaths[] = $image->image_path;
                }
            }

            $deleted = (int) Product::query()->whereIn('id', $ids)->delete();

            if ($deleted > 0) {
                $this->deleteStoredPublicImages($imagePaths);
            }

            return $deleted;
        });
    }

    private function buildQuery(array $filters = []): Builder
    {
        $query = Product::query()->with([
            'category:id,name,slug',
            'store:id,name,slug',
            'primaryImage:id,product_id,image_path,alt,is_primary,sort_order',
        ]);

        $this->applySearch($query, $filters['search'] ?? null, ['name', 'slug', 'description']);

        if (! empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (! empty($filters['store_id'])) {
            $query->where('store_id', (int) $filters['store_id']);
        }

        $status = $filters['status'] ?? null;

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $stockStatus = $filters['stock_status'] ?? null;

        if ($stockStatus === 'in_stock') {
            $query->where('stock', '>', 0);
        } elseif ($stockStatus === 'out_of_stock') {
            $query->where('stock', 0);
        }

        $preorderStatus = $filters['preorder_status'] ?? null;

        if ($preorderStatus === 'preorder') {
            $query->where('is_preorder', true);
        } elseif ($preorderStatus === 'regular') {
            $query->where('is_preorder', false);
        }

        return $this->applySort(
            query: $query,
            sort: $filters['sort'] ?? null,
            direction: $filters['direction'] ?? null,
            allowedSorts: ['name', 'price', 'stock', 'sold_count', 'created_at', 'updated_at'],
            defaultSort: 'created_at',
            defaultDirection: 'desc',
        );
    }

    private function extractAttributes(array $data, string $slug): array
    {
        $isPreorder = (bool) ($data['is_preorder'] ?? false);
        $cookingInstructions = array_values(array_filter(
            array_map(
                static fn (mixed $item): string => trim((string) $item),
                is_array($data['cooking_instructions'] ?? null) ? $data['cooking_instructions'] : [],
            ),
            static fn (string $item): bool => $item !== '',
        ));

        $specifications = array_values(array_filter(
            array_map(
                static function (mixed $item): ?array {
                    if (! is_array($item)) {
                        return null;
                    }

                    $title = trim((string) ($item['title'] ?? ''));
                    $value = trim((string) ($item['value'] ?? ''));
                    $description = trim((string) ($item['description'] ?? ''));

                    if ($title === '' && $value === '') {
                        return null;
                    }

                    return [
                        'title' => $title,
                        'value' => $value,
                        'description' => $description,
                    ];
                },
                is_array($data['specifications'] ?? null) ? $data['specifications'] : [],
            ),
        ));

        return [
            'category_id' => (int) $data['category_id'],
            'store_id' => (int) $data['store_id'],
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'],
            'stock' => (int) ($data['stock'] ?? 0),
            'price' => (int) $data['price'],
            'original_price' => isset($data['original_price']) && $data['original_price'] !== '' ? (int) $data['original_price'] : null,
            'unit_label' => isset($data['unit_label']) && trim((string) $data['unit_label']) !== '' ? trim((string) $data['unit_label']) : null,
            'weight_grams' => isset($data['weight_grams']) && $data['weight_grams'] !== '' ? (int) $data['weight_grams'] : null,
            'is_preorder' => $isPreorder,
            'preorder_days' => $isPreorder && isset($data['preorder_days']) && $data['preorder_days'] !== '' ? (int) $data['preorder_days'] : null,
            'composition' => isset($data['composition']) && trim((string) $data['composition']) !== '' ? trim((string) $data['composition']) : null,
            'cooking_instructions' => $cookingInstructions !== [] ? $cookingInstructions : null,
            'specifications' => $specifications !== [] ? $specifications : null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ];
    }

    private function syncImages(
        Product $product,
        array $uploadedImages,
        array $existingOrderIds,
        array $removedImageIds,
        ?string $primaryImageKey,
    ): void {
        if ($removedImageIds !== []) {
            $toRemove = $product->images()->whereIn('id', $removedImageIds)->get();
            $pathsToRemove = $toRemove->pluck('image_path')->all();
            $product->images()->whereIn('id', $removedImageIds)->delete();
            $this->deleteStoredPublicImages($pathsToRemove);
        }

        $remainingExisting = $product->images()->get()->keyBy('id');
        $orderedExistingIds = array_values(array_filter(
            $existingOrderIds,
            static fn (int $id): bool => $remainingExisting->has($id),
        ));

        foreach ($remainingExisting->keys() as $id) {
            if (! in_array((int) $id, $orderedExistingIds, true)) {
                $orderedExistingIds[] = (int) $id;
            }
        }

        $sortOrder = 0;
        $keyToImageId = [];

        foreach ($orderedExistingIds as $imageId) {
            $image = $remainingExisting->get($imageId);

            if ($image instanceof ProductImage) {
                $image->update([
                    'sort_order' => $sortOrder,
                    'is_primary' => false,
                ]);
                $keyToImageId["existing:{$imageId}"] = $image->id;
                $sortOrder++;
            }
        }

        foreach (array_values($uploadedImages) as $index => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $storedPath = $this->imageOptimizationService->storeUploadedImage($file);

            if ($storedPath === '') {
                continue;
            }

            $createdImage = $product->images()->create([
                'image_path' => $storedPath,
                'alt' => $product->name,
                'label' => $product->name,
                'is_primary' => false,
                'sort_order' => $sortOrder,
            ]);

            $keyToImageId["new:{$index}"] = $createdImage->id;
            $sortOrder++;
        }

        if ($keyToImageId === []) {
            return;
        }

        $primaryId = ($primaryImageKey !== null && isset($keyToImageId[$primaryImageKey]))
            ? $keyToImageId[$primaryImageKey]
            : reset($keyToImageId);

        if (is_int($primaryId)) {
            $product->images()->whereKey($primaryId)->update(['is_primary' => true]);
        }
    }

    private function deleteStoredPublicImages(array $imagePaths): void
    {
        foreach ($imagePaths as $path) {
            if (! is_string($path)) {
                continue;
            }

            $this->imageOptimizationService->deleteImage($path);
        }
    }

    private function getRelatedProducts(Product $product): Collection
    {
        return Product::query()
            ->with([
                'store:id,name',
                'primaryImage:id,product_id,image_path,alt,is_primary,sort_order',
            ])
            ->where('is_active', true)
            ->where('id', '!=', $product->id)
            ->orderByRaw('CASE WHEN category_id = ? THEN 0 ELSE 1 END', [$product->category_id])
            ->orderByDesc('sold_count')
            ->limit(4)
            ->get();
    }

    private function parseStoreLocation(string $location): array
    {
        $parts = array_map('trim', explode(',', $location, 2));

        return [
            $parts[0] ?: 'Kota Bogor',
            $parts[1] ?? 'Kota Bogor',
        ];
    }

    private function formatSoldCount(int $soldCount): string
    {
        if ($soldCount >= 1000) {
            return number_format($soldCount / 1000, 1, ',', '.').' rb+';
        }

        return (string) $soldCount;
    }

    private function formatCatalogSoldCount(int $soldCount): string
    {
        if ($soldCount <= 0) {
            return '';
        }

        if ($soldCount >= 1000) {
            return number_format($soldCount / 1000, 1, ',', '.').' rb terjual';
        }

        return "{$soldCount} terjual";
    }

    private function resolveStockStatus(Product $product): string
    {
        if ($product->is_preorder) {
            return $product->preorder_days
                ? "Pre-order {$product->preorder_days} hari"
                : 'Pre-order';
        }

        return $product->stock > 0 ? 'Stok Tersedia' : 'Stok Habis';
    }
}
