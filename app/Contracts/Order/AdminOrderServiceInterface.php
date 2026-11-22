<?php

namespace App\Contracts\Order;

use App\Models\Order\Order;
use App\Models\Order\OrderInternalNote;
use App\Models\Order\OrderStatusHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AdminOrderServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $filters
     * @param  array<int, int>  $ids
     * @return Collection<int, Order>
     */
    public function getForExport(array $filters = [], array $ids = []): Collection;

    /**
     * @return array<string, int>
     */
    public function getStats(): array;

    /**
     * @return array<string, int>
     */
    public function getStatusCounts(): array;

    /**
     * @return array<string, mixed>
     */
    public function getFilterOptions(): array;

    /**
     * @return array<string, mixed>
     */
    public function getOrderDetail(Order $order): array;

    public function confirmPayment(User $admin, Order $order, ?string $note = null): Order;

    public function shipOrder(
        User $admin,
        Order $order,
        string $shippingCourier,
        string $trackingNumber,
        ?string $note = null,
    ): Order;

    public function addTrackingUpdate(
        User $admin,
        Order $order,
        string $title,
        ?string $description = null,
        ?string $location = null,
    ): OrderStatusHistory;

    public function completeOrder(User $admin, Order $order, ?string $note = null): Order;

    public function cancelOrder(User $admin, Order $order, string $reason): Order;

    public function addInternalNote(User $admin, Order $order, string $note): OrderInternalNote;
}
