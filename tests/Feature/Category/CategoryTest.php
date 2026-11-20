<?php

use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Role;
use App\Models\Store\Store;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createCategoryAdmin(): User
{
    $role = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function createCategoryCustomer(): User
{
    $role = Role::firstOrCreate(['name' => 'Customer']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('guests are redirected to login for category management routes', function () {
    $category = Category::factory()->create();

    $this->get(route('admin.categories.index'))->assertRedirect(route('login'));
    $this->get(route('admin.categories.export', ['format' => 'csv']))->assertRedirect(route('login'));
    $this->delete(route('admin.categories.bulk-destroy'), ['ids' => [$category->id]])->assertRedirect(route('login'));
    $this->get(route('admin.categories.create'))->assertRedirect(route('login'));
    $this->post(route('admin.categories.store'), [])->assertRedirect(route('login'));
    $this->get(route('admin.categories.edit', $category))->assertRedirect(route('login'));
    $this->put(route('admin.categories.update', $category), [])->assertRedirect(route('login'));
    $this->delete(route('admin.categories.destroy', $category))->assertRedirect(route('login'));
});

test('customer users cannot access category management routes', function () {
    $customer = createCategoryCustomer();
    $category = Category::factory()->create();

    $this->actingAs($customer);

    $this->get(route('admin.categories.index'))->assertForbidden();
    $this->get(route('admin.categories.export', ['format' => 'csv']))->assertForbidden();
    $this->delete(route('admin.categories.bulk-destroy'), ['ids' => [$category->id]])->assertForbidden();
    $this->get(route('admin.categories.create'))->assertForbidden();
    $this->post(route('admin.categories.store'), ['name' => 'Baru'])->assertForbidden();
    $this->get(route('admin.categories.edit', $category))->assertForbidden();
    $this->put(route('admin.categories.update', $category), ['name' => 'Ubah'])->assertForbidden();
    $this->delete(route('admin.categories.destroy', $category))->assertForbidden();
});

test('admin can view paginated categories with total stat and search filter', function () {
    $admin = createCategoryAdmin();

    Category::factory()->create([
        'name' => 'Frozen Food',
        'slug' => 'frozen-food',
    ]);
    Category::factory()->create([
        'name' => 'Kue Tradisional',
        'slug' => 'kue-tradisional',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.categories.index', ['search' => 'Frozen']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories/index')
            ->where('stats.total', 2)
            ->where('filters.search', 'Frozen')
            ->has('categories.data', 1)
            ->where('categories.data.0.name', 'Frozen Food'));
});

test('admin can open create page and store a category with automatic or custom slug', function () {
    $admin = createCategoryAdmin();
    $this->actingAs($admin);

    $this->get(route('admin.categories.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/categories/create'));

    $this->post(route('admin.categories.store'), [
        'name' => 'Minuman Herbal',
        'slug' => '',
        'description' => 'Aneka jamu dan minuman tradisional.',
    ])->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Minuman Herbal',
        'slug' => 'minuman-herbal',
    ]);

    $this->post(route('admin.categories.store'), [
        'name' => 'Minuman Herbal',
        'slug' => null,
        'description' => null,
    ])->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Minuman Herbal',
        'slug' => 'minuman-herbal-2',
    ]);
});

test('category validation rejects missing name, invalid slug format, and duplicate slug', function () {
    $admin = createCategoryAdmin();
    Category::factory()->create(['slug' => 'frozen-food']);

    $this->actingAs($admin)
        ->from(route('admin.categories.create'))
        ->post(route('admin.categories.store'), [
            'name' => '',
            'slug' => 'Invalid Slug!',
        ])
        ->assertRedirect(route('admin.categories.create'))
        ->assertSessionHasErrors(['name', 'slug']);

    $this->actingAs($admin)
        ->from(route('admin.categories.create'))
        ->post(route('admin.categories.store'), [
            'name' => 'Frozen Food Baru',
            'slug' => 'frozen-food',
        ])
        ->assertRedirect(route('admin.categories.create'))
        ->assertSessionHasErrors(['slug']);
});

test('admin can open edit page and update a category including keeping its own slug', function () {
    $admin = createCategoryAdmin();
    $category = Category::factory()->create([
        'name' => 'Sambal Rumahan',
        'slug' => 'sambal-rumahan',
        'description' => 'Deskripsi lama',
    ]);

    $this->actingAs($admin);

    $this->get(route('admin.categories.edit', $category))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories/edit')
            ->where('category.id', $category->id)
            ->where('category.name', 'Sambal Rumahan'));

    $this->put(route('admin.categories.update', $category), [
        'name' => 'Sambal & Bumbu',
        'slug' => 'sambal-rumahan',
        'description' => 'Deskripsi baru',
    ])->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Sambal & Bumbu',
        'slug' => 'sambal-rumahan',
        'description' => 'Deskripsi baru',
    ]);
});

test('admin can delete an empty category', function () {
    $admin = createCategoryAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseMissing('categories', [
        'id' => $category->id,
    ]);
});

test('admin cannot delete a category that still has products', function () {
    $admin = createCategoryAdmin();
    $category = Category::factory()->create();
    $store = Store::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
    ]);
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
    ]);
});

