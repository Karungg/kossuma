<?php

namespace App\Services\Notification;

use App\Contracts\Notification\NotificationServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Notifications\DatabaseNotification;

class NotificationService implements NotificationServiceInterface
{
    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    public function getReadCount(User $user): int
    {
        return $user->readNotifications()->count();
    }

    public function getPaginatedForUser(
        User $user,
        ?string $status = null,
        ?string $category = null,
        int $perPage = 15,
    ): LengthAwarePaginator {
        $query = $user->notifications()->latest();

        if ($status === 'unread') {
            $query->whereNull('read_at');
        }

        if ($category !== null && in_array($category, NotificationCategory::values(), true)) {
            $query->where('data->category', $category);
        }

        return $query->paginate($perPage);
    }

    public function markAsRead(User $user, string $notificationId): bool
    {
        /** @var DatabaseNotification|null $notification */
        $notification = $user->notifications()->whereKey($notificationId)->first();

        if ($notification === null) {
            return false;
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return true;
    }

    public function markAllAsRead(User $user): int
    {
        return (int) $user->unreadNotifications()->update([
            'read_at' => now(),
        ]);
    }

    public function delete(User $user, string $notificationId): bool
    {
        /** @var DatabaseNotification|null $notification */
        $notification = $user->notifications()->whereKey($notificationId)->first();

        if ($notification === null) {
            return false;
        }

        return (bool) $notification->delete();
    }

    public function deleteRead(User $user): int
    {
        return (int) $user->readNotifications()->delete();
    }
}
