<?php

namespace App\Services\Notification;

use App\Contracts\Notification\NotificationServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Models\User;
use App\Notifications\BaseAppNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class NotificationService implements NotificationServiceInterface
{
    public function notifyUser(User $user, BaseAppNotification $notification): void
    {
        $user->notify($notification);
    }

    public function notifyUsers(Collection $users, BaseAppNotification $notification): void
    {
        if ($users->isEmpty()) {
            return;
        }

        Notification::send($users, $notification);
    }

    public function notifyRole(string $roleName, BaseAppNotification $notification): void
    {
        User::role($roleName)->chunkById(100, function (Collection $users) use ($notification): void {
            Notification::send($users, $notification);
        });
    }

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

    public function resolveDownloadableFile(User $user, string $notificationId): ?array
    {
        $notification = $user->notifications()->whereKey($notificationId)->first();

        if (! $notification instanceof DatabaseNotification) {
            return null;
        }

        $meta = $notification->data['meta'] ?? [];
        $disk = is_string($meta['export_disk'] ?? null) ? $meta['export_disk'] : 'local';
        $path = is_string($meta['export_path'] ?? null) ? $meta['export_path'] : '';
        $filename = is_string($meta['export_filename'] ?? null) ? $meta['export_filename'] : basename($path);

        if ($path === '' || ! Storage::disk($disk)->exists($path)) {
            return null;
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return [
            'disk' => $disk,
            'path' => $path,
            'filename' => $filename,
        ];
    }

    public function markAsRead(User $user, string $notificationId): bool
    {
        $notification = $user->notifications()->whereKey($notificationId)->first();

        if (! $notification instanceof DatabaseNotification) {
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
        $notification = $user->notifications()->whereKey($notificationId)->first();

        if (! $notification instanceof DatabaseNotification) {
            return false;
        }

        $this->deleteStoredExportFile($notification);

        return (bool) $notification->delete();
    }

    public function deleteRead(User $user): int
    {
        $readNotifications = $user->readNotifications()->get();

        foreach ($readNotifications as $notification) {
            if ($notification instanceof DatabaseNotification) {
                $this->deleteStoredExportFile($notification);
            }
        }

        return (int) $user->readNotifications()->delete();
    }

    private function deleteStoredExportFile(DatabaseNotification $notification): void
    {
        $meta = $notification->data['meta'] ?? [];
        $disk = is_string($meta['export_disk'] ?? null) ? $meta['export_disk'] : 'local';
        $path = is_string($meta['export_path'] ?? null) ? $meta['export_path'] : '';

        if ($path !== '' && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }
}
