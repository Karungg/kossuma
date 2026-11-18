<?php

namespace App\Services\Product;

use App\Contracts\Product\ProductServiceInterface;
use App\Models\Product\Product;
use App\Models\Product\ProductImage;
use App\Models\Product\ProductReview;
use Illuminate\Database\Eloquent\Collection;

class ProductService implements ProductServiceInterface
{
    /**
     * Retrieve a single active product detail payload by its slug.
     *
     * @return array<string, mixed>
     */
    public function getProductDetailBySlug(string $slug): array
    {
        $product = Product::query()
            ->with([
                'category:id,name,slug',
                'store:id,name,slug,location,is_verified',
                'images:id,product_id,image_path,alt,label,is_primary,sort_order',
                'reviews:id,product_id,author_name,author_location,rating,variant,comment,created_at',
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
                'url' => $image->image_path,
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
                'imageUrl' => $related->primaryImage?->image_path ?? '',
                'imageAlt' => $related->primaryImage?->alt ?? $related->name,
            ])->values()->all(),
        ];
    }

    /**
     * @return Collection<int, Product>
     */
    private function getRelatedProducts(Product $product): Collection
    {
        return Product::query()
            ->with([
                'store:id,name',
                'primaryImage:id,product_id,image_path,alt',
            ])
            ->where('is_active', true)
            ->where('id', '!=', $product->id)
            ->orderByRaw('CASE WHEN category_id = ? THEN 0 ELSE 1 END', [$product->category_id])
            ->orderByDesc('sold_count')
            ->limit(4)
            ->get();
    }

    /**
     * @return array{0: string, 1: string}
     */
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
