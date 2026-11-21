<?php

namespace App\Services\Category;

use App\Contracts\Category\CategoryServiceInterface;
use App\Contracts\Export\QueuedExportProviderInterface;
use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Enums\Notification\NotificationCategory;

class CategoryQueuedExportProvider implements QueuedExportProviderInterface
{
    public function __construct(
        public readonly CategoryServiceInterface $categoryService,
        public readonly CategoryExportDefinition $exportDefinition,
    ) {}

    public function definition(): TabularExportDefinitionInterface
    {
        return $this->exportDefinition;
    }

    public function notificationCategory(): NotificationCategory
    {
        return NotificationCategory::Category;
    }

    public function resolveRecords(array $filters = [], array $ids = []): iterable
    {
        return $this->categoryService->getForExport($filters, $ids);
    }
}
