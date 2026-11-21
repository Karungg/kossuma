<?php

namespace App\Contracts\Notification;

use App\Models\User;
use App\Notifications\BaseAppNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface NotificationServiceInterface
{
    public function notifyUser(User $user, BaseAppNotification $notification): void;

    public function notifyUsers(Collection $users, BaseAppNotification $notification): void;

    public function notifyRole(string $roleName, BaseAppNotification $notification): void;

    public function getUnreadCount(User $user): int;

    public function getReadCount(User $user): int;

    public function getPaginatedForUser(
        User $user,
        ?string $status = null,
        ?string $category = null,
        int $perPage = 15,
    ): LengthAwarePaginator;

    public function resolveDownloadableFile(User $user, string $notificationId): ?array;

    public function markAsRead(User $user, string $notificationId): bool;

    public function markAllAsRead(User $user): int;

    public function delete(User $user, string $notificationId): bool;

    public function deleteRead(User $user): int;
}
