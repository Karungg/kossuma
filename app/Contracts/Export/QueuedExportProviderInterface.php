<?php

namespace App\Contracts\Export;

use App\Enums\Notification\NotificationCategory;

interface QueuedExportProviderInterface
{
    public function definition(): TabularExportDefinitionInterface;

    public function notificationCategory(): NotificationCategory;

    public function resolveRecords(array $filters = [], array $ids = []): iterable;
}
