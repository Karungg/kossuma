<?php

namespace App\Models\Product;

use App\Models\Order\OrderItem;
use App\Models\User;
use App\Policies\Review\ProductReviewPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property string|null $user_id
 * @property int|null $order_item_id
 * @property string $author_name
 * @property string|null $author_location
 * @property int $rating
 * @property string|null $variant
 * @property string $comment
 * @property bool $is_hidden
 * @property string|null $hidden_reason
 * @property string|null $moderated_by
 * @property Carbon|null $moderated_at
 * @property string|null $admin_reply
 * @property string|null $admin_replied_by
 * @property Carbon|null $admin_replied_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'product_id',
    'user_id',
    'order_item_id',
    'author_name',
    'author_location',
    'rating',
    'variant',
    'comment',
    'is_hidden',
    'hidden_reason',
    'moderated_by',
    'moderated_at',
    'admin_reply',
    'admin_replied_by',
    'admin_replied_at',
])]
#[UsePolicy(ProductReviewPolicy::class)]
class ProductReview extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_hidden' => 'boolean',
            'moderated_at' => 'datetime',
            'admin_replied_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_hidden', false);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<OrderItem, $this>
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function replier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_replied_by');
    }

    public static function recalculateProductRating(Product $product): void
    {
        $stats = self::query()
            ->visible()
            ->where('product_id', $product->id)
            ->selectRaw('COUNT(*) as aggregate_count, AVG(rating) as aggregate_avg')
            ->toBase()
            ->first();

        $count = (int) ($stats->aggregate_count ?? 0);
        $avg = $count > 0
            ? round((float) ($stats->aggregate_avg ?? 0), 2)
            : 0.0;

        $product->forceFill([
            'reviews_count' => $count,
            'rating_avg' => $avg,
        ])->save();
    }
}
