<?php

namespace App\Notifications;

use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;

class GeneralAppNotification extends BaseAppNotification
{
    public function __construct(
        public readonly string $notificationTitle,
        public readonly string $notificationMessage,
        public readonly NotificationCategory $notificationCategory = NotificationCategory::System,
        public readonly NotificationLevel $notificationLevel = NotificationLevel::Info,
        public readonly ?string $notificationActionUrl = null,
        public readonly ?string $notificationActionLabel = null,
        public readonly array $notificationMeta = [],
    ) {}

    protected function title(): string
    {
        return $this->notificationTitle;
    }

    protected function message(): string
    {
        return $this->notificationMessage;
    }

    protected function category(): NotificationCategory
    {
        return $this->notificationCategory;
    }

    protected function level(): NotificationLevel
    {
        return $this->notificationLevel;
    }

    protected function actionUrl(): ?string
    {
        return $this->notificationActionUrl;
    }

    protected function actionLabel(): ?string
    {
        return $this->notificationActionLabel;
    }

    protected function meta(): array
    {
        return $this->notificationMeta;
    }
}
