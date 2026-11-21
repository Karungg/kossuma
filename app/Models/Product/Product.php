<?php

namespace App\Models\Product;

use App\Models\Category\Category;
use App\Models\Store\Store;
use App\Policies\Product\ProductPolicy;
use Database\Factories\Product\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'category_id',
    'store_id',
    'name',
    'slug',
    'description',
    'stock',
    'price',
    'original_price',
    'unit_label',
    'weight_grams',
    'is_preorder',
    'preorder_days',
    'composition',
    'cooking_instructions',
    'specifications',
    'sold_count',
    'rating_avg',
    'reviews_count',
    'is_active',
])]
#[UsePolicy(ProductPolicy::class)]
class Product extends Model
{
    use HasFactory;

    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'price' => 'integer',
            'original_price' => 'integer',
            'weight_grams' => 'integer',
            'is_preorder' => 'boolean',
            'preorder_days' => 'integer',
            'cooking_instructions' => 'array',
            'specifications' => 'array',
            'sold_count' => 'integer',
            'rating_avg' => 'float',
            'reviews_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)
            ->orderByDesc('is_primary')
            ->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->latest();
    }

    public static function resolveImageUrl(?string $path, bool $thumbnail = false, ?string $disk = null): ?string
    {
        if (! is_string($path)) {
            return null;
        }

        $trimmed = str_replace('\\', '/', trim($path));

        if ($trimmed === '') {
            return null;
        }

        if (
            preg_match('/^(https?:)?\/\//i', $trimmed) === 1
            || str_starts_with(strtolower($trimmed), 'data:image/')
        ) {
            return $trimmed;
        }

        $normalized = ltrim($trimmed, '/');
        $assetUrl = config('app.asset_url');
        $assetPrefix = is_string($assetUrl) && trim($assetUrl) !== ''
            ? rtrim(trim($assetUrl), '/')
            : '';

        if (str_starts_with($normalized, 'assets/')) {
            return $assetPrefix !== ''
                ? $assetPrefix.'/'.$normalized
                : '/'.$normalized;
        }

        $relativePath = str_starts_with($normalized, 'storage/')
            ? substr($normalized, strlen('storage/'))
            : $normalized;

        if ($relativePath === '') {
            return null;
        }

        $configuredDisk = config('filesystems.product_image_disk', 'public');
        $resolvedDisk = is_string($disk) && trim($disk) !== ''
            ? trim($disk)
            : (is_string($configuredDisk) && trim($configuredDisk) !== '' ? trim($configuredDisk) : 'public');

        $driver = config("filesystems.disks.{$resolvedDisk}.driver");
        $targetRelativePath = $relativePath;

        if ($thumbnail) {
            $thumbPath = self::thumbnailRelativePath($relativePath);

            if ($thumbPath !== $relativePath) {
                if ($driver === 'local') {
                    if (Storage::disk($resolvedDisk)->exists($thumbPath)) {
                        $targetRelativePath = $thumbPath;
                    }
                } elseif (
                    str_starts_with($relativePath, 'products/')
                    && str_ends_with(strtolower($relativePath), '.webp')
                ) {
                    $targetRelativePath = $thumbPath;
                }
            }
        }

        if ($driver !== 'local') {
            return Storage::disk($resolvedDisk)->url($targetRelativePath);
        }

        if ($resolvedDisk === 'public') {
            return $assetPrefix !== ''
                ? $assetPrefix.'/storage/'.ltrim($targetRelativePath, '/')
                : '/storage/'.ltrim($targetRelativePath, '/');
        }

        return Storage::disk($resolvedDisk)->url($targetRelativePath);
    }

    public static function thumbnailRelativePath(string $relativePath): string
    {
        $normalized = ltrim(str_replace('\\', '/', trim($relativePath)), '/');

        if ($normalized === '' || str_contains($normalized, '/thumbs/') || str_starts_with($normalized, 'thumbs/')) {
            return $normalized;
        }

        $directory = dirname($normalized);
        $filename = basename($normalized);

        if ($directory === '.' || $directory === '') {
            return 'thumbs/'.$filename;
        }

        return $directory.'/thumbs/'.$filename;
    }

    public function getPrimaryImageUrl(bool $thumbnail = false, ?string $disk = null): ?string
    {
        $image = null;

        if ($this->relationLoaded('primaryImage')) {
            $loaded = $this->getRelation('primaryImage');

            if ($loaded instanceof ProductImage) {
                $image = $loaded;
            }
        }

        if (! $image instanceof ProductImage && $this->relationLoaded('images')) {
            $loadedImages = $this->getRelation('images');

            if ($loadedImages instanceof Collection) {
                $primary = $loadedImages->firstWhere('is_primary', true) ?? $loadedImages->first();

                if ($primary instanceof ProductImage) {
                    $image = $primary;
                }
            }
        }

        if (! $image instanceof ProductImage && ! $this->relationLoaded('primaryImage')) {
            $queried = $this->primaryImage()->first();

            if ($queried instanceof ProductImage) {
                $image = $queried;
            }
        }

        return $image instanceof ProductImage
            ? self::resolveImageUrl($image->image_path, $thumbnail, $disk)
            : null;
    }

    public function getImageUrls(bool $thumbnail = false, ?string $disk = null): array
    {
        $images = $this->relationLoaded('images')
            ? $this->getRelation('images')
            : $this->images()->get();

        if (! $images instanceof Collection) {
            return [];
        }

        $urls = [];

        foreach ($images as $image) {
            if (! $image instanceof ProductImage) {
                continue;
            }

            $resolved = self::resolveImageUrl($image->image_path, $thumbnail, $disk);

            if (is_string($resolved) && $resolved !== '') {
                $urls[] = $resolved;
            }
        }

        return $urls;
    }
}
