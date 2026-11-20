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
