<?php

namespace App\Services\Order;

use App\Contracts\Export\QueuedExportProviderInterface;
use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Contracts\Order\AdminOrderServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Models\Order\Order;

class OrderQueuedExportProvider implements QueuedExportProviderInterface
{
    public function __construct(
        public readonly AdminOrderServiceInterface $orderService,
        public readonly OrderExportDefinition $exportDefinition,
    ) {}

    public function definition(): TabularExportDefinitionInterface
    {
        return $this->exportDefinition;
    }

    public function notificationCategory(): NotificationCategory
    {
        return NotificationCategory::Order;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @param  array<int, int>  $ids
     * @return iterable<int, Order>
     */
    public function resolveRecords(array $filters = [], array $ids = []): iterable
    {
        return $this->orderService->getForExport($filters, $ids);
    }
}
