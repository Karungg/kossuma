<?php

namespace App\Services\Review;

use App\Contracts\Export\QueuedExportProviderInterface;
use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Contracts\Review\AdminReviewServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Models\Product\ProductReview;

class ReviewQueuedExportProvider implements QueuedExportProviderInterface
{
    public function __construct(
        public readonly AdminReviewServiceInterface $reviewService,
        public readonly ReviewExportDefinition $exportDefinition,
    ) {}

    public function definition(): TabularExportDefinitionInterface
    {
        return $this->exportDefinition;
    }

    public function notificationCategory(): NotificationCategory
    {
        return NotificationCategory::Product;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @param  array<int, int>  $ids
     * @return iterable<int, ProductReview>
     */
    public function resolveRecords(array $filters = [], array $ids = []): iterable
    {
        return $this->reviewService->getForExport($filters, $ids);
    }
}
