<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'image_path', 'alt', 'label', 'is_primary', 'sort_order'])]
class ProductImage extends Model
{
    protected $appends = ['url', 'thumbnail_url'];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function resolveUrl(bool $thumbnail = false, ?string $disk = null): ?string
    {
        return Product::resolveImageUrl($this->image_path, $thumbnail, $disk);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->resolveUrl(false);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->resolveUrl(true);
    }
}
