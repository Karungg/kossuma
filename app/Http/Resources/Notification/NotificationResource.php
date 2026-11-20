<?php

namespace App\Http\Resources\Notification;

use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;

/**
 * @mixin DatabaseNotification
 */
class NotificationResource extends JsonResource
{
    /**
     * @return array{
     *     id: string,
     *     title: string,
     *     message: string,
     *     category: string,
     *     category_label: string,
     *     level: string,
     *     action_url: string|null,
     *     action_label: string|null,
     *     is_read: bool,
     *     read_at: string|null,
     *     created_at: string|null,
     *     created_at_human: string
     * }
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $payload */
        $payload = $this->data;

        $rawCategory = is_string($payload['category'] ?? null)
            ? $payload['category']
            : NotificationCategory::System->value;
        $category = NotificationCategory::tryFrom($rawCategory) ?? NotificationCategory::System;

        $rawLevel = is_string($payload['level'] ?? null)
            ? $payload['level']
            : NotificationLevel::Info->value;
        $level = NotificationLevel::tryFrom($rawLevel) ?? NotificationLevel::Info;

        $title = is_string($payload['title'] ?? null) && $payload['title'] !== ''
            ? $payload['title']
            : 'Notifikasi';

        $message = is_string($payload['message'] ?? null)
            ? $payload['message']
            : '';

        $actionUrl = is_string($payload['action_url'] ?? null) && $payload['action_url'] !== ''
            ? $payload['action_url']
            : null;

        $actionLabel = is_string($payload['action_label'] ?? null) && $payload['action_label'] !== ''
            ? $payload['action_label']
            : null;

        $createdAtHuman = '-';

        if ($this->created_at !== null) {
            $localized = Carbon::parse($this->created_at)->locale('id');

            if ($localized instanceof Carbon) {
                $createdAtHuman = $localized->diffForHumans();
            }
        }

        return [
            'id' => (string) $this->id,
            'title' => $title,
            'message' => $message,
            'category' => $category->value,
            'category_label' => $category->label(),
            'level' => $level->value,
            'action_url' => $actionUrl,
            'action_label' => $actionLabel,
            'is_read' => $this->read_at !== null,
            'read_at' => $this->read_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'created_at_human' => $createdAtHuman,
        ];
    }
}
