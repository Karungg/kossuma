<?php

namespace App\Notifications;

use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;
use Illuminate\Notifications\Notification;

abstract class BaseAppNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    abstract protected function title(): string;

    abstract protected function message(): string;

    protected function category(): NotificationCategory
    {
        return NotificationCategory::System;
    }

    protected function level(): NotificationLevel
    {
        return NotificationLevel::Info;
    }

    protected function actionUrl(): ?string
    {
        return null;
    }

    protected function actionLabel(): ?string
    {
        return null;
    }

    protected function meta(): array
    {
        return [];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title(),
            'message' => $this->message(),
            'category' => $this->category()->value,
            'level' => $this->level()->value,
            'action_url' => $this->actionUrl(),
            'action_label' => $this->actionLabel(),
            'meta' => $this->meta(),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
