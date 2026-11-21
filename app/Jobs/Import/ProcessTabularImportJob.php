<?php

namespace App\Jobs\Import;

use App\Contracts\Import\TabularImportHandlerInterface;
use App\Contracts\Notification\NotificationServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;
use App\Models\User;
use App\Notifications\GeneralAppNotification;
use App\Services\Import\TabularImportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;
use ZipArchive;

class ProcessTabularImportJob implements ShouldQueue
{
    use Queueable;

    private const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

    private const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    public function __construct(
        public readonly string $userId,
        public readonly string $handlerClass,
        public readonly string $fileDisk,
        public readonly string $filePath,
        public readonly ?string $archiveDisk = null,
        public readonly ?string $archivePath = null,
    ) {}

    public function handle(
        TabularImportService $tabularImportService,
        NotificationServiceInterface $notificationService,
    ): void {
        $user = User::query()->find($this->userId);

        if (! $user instanceof User) {
            $this->cleanupUploadedFiles();

            return;
        }

        $handler = app($this->handlerClass);

        if (! $handler instanceof TabularImportHandlerInterface) {
            $this->cleanupUploadedFiles();

            return;
        }

        $tempExtractDir = null;
        $context = [];

        try {
            if ($this->archiveDisk !== null && $this->archivePath !== null) {
                [$tempExtractDir, $imageFiles] = $this->extractSafeImagesFromZip(
                    $this->archiveDisk,
                    $this->archivePath,
                );
                $context['image_files'] = $imageFiles;
            }

            $result = $tabularImportService->processFile(
                disk: $this->fileDisk,
                path: $this->filePath,
                handler: $handler,
                context: $context,
            );

            $created = (int) $result['created'];
            $updated = (int) $result['updated'];
            $failed = $result['failed'];
            $failedCount = count($failed);

            $meta = [];

            if ($failedCount > 0) {
                $report = $tabularImportService->storeErrorReport(
                    failedRows: $failed,
                    directory: 'exports/'.$user->id,
                    prefix: $handler->templateFilePrefix().'-impor',
                );

                if ($report['path'] !== '') {
                    $meta = [
                        'export_disk' => $report['disk'],
                        'export_path' => $report['path'],
                        'export_filename' => $report['filename'],
                    ];
                }
            }

            $level = $failedCount === 0
                ? NotificationLevel::Success
                : (($created + $updated) > 0 ? NotificationLevel::Warning : NotificationLevel::Danger);

            $title = $failedCount === 0
                ? 'Impor '.$handler->itemLabel().' selesai'
                : 'Impor '.$handler->itemLabel().' selesai dengan catatan';

            $parts = [];
            $parts[] = "{$created} ditambahkan";
            $parts[] = "{$updated} diperbarui";

            if ($failedCount > 0) {
                $parts[] = "{$failedCount} gagal (unduh laporan error untuk melihat rincian)";
            }

            $notificationService->notifyUser($user, new GeneralAppNotification(
                notificationTitle: $title,
                notificationMessage: 'Hasil impor: '.implode(', ', $parts).'.',
                notificationCategory: $handler->notificationCategory(),
                notificationLevel: $level,
                notificationMeta: $meta,
            ));
        } finally {
            $this->cleanupDirectory($tempExtractDir);
            $this->cleanupUploadedFiles();
        }
    }

    public function failed(?Throwable $exception): void
    {
        $this->cleanupUploadedFiles();

        $user = User::query()->find($this->userId);

        if (! $user instanceof User) {
            return;
        }

        $category = NotificationCategory::System;
        $itemLabel = 'data';

        if (class_exists($this->handlerClass)) {
            $handler = app($this->handlerClass);

            if ($handler instanceof TabularImportHandlerInterface) {
                $category = $handler->notificationCategory();
                $itemLabel = $handler->itemLabel();
            }
        }

        app(NotificationServiceInterface::class)->notifyUser($user, new GeneralAppNotification(
            notificationTitle: 'Impor '.$itemLabel.' gagal diproses',
            notificationMessage: 'Terjadi kendala saat memproses file impor Anda. Pastikan format template sesuai lalu coba lagi.',
            notificationCategory: $category,
            notificationLevel: NotificationLevel::Danger,
        ));
    }

    private function extractSafeImagesFromZip(string $disk, string $path): array
    {
        $absoluteZip = Storage::disk($disk)->path($path);

        if (! file_exists($absoluteZip)) {
            return [null, []];
        }

        $zip = new ZipArchive;

        if ($zip->open($absoluteZip) !== true) {
            return [null, []];
        }

        $tempDir = sys_get_temp_dir().'/kossuma_zip_'.Str::uuid()->toString();
        mkdir($tempDir, 0755, true);
        $imageMap = [];

        try {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);

                if (! is_array($stat)) {
                    continue;
                }

                $entryName = (string) ($stat['name'] ?? '');

                if (
                    $entryName === '' ||
                    str_ends_with($entryName, '/') ||
                    str_contains($entryName, '..') ||
                    str_starts_with($entryName, '__MACOSX/')
                ) {
                    continue;
                }

                $baseName = basename($entryName);
                $extension = strtolower(pathinfo($baseName, PATHINFO_EXTENSION));

                if (! in_array($extension, self::ALLOWED_IMAGE_EXTENSIONS, true)) {
                    continue;
                }

                if ((int) ($stat['size'] ?? 0) > self::MAX_IMAGE_SIZE_BYTES) {
                    continue;
                }

                $binary = $zip->getFromIndex($i);

                if (! is_string($binary) || strlen($binary) === 0 || strlen($binary) > self::MAX_IMAGE_SIZE_BYTES) {
                    continue;
                }

                $imageInfo = @getimagesizefromstring($binary);

                if (! is_array($imageInfo)) {
                    continue;
                }

                $targetFile = $tempDir.'/'.Str::uuid()->toString().'.'.$extension;
                file_put_contents($targetFile, $binary);
                $imageMap[strtolower($baseName)] = [
                    'path' => $targetFile,
                    'extension' => $extension,
                    'original_name' => $baseName,
                ];
            }
        } finally {
            $zip->close();
        }

        return [$tempDir, $imageMap];
    }

    private function cleanupDirectory(?string $directory): void
    {
        if ($directory === null || ! is_dir($directory)) {
            return;
        }

        $files = glob($directory.'/*');

        if (is_array($files)) {
            foreach ($files as $file) {
                if (is_file($file)) {
                    @unlink($file);
                }
            }
        }

        @rmdir($directory);
    }

    private function cleanupUploadedFiles(): void
    {
        if ($this->filePath !== '' && Storage::disk($this->fileDisk)->exists($this->filePath)) {
            Storage::disk($this->fileDisk)->delete($this->filePath);
        }

        if (
            $this->archiveDisk !== null &&
            $this->archivePath !== null &&
            $this->archivePath !== '' &&
            Storage::disk($this->archiveDisk)->exists($this->archivePath)
        ) {
            Storage::disk($this->archiveDisk)->delete($this->archivePath);
        }
    }
}
