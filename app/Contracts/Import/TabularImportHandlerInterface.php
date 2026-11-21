<?php

namespace App\Contracts\Import;

use App\Enums\Notification\NotificationCategory;

interface TabularImportHandlerInterface
{
    public function templateFilePrefix(): string;

    public function templateSheetName(): string;

    public function guideSheetName(): string;

    public function templateHeaders(): array;

    public function templateExampleRows(): array;

    public function templateGuideRows(): array;

    public function notificationCategory(): NotificationCategory;

    public function itemLabel(): string;

    public function importRow(array $row, int $rowNumber, array $context = []): string;
}
