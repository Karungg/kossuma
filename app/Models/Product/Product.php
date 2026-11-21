<?php

namespace App\Models\Product;

use App\Models\Category\Category;
use App\Models\Store\Store;
use App\Policies\Product\ProductPolicy;
use Database\Factories\Product\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        return $this->hasOne(ProductImage::class)->where('is_primary', true)->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->latest();
    }
}
