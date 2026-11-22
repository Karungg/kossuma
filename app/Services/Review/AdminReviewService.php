<?php

namespace App\Services\Review;

use App\Contracts\Review\AdminReviewServiceInterface;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminReviewService implements AdminReviewServiceInterface
{
    private const array SORTABLE_COLUMNS = [
        'created_at',
        'rating',
    ];

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $paginator = $this->buildQuery($filters)
            ->paginate($perPage)
            ->withQueryString();

        $paginator->setCollection(
            $paginator->getCollection()->map(
                fn (ProductReview $review): array => $this->formatReviewRow($review),
            ),
        );

        /** @var LengthAwarePaginator<int, array<string, mixed>> $paginator */
        return $paginator;
    }

    public function getForExport(array $filters = [], array $ids = []): Collection
    {
        $query = $this->buildQuery($filters);

        if ($ids !== []) {
            $query->whereIn('id', $ids);
        }

        return $query->get();
    }

    public function getStats(): array
    {
        $total = ProductReview::query()->count();
        $visibleStats = ProductReview::query()
            ->visible()
            ->selectRaw('COUNT(*) as visible_count, AVG(rating) as avg_rating')
            ->first();

        $lowRating = ProductReview::query()
            ->visible()
            ->where('rating', '<=', 2)
            ->count();

        $hidden = ProductReview::query()
            ->where('is_hidden', true)
            ->count();

        $unreplied = ProductReview::query()
            ->visible()
            ->whereNull('admin_reply')
            ->count();

        return [
            'total' => $total,
            'visible' => (int) ($visibleStats?->getAttribute('visible_count') ?? 0),
            'average_rating' => round((float) ($visibleStats?->getAttribute('avg_rating') ?? 0), 2),
            'low_rating' => $lowRating,
            'hidden' => $hidden,
            'unreplied' => $unreplied,
        ];
    }

    public function getFilterOptions(): array
    {
        return [
            'products' => Product::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                ])
                ->all(),
            'stores' => Store::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Store $store): array => [
                    'id' => $store->id,
                    'name' => $store->name,
                ])
                ->all(),
        ];
    }

    public function hideReview(User $admin, ProductReview $review, string $reason): ProductReview
    {
        return DB::transaction(function () use ($admin, $review, $reason): ProductReview {
            $review->forceFill([
                'is_hidden' => true,
                'hidden_reason' => trim($reason),
                'moderated_by' => $admin->id,
                'moderated_at' => now(),
            ])->save();

            $product = $review->product;
            if ($product instanceof Product) {
                ProductReview::recalculateProductRating($product);
            }

            return $review->fresh() ?? $review;
        });
    }

    public function restoreReview(User $admin, ProductReview $review): ProductReview
    {
        return DB::transaction(function () use ($admin, $review): ProductReview {
            $review->forceFill([
                'is_hidden' => false,
                'hidden_reason' => null,
                'moderated_by' => $admin->id,
                'moderated_at' => now(),
            ])->save();

            $product = $review->product;
            if ($product instanceof Product) {
                ProductReview::recalculateProductRating($product);
            }

            return $review->fresh() ?? $review;
        });
    }

    public function saveReply(User $admin, ProductReview $review, ?string $reply): ProductReview
    {
        $cleanReply = is_string($reply) ? trim($reply) : '';

        if ($cleanReply === '') {
            $review->forceFill([
                'admin_reply' => null,
                'admin_replied_by' => null,
                'admin_replied_at' => null,
            ])->save();
        } else {
            $review->forceFill([
                'admin_reply' => $cleanReply,
                'admin_replied_by' => $admin->id,
                'admin_replied_at' => now(),
            ])->save();
        }

        return $review->fresh() ?? $review;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<ProductReview>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = ProductReview::query()
            ->with([
                'product' => fn ($productQuery) => $productQuery
                    ->select(['id', 'store_id', 'name', 'slug'])
                    ->with(['store:id,name', 'primaryImage']),
                'orderItem.order:id,order_number',
                'moderator:id,name',
                'replier:id,name',
            ]);

        $search = is_string($filters['search'] ?? null) ? trim($filters['search']) : '';
        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function (Builder $searchQuery) use ($like): void {
                $searchQuery
                    ->where('comment', 'like', $like)
                    ->orWhere('author_name', 'like', $like)
                    ->orWhereHas('product', fn (Builder $productQuery) => $productQuery->where('name', 'like', $like))
                    ->orWhereHas('orderItem.order', fn (Builder $orderQuery) => $orderQuery->where('order_number', 'like', $like));
            });
        }

        if (isset($filters['product_id']) && is_numeric($filters['product_id'])) {
            $query->where('product_id', (int) $filters['product_id']);
        }

        if (isset($filters['store_id']) && is_numeric($filters['store_id'])) {
            $storeId = (int) $filters['store_id'];
            $query->whereHas('product', fn (Builder $productQuery) => $productQuery->where('store_id', $storeId));
        }

        $rating = is_string($filters['rating'] ?? null) || is_int($filters['rating'] ?? null)
            ? trim((string) $filters['rating'])
            : '';

        if ($rating === 'low') {
            $query->where('rating', '<=', 2);
        } elseif (in_array($rating, ['1', '2', '3', '4', '5'], true)) {
            $query->where('rating', (int) $rating);
        }

        $visibility = is_string($filters['visibility'] ?? null) ? trim($filters['visibility']) : '';
        if ($visibility === 'visible') {
            $query->where('is_hidden', false);
        } elseif ($visibility === 'hidden') {
            $query->where('is_hidden', true);
        }

        $replyStatus = is_string($filters['reply_status'] ?? null) ? trim($filters['reply_status']) : '';
        if ($replyStatus === 'replied') {
            $query->whereNotNull('admin_reply');
        } elseif ($replyStatus === 'unreplied') {
            $query->whereNull('admin_reply');
        }

        $dateFrom = $this->normalizeDate($filters['date_from'] ?? null);
        if ($dateFrom instanceof Carbon) {
            $query->where('created_at', '>=', $dateFrom->copy()->startOfDay());
        }

        $dateTo = $this->normalizeDate($filters['date_to'] ?? null);
        if ($dateTo instanceof Carbon) {
            $query->where('created_at', '<=', $dateTo->copy()->endOfDay());
        }

        $sort = is_string($filters['sort'] ?? null) && in_array($filters['sort'], self::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'created_at';
        $direction = ($filters['direction'] ?? null) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)->orderByDesc('id');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatReviewRow(ProductReview $review): array
    {
        $product = $review->product;
        $store = $product instanceof Product ? $product->store : null;
        $orderItem = $review->orderItem;
        $order = $orderItem instanceof OrderItem ? $orderItem->order : null;

        return [
            'id' => $review->id,
            'product_id' => $review->product_id,
            'product_name' => $product instanceof Product ? $product->name : 'Produk dihapus',
            'product_slug' => $product instanceof Product ? $product->slug : null,
            'product_image_url' => $product instanceof Product ? $product->getPrimaryImageUrl(true) : null,
            'store_name' => $store instanceof Store ? $store->name : '-',
            'order_id' => $order instanceof Order ? $order->id : null,
            'order_number' => $order instanceof Order ? $order->order_number : null,
            'author_name' => $review->author_name,
            'author_location' => $review->author_location ?? 'Kota Bogor',
            'rating' => $review->rating,
            'variant' => $review->variant,
            'comment' => $review->comment,
            'is_hidden' => $review->is_hidden,
            'hidden_reason' => $review->hidden_reason,
            'moderator_name' => $review->moderator instanceof User ? $review->moderator->name : null,
            'moderated_at_label' => $this->formatIndonesianDate($review->moderated_at),
            'admin_reply' => $review->admin_reply,
            'replier_name' => $review->replier instanceof User ? $review->replier->name : null,
            'admin_replied_at_label' => $this->formatIndonesianDate($review->admin_replied_at),
            'created_at' => $review->created_at?->toIso8601String() ?? '',
            'created_at_label' => $this->formatIndonesianDate($review->created_at),
        ];
    }

    private function normalizeDate(mixed $value): ?Carbon
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function formatIndonesianDate(?DateTimeInterface $date): ?string
    {
        if (! $date instanceof DateTimeInterface) {
            return null;
        }

        $monthLabel = match ((int) $date->format('n')) {
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        };

        return $date->format('d').' '.$monthLabel.' '.$date->format('Y').', '.$date->format('H:i').' WIB';
    }
}
