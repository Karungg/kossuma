<?php

namespace App\Services\Product;

use App\Contracts\Export\QueuedExportProviderInterface;
use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Contracts\Product\ProductServiceInterface;
use App\Enums\Notification\NotificationCategory;

class ProductQueuedExportProvider implements QueuedExportProviderInterface
{
    public function __construct(
        public readonly ProductServiceInterface $productService,
        public readonly ProductExportDefinition $exportDefinition,
    ) {}

    public function definition(): TabularExportDefinitionInterface
    {
        return $this->exportDefinition;
    }

    public function notificationCategory(): NotificationCategory
    {
        return NotificationCategory::Product;
    }

    public function resolveRecords(array $filters = [], array $ids = []): iterable
    {
        return $this->productService->getForExport($filters, $ids);
    }
}
