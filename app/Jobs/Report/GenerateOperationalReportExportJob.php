<?php

namespace App\Jobs\Report;

use App\Contracts\Notification\NotificationServiceInterface;
use App\Contracts\Report\AdminReportServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;
use App\Models\User;
use App\Notifications\GeneralAppNotification;
use App\Services\Report\AdminReportExportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateOperationalReportExportJob implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function __construct(
        public readonly string $userId,
        public readonly string $format,
        public readonly string $scope = 'all',
        public readonly array $filters = [],
    ) {}

    public function handle(
        AdminReportServiceInterface $reportService,
        AdminReportExportService $exportService,
        NotificationServiceInterface $notificationService,
    ): void {
        $user = User::query()->find($this->userId);

        if (! $user instanceof User) {
            return;
        }

        $reportData = $reportService->getReportData($this->filters);
        $stored = $exportService->storeToDisk(
            reportData: $reportData,
            format: $this->format,
            scope: $this->scope,
            directory: 'exports/'.$user->id,
        );

        $formatLabel = match ($this->format) {
            'xlsx' => 'Excel (.xlsx)',
            'pdf' => 'PDF (.pdf)',
            default => 'CSV (.csv)',
        };

        $scopeLabel = AdminReportExportService::SCOPE_LABELS[$this->scope]
            ?? AdminReportExportService::SCOPE_LABELS['all'];

        $periodLabel = (string) ($reportData['periodMeta']['period_label'] ?? '');

        $notificationService->notifyUser($user, new GeneralAppNotification(
            notificationTitle: $scopeLabel.' siap diunduh',
            notificationMessage: 'File '.$stored['filename'].' ('.$formatLabel.') untuk periode '.$periodLabel.' selesai diproses.',
            notificationCategory: NotificationCategory::System,
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

        app(NotificationServiceInterface::class)->notifyUser($user, new GeneralAppNotification(
            notificationTitle: 'Ekspor laporan operasional gagal diproses',
            notificationMessage: 'Terjadi kendala saat menyiapkan file laporan Anda. Silakan coba beberapa saat lagi.',
            notificationCategory: NotificationCategory::System,
            notificationLevel: NotificationLevel::Danger,
        ));
    }
}
