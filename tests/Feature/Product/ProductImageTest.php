<?php

use App\Models\Product\Product;
use App\Services\Product\ProductImageOptimizationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

test('product resolveImageUrl handles empty, external https, protocol-relative, data uri, local assets, and storage paths', function () {
    Storage::fake('public');
    Config::set('app.asset_url', null);
    Config::set('filesystems.product_image_disk', 'public');

    expect(Product::resolveImageUrl(null))->toBeNull();
    expect(Product::resolveImageUrl(''))->toBeNull();
    expect(Product::resolveImageUrl('   '))->toBeNull();

    expect(Product::resolveImageUrl('https://cdn.kossuma.id/img/risol.webp'))
        ->toBe('https://cdn.kossuma.id/img/risol.webp');
    expect(Product::resolveImageUrl('http://cdn.kossuma.id/img/risol.jpg'))
        ->toBe('http://cdn.kossuma.id/img/risol.jpg');
    expect(Product::resolveImageUrl('//cdn.kossuma.id/img/risol.webp'))
        ->toBe('//cdn.kossuma.id/img/risol.webp');
    expect(Product::resolveImageUrl('data:image/png;base64,abc'))
        ->toBe('data:image/png;base64,abc');

    expect(Product::resolveImageUrl('/assets/images/products/kaki-naga-ayam.jpg'))
        ->toBe('/assets/images/products/kaki-naga-ayam.jpg');
    expect(Product::resolveImageUrl('assets/images/products/kaki-naga-ayam.jpg'))
        ->toBe('/assets/images/products/kaki-naga-ayam.jpg');

    Storage::disk('public')->put('products/photo-1.webp', 'main');
    Storage::disk('public')->put('products/thumbs/photo-1.webp', 'thumb');
    Storage::disk('public')->put('products/legacy.jpg', 'legacy');

    expect(Product::resolveImageUrl('/storage/products/photo-1.webp'))
        ->toBe('/storage/products/photo-1.webp');
    expect(Product::resolveImageUrl('products/photo-1.webp'))
        ->toBe('/storage/products/photo-1.webp');
    expect(Product::resolveImageUrl('/storage/products/photo-1.webp', thumbnail: true))
        ->toBe('/storage/products/thumbs/photo-1.webp');
    expect(Product::resolveImageUrl('/storage/products/legacy.jpg', thumbnail: true))
        ->toBe('/storage/products/legacy.jpg');

    Config::set('app.asset_url', 'https://static.kossuma.id/');
    expect(Product::resolveImageUrl('/assets/images/products/kaki-naga-ayam.jpg'))
        ->toBe('https://static.kossuma.id/assets/images/products/kaki-naga-ayam.jpg');
    expect(Product::resolveImageUrl('/storage/products/photo-1.webp'))
        ->toBe('https://static.kossuma.id/storage/products/photo-1.webp');
});

test('product primaryImage and helper methods resolve primary and gallery urls cleanly', function () {
    Storage::fake('public');
    Storage::disk('public')->put('products/a.webp', 'main');
    Storage::disk('public')->put('products/thumbs/a.webp', 'thumb');

    $product = Product::factory()->create();
    $product->images()->createMany([
        [
            'image_path' => '/assets/images/products/lumpia-ayam.jpg',
            'is_primary' => false,
            'sort_order' => 0,
        ],
        [
            'image_path' => '/storage/products/a.webp',
            'is_primary' => true,
            'sort_order' => 1,
        ],
    ]);

    $fresh = Product::query()->with(['primaryImage', 'images'])->findOrFail($product->id);

    expect($fresh->getPrimaryImageUrl())->toBe('/storage/products/a.webp');
    expect($fresh->getPrimaryImageUrl(thumbnail: true))->toBe('/storage/products/thumbs/a.webp');
    expect($fresh->getImageUrls())->toBe([
        '/assets/images/products/lumpia-ayam.jpg',
        '/storage/products/a.webp',
    ]);
});

test('image optimization service converts uploaded image to resized webp with thumbnail and deletes both cleanly', function () {
    Storage::fake('public');

    $service = app(ProductImageOptimizationService::class);
    $uploaded = UploadedFile::fake()->image('heavy-photo.png', 2000, 1500);

    $storedPath = $service->storeUploadedImage($uploaded);

    expect($storedPath)->toStartWith('/storage/products/')
        ->toEndWith('.webp');

    $relativePath = str_replace('/storage/', '', $storedPath);
    $thumbRelativePath = Product::thumbnailRelativePath($relativePath);

    Storage::disk('public')->assertExists($relativePath);
    Storage::disk('public')->assertExists($thumbRelativePath);

    $mainSize = getimagesizefromstring((string) Storage::disk('public')->get($relativePath));
    $thumbSize = getimagesizefromstring((string) Storage::disk('public')->get($thumbRelativePath));

    expect($mainSize)->toBeArray();
    expect($mainSize[0])->toBe(1200);
    expect($mainSize[1])->toBe(900);

    expect($thumbSize)->toBeArray();
    expect($thumbSize[0])->toBe(480);
    expect($thumbSize[1])->toBe(360);

    $service->deleteImage($storedPath);

    Storage::disk('public')->assertMissing($relativePath);
    Storage::disk('public')->assertMissing($thumbRelativePath);
});
