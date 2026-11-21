<?php

use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Store\Store;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('home renders active storefront products and categories from backend while excluding inactive products', function () {
    Storage::fake('public');

    $catFrozen = Category::factory()->create(['name' => 'Frozen Food', 'slug' => 'frozen-food']);
    $catKue = Category::factory()->create(['name' => 'Kue Basah', 'slug' => 'kue-basah']);
    $store = Store::factory()->create([
        'name' => 'Dapur Ummi Salma',
        'location' => 'Tanah Sareal, Kota Bogor',
    ]);

    $activeProduct = Product::factory()->create([
        'category_id' => $catFrozen->id,
        'store_id' => $store->id,
        'name' => 'Kaki Naga Ayam',
        'slug' => 'kaki-naga-ayam',
        'price' => 28000,
        'original_price' => 32000,
        'sold_count' => 1200,
        'is_active' => true,
    ]);

    $activeProduct->images()->create([
        'image_path' => '/assets/images/products/kaki-naga-ayam.jpg',
        'alt' => 'Kaki Naga Ayam',
        'label' => 'Kaki Naga Ayam',
        'is_primary' => true,
        'sort_order' => 0,
    ]);

    Product::factory()->inactive()->create([
        'category_id' => $catKue->id,
        'store_id' => $store->id,
        'name' => 'Produk Nonaktif',
        'slug' => 'produk-nonaktif',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home/index')
            ->where('hasAnyProducts', true)
            ->where('filters.category', 'all')
            ->where('filters.search', '')
            ->has('categories', 3)
            ->where('categories.0.id', 'all')
            ->where('categories.0.label', 'Semua')
            ->has('catalog.data', 1)
            ->where('catalog.total', 1)
            ->where('catalog.has_more', false)
            ->where('catalog.data.0.slug', 'kaki-naga-ayam')
            ->where('catalog.data.0.storeDistrict', 'Tanah Sareal')
            ->where('catalog.data.0.imageUrl', '/assets/images/products/kaki-naga-ayam.jpg')
            ->where('catalog.data.0.imageFullUrl', '/assets/images/products/kaki-naga-ayam.jpg'));
});

test('home supports category filtering, search across name description and store, and incremental pagination', function () {
    $catFrozen = Category::factory()->create(['name' => 'Frozen Food', 'slug' => 'frozen-food']);
    $catLauk = Category::factory()->create(['name' => 'Lauk Matang', 'slug' => 'lauk-matang']);
    $storeA = Store::factory()->create(['name' => 'Pawon Ibu Fatimah']);
    $storeB = Store::factory()->create(['name' => 'Warung Teh Rina']);

    Product::factory()->count(20)->create([
        'category_id' => $catFrozen->id,
        'store_id' => $storeA->id,
        'is_active' => true,
    ]);

    Product::factory()->create([
        'category_id' => $catLauk->id,
        'store_id' => $storeB->id,
        'name' => 'Rendang Sapi Minang',
        'description' => 'Rempah asli khas Padang dimasak santan murni.',
        'is_active' => true,
    ]);

    $this->get(route('home', ['category' => 'frozen-food']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.category', 'frozen-food')
            ->where('catalog.total', 20)
            ->where('catalog.current_page', 1)
            ->where('catalog.has_more', true)
            ->has('catalog.data', 18));

    $this->get(route('home', ['category' => 'frozen-food', 'page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('catalog.current_page', 2)
            ->where('catalog.has_more', false)
            ->has('catalog.data', 2));

    $this->get(route('home', ['search' => 'Teh Rina']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'Teh Rina')
            ->where('catalog.total', 1)
            ->where('catalog.data.0.title', 'Rendang Sapi Minang'));

    $this->get(route('home', ['search' => 'tidak-akan-ditemukan']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('hasAnyProducts', true)
            ->where('catalog.total', 0)
            ->has('catalog.data', 0));
});

test('home indicates empty catalog state when no active products exist', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home/index')
            ->where('hasAnyProducts', false)
            ->where('catalog.total', 0)
            ->has('catalog.data', 0));
});

test('product detail resolves full and thumbnail image urls across local, storage, and https sources', function () {
    Storage::fake('public');
    Storage::disk('public')->put('products/sample.webp', 'main-bytes');
    Storage::disk('public')->put('products/thumbs/sample.webp', 'thumb-bytes');

    $category = Category::factory()->create(['name' => 'Frozen Food', 'slug' => 'frozen-food']);
    $store = Store::factory()->create(['name' => 'Dapur Muslimah']);

    $product = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
        'slug' => 'risol-mayo-spesial',
        'is_active' => true,
    ]);

    $product->images()->createMany([
        [
            'image_path' => '/storage/products/sample.webp',
            'alt' => 'Foto Storage',
            'label' => 'Foto Storage',
            'is_primary' => true,
            'sort_order' => 0,
        ],
        [
            'image_path' => 'https://cdn.kossuma.id/products/risol-2.webp',
            'alt' => 'Foto CDN',
            'label' => 'Foto CDN',
            'is_primary' => false,
            'sort_order' => 1,
        ],
        [
            'image_path' => '/assets/images/products/lumpia-ayam.jpg',
            'alt' => 'Foto Lokal',
            'label' => 'Foto Lokal',
            'is_primary' => false,
            'sort_order' => 2,
        ],
    ]);

    $this->get(route('products.show', ['slug' => 'risol-mayo-spesial']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/show')
            ->has('product.images', 3)
            ->where('product.images.0.url', '/storage/products/sample.webp')
            ->where('product.images.0.thumbnailUrl', '/storage/products/thumbs/sample.webp')
            ->where('product.images.1.url', 'https://cdn.kossuma.id/products/risol-2.webp')
            ->where('product.images.1.thumbnailUrl', 'https://cdn.kossuma.id/products/risol-2.webp')
            ->where('product.images.2.url', '/assets/images/products/lumpia-ayam.jpg')
            ->where('product.images.2.thumbnailUrl', '/assets/images/products/lumpia-ayam.jpg'));
});
