<?php

namespace App\Notifications;

use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;
use Illuminate\Notifications\Notification;

abstract class BaseAppNotification extends Notification
{
    /**
     * @return array<int, string>
     */
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

    /**
     * @return array<string, mixed>
     */
    protected function meta(): array
    {
        return [];
    }

    /**
     * @return array{
     *     title: string,
     *     message: string,
     *     category: string,
     *     level: string,
     *     action_url: string|null,
     *     action_label: string|null,
     *     meta: array<string, mixed>
     * }
     */
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

    /**
     * @return array{
     *     title: string,
     *     message: string,
     *     category: string,
     *     level: string,
     *     action_url: string|null,
     *     action_label: string|null,
     *     meta: array<string, mixed>
     * }
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
