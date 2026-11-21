<?php

namespace App\Contracts\Order;

use App\Models\Order\Order;
use App\Models\Product\ProductReview;
use App\Models\User;

interface CustomerOrderServiceInterface
{
    /**
     * @param array{
     *     status?: string|null,
     *     search?: string|null,
     *     preset?: string|null,
     *     date_from?: string|null,
     *     date_to?: string|null
     * } $filters
     * @return array<string, mixed>
     */
    public function getOrdersPageData(User $user, array $filters): array;

    public function getActiveOrderCount(User $user): int;

    /**
     * @return array{addedCount: int, skippedNames: list<string>}
     */
    public function buyAgain(User $user, Order $order): array;

    public function cancelOrder(User $user, Order $order, string $reason): Order;

    public function confirmReceived(User $user, Order $order): Order;

    public function submitItemReview(
        User $user,
        Order $order,
        int $orderItemId,
        int $rating,
        string $comment,
    ): ProductReview;
}
