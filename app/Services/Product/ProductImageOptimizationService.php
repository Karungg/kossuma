<?php

namespace App\Services\Product;

use App\Models\Product\Product;
use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageOptimizationService
{
    private const int MAIN_MAX_DIMENSION = 1200;

    private const int THUMB_MAX_DIMENSION = 480;

    private const int MAIN_WEBP_QUALITY = 82;

    private const int THUMB_WEBP_QUALITY = 78;

    public function resolveDisk(?string $disk = null): string
    {
        if (is_string($disk) && trim($disk) !== '') {
            return trim($disk);
        }

        $configured = config('filesystems.product_image_disk', 'public');

        return is_string($configured) && trim($configured) !== '' ? trim($configured) : 'public';
    }

    public function storeUploadedImage(UploadedFile $file, ?string $disk = null): string
    {
        $realPath = $file->getRealPath();
        $extension = strtolower($file->getClientOriginalExtension() ?: ($file->extension() ?: 'jpg'));

        if (! is_string($realPath) || $realPath === '' || ! is_file($realPath)) {
            $resolvedDisk = $this->resolveDisk($disk);
            $storedRelativePath = Storage::disk($resolvedDisk)->putFile('products', $file);

            if (! is_string($storedRelativePath) || $storedRelativePath === '') {
                return '';
            }

            return $this->formatStoredPath($storedRelativePath, $resolvedDisk);
        }

        return $this->storeFromLocalPath($realPath, $extension, $disk);
    }

    public function storeFromLocalPath(string $absolutePath, string $fallbackExtension = 'jpg', ?string $disk = null): string
    {
        $resolvedDisk = $this->resolveDisk($disk);
        $binary = @file_get_contents($absolutePath);

        if (! is_string($binary) || $binary === '') {
            return '';
        }

        $uuid = Str::uuid()->toString();
        $sourceImage = $this->createSourceImage($binary, $absolutePath);

        if ($sourceImage instanceof GdImage && function_exists('imagewebp')) {
            $mainBytes = $this->encodeResizedWebp(
                $sourceImage,
                self::MAIN_MAX_DIMENSION,
                self::MAIN_WEBP_QUALITY,
            );

            $thumbBytes = $this->encodeResizedWebp(
                $sourceImage,
                self::THUMB_MAX_DIMENSION,
                self::THUMB_WEBP_QUALITY,
            );

            imagedestroy($sourceImage);

            if (is_string($mainBytes) && $mainBytes !== '') {
                $mainRelativePath = "products/{$uuid}.webp";
                Storage::disk($resolvedDisk)->put($mainRelativePath, $mainBytes);

                if (is_string($thumbBytes) && $thumbBytes !== '') {
                    $thumbRelativePath = Product::thumbnailRelativePath($mainRelativePath);
                    Storage::disk($resolvedDisk)->put($thumbRelativePath, $thumbBytes);
                }

                return $this->formatStoredPath($mainRelativePath, $resolvedDisk);
            }
        } elseif ($sourceImage instanceof GdImage) {
            imagedestroy($sourceImage);
        }

        $safeExtension = preg_replace('/[^a-z0-9]/', '', strtolower($fallbackExtension));
        $ext = is_string($safeExtension) && $safeExtension !== '' ? $safeExtension : 'jpg';
        $fallbackRelativePath = "products/{$uuid}.{$ext}";

        Storage::disk($resolvedDisk)->put($fallbackRelativePath, $binary);

        return $this->formatStoredPath($fallbackRelativePath, $resolvedDisk);
    }

    public function deleteImage(?string $imagePath, ?string $disk = null): void
    {
        if (! is_string($imagePath) || trim($imagePath) === '') {
            return;
        }

        $trimmed = str_replace('\\', '/', trim($imagePath));

        if (
            preg_match('/^(https?:)?\/\//i', $trimmed) === 1
            || str_starts_with(strtolower($trimmed), 'data:image/')
        ) {
            return;
        }

        $normalized = ltrim($trimmed, '/');

        if (str_starts_with($normalized, 'assets/')) {
            return;
        }

        $relativePath = str_starts_with($normalized, 'storage/')
            ? substr($normalized, strlen('storage/'))
            : $normalized;

        if ($relativePath === '') {
            return;
        }

        $resolvedDisk = $this->resolveDisk($disk);
        $storage = Storage::disk($resolvedDisk);

        if ($storage->exists($relativePath)) {
            $storage->delete($relativePath);
        }

        $thumbRelativePath = Product::thumbnailRelativePath($relativePath);

        if ($thumbRelativePath !== $relativePath && $storage->exists($thumbRelativePath)) {
            $storage->delete($thumbRelativePath);
        }
    }

    private function formatStoredPath(string $relativePath, string $disk): string
    {
        $normalized = ltrim($relativePath, '/');
        $driver = config("filesystems.disks.{$disk}.driver");

        if ($driver === 'local' && $disk === 'public') {
            return '/storage/'.$normalized;
        }

        return $normalized;
    }

    private function createSourceImage(string $binary, string $absolutePath): ?GdImage
    {
        if (! function_exists('imagecreatefromstring')) {
            return null;
        }

        $image = @imagecreatefromstring($binary);

        if (! $image instanceof GdImage) {
            return null;
        }

        if (! imageistruecolor($image) && function_exists('imagepalettetotruecolor')) {
            imagepalettetotruecolor($image);
        }

        imagealphablending($image, true);
        imagesavealpha($image, true);

        return $this->applyExifOrientation($image, $absolutePath);
    }

    private function applyExifOrientation(GdImage $image, string $absolutePath): GdImage
    {
        if (! function_exists('exif_read_data') || ! function_exists('imagerotate')) {
            return $image;
        }

        $exif = @exif_read_data($absolutePath);

        if (! is_array($exif) || ! isset($exif['Orientation'])) {
            return $image;
        }

        $orientation = (int) $exif['Orientation'];
        $angle = match ($orientation) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        $rotated = @imagerotate($image, $angle, 0);

        if (! $rotated instanceof GdImage) {
            return $image;
        }

        imagedestroy($image);
        imagealphablending($rotated, true);
        imagesavealpha($rotated, true);

        return $rotated;
    }

    private function encodeResizedWebp(GdImage $source, int $maxDimension, int $quality): ?string
    {
        $srcWidth = imagesx($source);
        $srcHeight = imagesy($source);

        if ($srcWidth <= 0 || $srcHeight <= 0) {
            return null;
        }

        $scale = min(1.0, $maxDimension / max($srcWidth, $srcHeight));
        $targetWidth = max(1, (int) round($srcWidth * $scale));
        $targetHeight = max(1, (int) round($srcHeight * $scale));

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);

        if (! $canvas instanceof GdImage) {
            return null;
        }

        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);

        $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);

        if (is_int($transparent)) {
            imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $transparent);
        }

        imagecopyresampled(
            $canvas,
            $source,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $srcWidth,
            $srcHeight,
        );

        ob_start();
        $encoded = @imagewebp($canvas, null, $quality);
        $bytes = ob_get_clean();
        imagedestroy($canvas);

        if (! $encoded || ! is_string($bytes) || $bytes === '') {
            return null;
        }

        return $bytes;
    }
}
