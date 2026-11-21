<?php

use App\Jobs\Export\GenerateTabularExportJob;
use App\Jobs\Import\ProcessTabularImportJob;
use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Role;
use App\Models\Store\Store;
use App\Models\User;
use App\Services\Product\ProductImportHandler;
use App\Services\Product\ProductQueuedExportProvider;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;

function createProductAdmin(): User
{
    $role = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function createProductCustomer(): User
{
    $role = Role::firstOrCreate(['name' => 'Customer']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function createXlsxFileOnDisk(string $disk, string $path, array $headers, array $rows): void
{
    $tempBase = tempnam(sys_get_temp_dir(), 'test_products_');
    $xlsxPath = $tempBase.'.xlsx';
    @unlink($tempBase);

    $writer = new XlsxWriter;
    $writer->openToFile($xlsxPath);
    $writer->addRow(Row::fromValues($headers));

    foreach ($rows as $row) {
        $writer->addRow(Row::fromValues($row));
    }

    $writer->close();

    Storage::disk($disk)->put($path, (string) file_get_contents($xlsxPath));
    @unlink($xlsxPath);
}

function createImageZipOnDisk(string $disk, string $path, array $imageNames): void
{
    $tempZip = tempnam(sys_get_temp_dir(), 'test_zip_').'.zip';
    $zip = new ZipArchive;
    $zip->open($tempZip, ZipArchive::CREATE | ZipArchive::OVERWRITE);

    $tinyPng = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    );

    foreach ($imageNames as $name) {
        $zip->addFromString($name, (string) $tinyPng);
    }

    $zip->close();

    Storage::disk($disk)->put($path, (string) file_get_contents($tempZip));
    @unlink($tempZip);
}

test('guests are redirected to login for admin product routes', function () {
    $product = Product::factory()->create();

    $this->get(route('admin.products.index'))->assertRedirect(route('login'));
    $this->get(route('admin.products.create'))->assertRedirect(route('login'));
    $this->post(route('admin.products.store'), [])->assertRedirect(route('login'));
    $this->get(route('admin.products.edit', $product))->assertRedirect(route('login'));
    $this->put(route('admin.products.update', $product), [])->assertRedirect(route('login'));
    $this->delete(route('admin.products.destroy', $product))->assertRedirect(route('login'));
    $this->delete(route('admin.products.bulk-destroy'), ['ids' => [$product->id]])->assertRedirect(route('login'));
    $this->post(route('admin.products.export'), ['format' => 'csv'])->assertRedirect(route('login'));
    $this->get(route('admin.products.import-template'))->assertRedirect(route('login'));
    $this->post(route('admin.products.import'), [])->assertRedirect(route('login'));
});

test('customer users cannot access admin product routes', function () {
    $customer = createProductCustomer();
    $product = Product::factory()->create();

    $this->actingAs($customer);

    $this->get(route('admin.products.index'))->assertForbidden();
    $this->get(route('admin.products.create'))->assertForbidden();
    $this->post(route('admin.products.store'), [])->assertForbidden();
    $this->get(route('admin.products.edit', $product))->assertForbidden();
    $this->put(route('admin.products.update', $product), [])->assertForbidden();
    $this->delete(route('admin.products.destroy', $product))->assertForbidden();
    $this->delete(route('admin.products.bulk-destroy'), ['ids' => [$product->id]])->assertForbidden();
    $this->post(route('admin.products.export'), ['format' => 'csv'])->assertForbidden();
    $this->get(route('admin.products.import-template'))->assertForbidden();
    $this->post(route('admin.products.import'), [])->assertForbidden();
});

test('admin can view paginated products with stats, search, filters, and sorting', function () {
    $admin = createProductAdmin();
    $catFrozen = Category::factory()->create(['name' => 'Frozen Food', 'slug' => 'frozen-food']);
    $catKue = Category::factory()->create(['name' => 'Kue Basah', 'slug' => 'kue-basah']);
    $store = Store::factory()->create(['name' => 'Dapur Bogor']);

    Product::factory()->create([
        'category_id' => $catFrozen->id,
        'store_id' => $store->id,
        'name' => 'Risol Mayo Spesial',
        'price' => 35000,
        'stock' => 20,
        'is_active' => true,
        'is_preorder' => false,
    ]);

    Product::factory()->preorder(3)->inactive()->create([
        'category_id' => $catKue->id,
        'store_id' => $store->id,
        'name' => 'Kue Lapis Legit',
        'price' => 75000,
        'stock' => 0,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.products.index', [
            'search' => 'Risol',
            'category_id' => $catFrozen->id,
            'status' => 'active',
            'stock_status' => 'in_stock',
            'preorder_status' => 'regular',
            'sort' => 'price',
            'direction' => 'asc',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/index')
            ->where('stats.total', 2)
            ->where('stats.active', 1)
            ->where('stats.out_of_stock', 1)
            ->where('stats.preorder', 1)
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Risol Mayo Spesial'));
});

test('admin can create, update with image management, delete, and bulk delete products', function () {
    Storage::fake('public');

    $admin = createProductAdmin();
    $category = Category::factory()->create();
    $store = Store::factory()->create();

    $this->actingAs($admin);

    $this->get(route('admin.products.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/products/create'));

    $firstImage = UploadedFile::fake()->image('risol-1.jpg', 600, 600);
    $secondImage = UploadedFile::fake()->image('risol-2.png', 600, 600);

    $this->post(route('admin.products.store'), [
        'category_id' => $category->id,
        'store_id' => $store->id,
        'name' => 'Risol Mayo Premium',
        'slug' => '',
        'description' => 'Risol mayo gurih isi smoked beef halal.',
        'price' => 35000,
        'original_price' => 42000,
        'stock' => 30,
        'unit_label' => '1 Pack (Isi 10)',
        'weight_grams' => 350,
        'is_active' => 1,
        'is_preorder' => 0,
        'composition' => 'Tepung terigu, smoked beef, telur.',
        'cooking_instructions' => ['Diamkan di suhu ruang sebelum digoreng/dimasak.'],
        'specifications' => [
            ['title' => 'Daya Simpan', 'value' => '3 Bulan', 'description' => 'Simpan di freezer'],
        ],
        'images' => [$firstImage, $secondImage],
        'primary_image_key' => 'new:1',
    ])->assertRedirect(route('admin.products.index'));

    $product = Product::query()->where('name', 'Risol Mayo Premium')->with('images')->firstOrFail();

    expect($product->slug)->toBe('risol-mayo-premium');
    expect($product->images)->toHaveCount(2);
    expect($product->images[0]->is_primary)->toBeFalse();
    expect($product->images[1]->is_primary)->toBeTrue();

    $firstStoredRelative = str_replace('/storage/', '', $product->images[0]->image_path);
    $secondStoredRelative = str_replace('/storage/', '', $product->images[1]->image_path);
    Storage::disk('public')->assertExists($firstStoredRelative);
    Storage::disk('public')->assertExists($secondStoredRelative);

    $this->get(route('admin.products.edit', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/edit')
            ->where('product.id', $product->id)
            ->has('product.images', 2));

    $thirdImage = UploadedFile::fake()->image('risol-3.webp', 600, 600);

    $this->post(route('admin.products.update', $product), [
        '_method' => 'put',
        'category_id' => $category->id,
        'store_id' => $store->id,
        'name' => 'Risol Mayo Premium Update',
        'slug' => 'risol-mayo-premium',
        'description' => 'Deskripsi terbaru risol mayo.',
        'price' => 38000,
        'original_price' => 45000,
        'stock' => 15,
        'is_active' => 1,
        'is_preorder' => 1,
        'preorder_days' => 2,
        'existing_image_ids' => [$product->images[1]->id],
        'removed_image_ids' => [$product->images[0]->id],
        'images' => [$thirdImage],
        'primary_image_key' => 'new:0',
    ])->assertRedirect(route('admin.products.index'));

    $product->refresh()->load('images');
    expect($product->name)->toBe('Risol Mayo Premium Update');
    expect($product->is_preorder)->toBeTrue();
    expect($product->preorder_days)->toBe(2);
    expect($product->images)->toHaveCount(2);
    Storage::disk('public')->assertMissing($firstStoredRelative);
    Storage::disk('public')->assertExists($secondStoredRelative);

    $thirdStoredRelative = str_replace('/storage/', '', $product->images[1]->image_path);
    Storage::disk('public')->assertExists($thirdStoredRelative);
    expect($product->images[1]->is_primary)->toBeTrue();

    $extraProduct = Product::factory()->create(['category_id' => $category->id, 'store_id' => $store->id]);

    $this->delete(route('admin.products.destroy', $extraProduct))
        ->assertRedirect(route('admin.products.index'));
    $this->assertDatabaseMissing('products', ['id' => $extraProduct->id]);

    $this->delete(route('admin.products.bulk-destroy'), [
        'ids' => [$product->id],
    ])->assertRedirect(route('admin.products.index'));

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
    Storage::disk('public')->assertMissing($secondStoredRelative);
    Storage::disk('public')->assertMissing($thirdStoredRelative);
});

test('product validation rejects invalid price, original price, and missing preorder days', function () {
    $admin = createProductAdmin();
    $category = Category::factory()->create();
    $store = Store::factory()->create();

    $this->actingAs($admin)
        ->from(route('admin.products.create'))
        ->post(route('admin.products.store'), [
            'category_id' => $category->id,
            'store_id' => $store->id,
            'name' => '',
            'description' => '',
            'price' => 30000,
            'original_price' => 20000,
            'stock' => -1,
            'is_preorder' => 1,
            'preorder_days' => '',
        ])
        ->assertRedirect(route('admin.products.create'))
        ->assertSessionHasErrors(['name', 'description', 'original_price', 'stock', 'preorder_days']);
});

test('admin product export dispatches background job and generates csv, xlsx, and pdf', function () {
    Queue::fake();
    Storage::fake('local');

    $admin = createProductAdmin();
    $product = Product::factory()->create(['name' => 'Ayam Ungkep Lengkuas', 'price' => 55000]);

    $this->actingAs($admin)
        ->from(route('admin.products.index'))
        ->post(route('admin.products.export'), [
            'format' => 'xlsx',
            'ids' => [$product->id],
            'columns' => ['name', 'price', 'stock'],
        ])
        ->assertRedirect(route('admin.products.index'));

    Queue::assertPushed(GenerateTabularExportJob::class, function (GenerateTabularExportJob $job) use ($admin, $product): bool {
        return $job->userId === (string) $admin->id
            && $job->providerClass === ProductQueuedExportProvider::class
            && $job->format === 'xlsx'
            && $job->ids === [$product->id]
            && $job->columns === ['name', 'price', 'stock'];
    });

    $csvJob = new GenerateTabularExportJob(
        userId: (string) $admin->id,
        providerClass: ProductQueuedExportProvider::class,
        format: 'csv',
        ids: [$product->id],
        columns: ['name', 'price', 'stock'],
    );
    app()->call([$csvJob, 'handle']);

    $notification = $admin->notifications()->latest()->firstOrFail();
    $path = (string) ($notification->data['meta']['export_path'] ?? '');
    Storage::disk('local')->assertExists($path);

    $csvContent = (string) Storage::disk('local')->get($path);
    expect($csvContent)->toContain('Nama Produk')
        ->toContain('Ayam Ungkep Lengkuas')
        ->toContain('Rp55.000');
});

test('admin can download product import template and run background import with zip images and error report', function () {
    Queue::fake();
    Storage::fake('local');
    Storage::fake('public');

    $admin = createProductAdmin();
    $category = Category::factory()->create(['name' => 'Frozen Food', 'slug' => 'frozen-food']);
    $store = Store::factory()->create(['name' => 'Dapur Muslimah', 'slug' => 'dapur-muslimah']);
    $existing = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
        'name' => 'Produk Lama',
        'slug' => 'produk-lama',
        'price' => 20000,
    ]);

    $this->actingAs($admin);

    $templateResponse = $this->get(route('admin.products.import-template'))
        ->assertOk();
    expect($templateResponse->headers->get('content-disposition'))->toContain('.xlsx');
    expect(substr($templateResponse->streamedContent(), 0, 2))->toBe('PK');

    createXlsxFileOnDisk('local', 'imports/test-upload.xlsx', [
        'name', 'slug', 'category_slug', 'store_slug', 'price', 'original_price',
        'stock', 'unit_label', 'weight_grams', 'is_preorder', 'preorder_days',
        'is_active', 'description', 'composition', 'cooking_instructions', 'image_files',
    ], [
        [
            'Dimsum Ayam Halal',
            'dimsum-ayam-halal',
            'frozen-food',
            'dapur-muslimah',
            32000,
            38000,
            40,
            '1 Pack (Isi 12)',
            300,
            'tidak',
            '',
            'ya',
            'Dimsum ayam segar lembut.',
            'Daging ayam, tepung tapioka.',
            'Kukus 10 menit.|Sajikan hangat dengan saus.',
            'dimsum-1.png',
        ],
        [
            'Produk Lama Diperbarui',
            'produk-lama',
            'frozen-food',
            'dapur-muslimah',
            25000,
            '',
            10,
            '1 Pack',
            200,
            'ya',
            2,
            'ya',
            'Deskripsi baru untuk produk lama.',
            '',
            '',
            '',
        ],
        [
            'Produk Gagal Kategori',
            'produk-gagal',
            'kategori-tidak-ada',
            'dapur-muslimah',
            15000,
            '',
            5,
            '',
            '',
            'tidak',
            '',
            'ya',
            'Seharusnya gagal validasi kategori.',
            '',
            '',
            '',
        ],
    ]);

    createImageZipOnDisk('local', 'imports/test-photos.zip', ['dimsum-1.png']);

    $uploadedXlsx = new UploadedFile(
        Storage::disk('local')->path('imports/test-upload.xlsx'),
        'produk.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true,
    );

    $this->from(route('admin.products.index'))
        ->post(route('admin.products.import'), [
            'file' => $uploadedXlsx,
        ])
        ->assertRedirect(route('admin.products.index'));

    Queue::assertPushed(ProcessTabularImportJob::class, function (ProcessTabularImportJob $job) use ($admin): bool {
        return $job->userId === (string) $admin->id
            && $job->handlerClass === ProductImportHandler::class;
    });

    $importJob = new ProcessTabularImportJob(
        userId: (string) $admin->id,
        handlerClass: ProductImportHandler::class,
        fileDisk: 'local',
        filePath: 'imports/test-upload.xlsx',
        archiveDisk: 'local',
        archivePath: 'imports/test-photos.zip',
    );

    app()->call([$importJob, 'handle']);

    $createdProduct = Product::query()->where('slug', 'dimsum-ayam-halal')->with('images')->firstOrFail();
    expect($createdProduct->name)->toBe('Dimsum Ayam Halal');
    expect($createdProduct->price)->toBe(32000);
    expect($createdProduct->images)->toHaveCount(1);
    expect($createdProduct->images[0]->is_primary)->toBeTrue();
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $createdProduct->images[0]->image_path));

    $existing->refresh();
    expect($existing->name)->toBe('Produk Lama Diperbarui');
    expect($existing->price)->toBe(25000);
    expect($existing->is_preorder)->toBeTrue();
    expect($existing->preorder_days)->toBe(2);

    $this->assertDatabaseMissing('products', ['slug' => 'produk-gagal']);

    Storage::disk('local')->assertMissing('imports/test-upload.xlsx');
    Storage::disk('local')->assertMissing('imports/test-photos.zip');

    $notification = $admin->notifications()->latest()->firstOrFail();
    expect($notification->data['message'])->toContain('1 ditambahkan')
        ->toContain('1 diperbarui')
        ->toContain('1 gagal');

    $errorReportPath = (string) ($notification->data['meta']['export_path'] ?? '');
    Storage::disk('local')->assertExists($errorReportPath);
    expect(substr((string) Storage::disk('local')->get($errorReportPath), 0, 2))->toBe('PK');

    $this->get(route('notifications.download', $notification->id))
        ->assertOk();
});