test('admin can filter and sort categories by product status, description status, and columns including timestamps', function () {
    $admin = createCategoryAdmin();
    $store = Store::factory()->create();

    $withProduct = Category::factory()->create([
        'name' => 'Beta Kategori',
        'slug' => 'beta-kategori',
        'description' => 'Memiliki deskripsi lengkap',
        'updated_at' => now()->subDays(2),
    ]);
    Product::factory()->create([
        'category_id' => $withProduct->id,
        'store_id' => $store->id,
    ]);

    Category::factory()->create([
        'name' => 'Alpha Kategori',
        'slug' => 'alpha-kategori',
        'description' => null,
        'updated_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.categories.index', ['product_status' => 'with_products']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.slug', 'beta-kategori'));

    $this->actingAs($admin)
        ->get(route('admin.categories.index', ['product_status' => 'without_products']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.slug', 'alpha-kategori'));

    $this->actingAs($admin)
        ->get(route('admin.categories.index', ['description_status' => 'filled']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.slug', 'beta-kategori'));

    $this->actingAs($admin)
        ->get(route('admin.categories.index', ['description_status' => 'empty']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.slug', 'alpha-kategori'));

    $this->actingAs($admin)
        ->get(route('admin.categories.index', [
            'sort' => 'updated_at',
            'direction' => 'desc',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories.per_page', 10)
            ->where('categories.data.0.slug', 'alpha-kategori')
            ->where('categories.data.1.slug', 'beta-kategori'));
});

test('admin can bulk delete empty categories while skipping categories that still have products', function () {
    $admin = createCategoryAdmin();
    $store = Store::factory()->create();

    $emptyOne = Category::factory()->create();
    $emptyTwo = Category::factory()->create();
    $withProduct = Category::factory()->create();

    Product::factory()->create([
        'category_id' => $withProduct->id,
        'store_id' => $store->id,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.categories.bulk-destroy'), [
            'ids' => [$emptyOne->id, $emptyTwo->id, $withProduct->id],
        ])
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseMissing('categories', ['id' => $emptyOne->id]);
    $this->assertDatabaseMissing('categories', ['id' => $emptyTwo->id]);
    $this->assertDatabaseHas('categories', ['id' => $withProduct->id]);
});

test('bulk delete validation rejects empty or nonexistent category ids', function () {
    $admin = createCategoryAdmin();

    $this->actingAs($admin)
        ->from(route('admin.categories.index'))
        ->delete(route('admin.categories.bulk-destroy'), ['ids' => []])
        ->assertRedirect(route('admin.categories.index'))
        ->assertSessionHasErrors(['ids']);

    $this->actingAs($admin)
        ->from(route('admin.categories.index'))
        ->delete(route('admin.categories.bulk-destroy'), ['ids' => [999999]])
        ->assertRedirect(route('admin.categories.index'))
        ->assertSessionHasErrors(['ids.0']);
});

test('admin can export selected or filtered categories to csv, xlsx, and pdf', function () {
    $admin = createCategoryAdmin();

    $first = Category::factory()->create([
        'name' => 'Frozen Food',
        'slug' => 'frozen-food',
        'description' => 'Produk beku siap masak',
    ]);
    Category::factory()->create([
        'name' => 'Kue Basah',
        'slug' => 'kue-basah',
        'description' => 'Aneka kue tradisional',
    ]);

    $csvResponse = $this->actingAs($admin)
        ->get(route('admin.categories.export', [
            'format' => 'csv',
            'ids' => [$first->id],
        ]))
        ->assertOk();

    $csvContent = $csvResponse->streamedContent();
    expect($csvContent)->toContain('Nama Kategori')
        ->toContain('Frozen Food')
        ->not->toContain('Dibuat')
        ->not->toContain('Diperbarui')
        ->not->toContain('Kue Basah');

    $customColumnsCsvResponse = $this->actingAs($admin)
        ->get(route('admin.categories.export', [
            'format' => 'csv',
            'columns' => ['name', 'created_at', 'updated_at'],
        ]))
        ->assertOk();

    $customCsvContent = $customColumnsCsvResponse->streamedContent();
    expect($customCsvContent)->toContain('Nama Kategori')
        ->toContain('Dibuat')
        ->toContain('Diperbarui')
        ->not->toContain('Slug')
        ->not->toContain('Deskripsi');

    $xlsxResponse = $this->actingAs($admin)
        ->get(route('admin.categories.export', [
            'format' => 'xlsx',
            'search' => 'Frozen',
            'columns' => ['name', 'products_count', 'created_at'],
        ]))
        ->assertOk();

    expect($xlsxResponse->headers->get('content-disposition'))->toContain('.xlsx');
    expect(substr($xlsxResponse->streamedContent(), 0, 2))->toBe('PK');

    $pdfResponse = $this->actingAs($admin)
        ->get(route('admin.categories.export', [
            'format' => 'pdf',
            'columns' => ['name', 'slug', 'updated_at'],
        ]))
        ->assertOk();

    expect($pdfResponse->headers->get('content-type'))->toContain('application/pdf');
    expect(substr((string) $pdfResponse->getContent(), 0, 5))->toBe('%PDF-');
});

test('export validation rejects unsupported export formats and invalid columns', function () {
    $admin = createCategoryAdmin();

    $this->actingAs($admin)
        ->from(route('admin.categories.index'))
        ->get(route('admin.categories.export', ['format' => 'docx']))
        ->assertRedirect(route('admin.categories.index'))
        ->assertSessionHasErrors(['format']);

    $this->actingAs($admin)
        ->from(route('admin.categories.index'))
        ->get(route('admin.categories.export', [
            'format' => 'csv',
            'columns' => ['nonexistent_column'],
        ]))
        ->assertRedirect(route('admin.categories.index'))
        ->assertSessionHasErrors(['columns.0']);
});
