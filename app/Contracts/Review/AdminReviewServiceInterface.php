<?php

namespace App\Contracts\Review;

use App\Models\Product\ProductReview;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AdminReviewServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $filters
     * @param  array<int, int>  $ids
     * @return Collection<int, ProductReview>
     */
    public function getForExport(array $filters = [], array $ids = []): Collection;

    /**
     * @return array<string, int|float>
     */
    public function getStats(): array;

    /**
     * @return array<string, mixed>
     */
    public function getFilterOptions(): array;

    public function hideReview(User $admin, ProductReview $review, string $reason): ProductReview;

    public function restoreReview(User $admin, ProductReview $review): ProductReview;

    public function saveReply(User $admin, ProductReview $review, ?string $reply): ProductReview;
}
