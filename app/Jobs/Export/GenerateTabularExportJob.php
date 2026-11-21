<?php

namespace App\Jobs\Export;

use App\Contracts\Export\QueuedExportProviderInterface;
use App\Contracts\Notification\NotificationServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;
use App\Models\User;
use App\Notifications\GeneralAppNotification;
use App\Services\Export\TabularExportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateTabularExportJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $userId,
        public readonly string $providerClass,
        public readonly string $format,
        public readonly array $filters = [],
        public readonly array $ids = [],
        public readonly array $columns = [],
    ) {}

    public function handle(
        TabularExportService $tabularExportService,
        NotificationServiceInterface $notificationService,
    ): void {
        $user = User::query()->find($this->userId);

        if (! $user instanceof User) {
            return;
        }

        $provider = app($this->providerClass);

        if (! $provider instanceof QueuedExportProviderInterface) {
            return;
        }

        $definition = $provider->definition();
        $records = $provider->resolveRecords($this->filters, $this->ids);

        $stored = $tabularExportService->storeToDisk(
            records: $records,
            format: $this->format,
            definition: $definition,
            directory: 'exports/'.$user->id,
            columns: $this->columns,
        );

        $formatLabel = match ($this->format) {
            'xlsx' => 'Excel (.xlsx)',
            'pdf' => 'PDF (.pdf)',
            default => 'CSV (.csv)',
        };

        $notificationService->notifyUser($user, new GeneralAppNotification(
            notificationTitle: 'Ekspor '.$definition->itemLabel().' siap diunduh',
            notificationMessage: 'File '.$stored['filename'].' ('.$formatLabel.') selesai diproses di latar belakang.',
            notificationCategory: $provider->notificationCategory(),
            notificationLevel: NotificationLevel::Success,
            notificationMeta: [
                'export_disk' => $stored['disk'],
                'export_path' => $stored['path'],
                'export_filename' => $stored['filename'],
            ],
        ));
    }

    public function failed(?Throwable $exception): void
    {
        $user = User::query()->find($this->userId);

        if (! $user instanceof User) {
            return;
        }

        $category = NotificationCategory::System;
        $itemLabel = 'data';

        if (class_exists($this->providerClass)) {
            $provider = app($this->providerClass);

            if ($provider instanceof QueuedExportProviderInterface) {
                $category = $provider->notificationCategory();
                $itemLabel = $provider->definition()->itemLabel();
            }
        }

        app(NotificationServiceInterface::class)->notifyUser($user, new GeneralAppNotification(
            notificationTitle: 'Ekspor '.$itemLabel.' gagal diproses',
            notificationMessage: 'Terjadi kendala saat menyiapkan file ekspor Anda. Silakan coba beberapa saat lagi.',
            notificationCategory: $category,
            notificationLevel: NotificationLevel::Danger,
        ));
    }
}
