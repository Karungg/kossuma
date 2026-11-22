<?php

use App\Jobs\Export\GenerateTabularExportJob;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Role;
use App\Models\Store\Store;
use App\Models\User;
use App\Services\Review\ReviewQueuedExportProvider;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

function createReviewAdmin(): User
{
    $role = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function createReviewCustomer(): User
{
    $role = Role::firstOrCreate(['name' => 'Customer']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('guests are redirected and customers are forbidden from admin review routes', function () {
    $customer = createReviewCustomer();
    $product = Product::factory()->create();
    $review = ProductReview::query()->create([
        'product_id' => $product->id,
        'user_id' => $customer->id,
        'author_name' => $customer->name,
        'rating' => 5,
        'comment' => 'Produk sangat enak dan higienis.',
    ]);

    $this->get(route('admin.reviews.index'))->assertRedirect(route('login'));
    $this->post(route('admin.reviews.hide', $review), ['reason' => 'Spam'])->assertRedirect(route('login'));
    $this->post(route('admin.reviews.restore', $review))->assertRedirect(route('login'));
    $this->post(route('admin.reviews.reply', $review), ['reply' => 'Terima kasih'])->assertRedirect(route('login'));
    $this->post(route('admin.reviews.export'), ['format' => 'csv'])->assertRedirect(route('login'));

    $this->actingAs($customer)->get(route('admin.reviews.index'))->assertForbidden();
    $this->actingAs($customer)->post(route('admin.reviews.hide', $review), ['reason' => 'Mengandung spam'])->assertForbidden();
    $this->actingAs($customer)->post(route('admin.reviews.reply', $review), ['reply' => 'Halo'])->assertForbidden();
});

test('admin can list and filter product reviews by product, store, rating, visibility, and reply status', function () {
    $admin = createReviewAdmin();
    $customer = createReviewCustomer();
    $storeA = Store::factory()->create(['name' => 'Dapur Asri']);
    $storeB = Store::factory()->create(['name' => 'Kue Makmur']);
    $productA = Product::factory()->for($storeA)->create(['name' => 'Sosis Solo Frozen']);
    $productB = Product::factory()->for($storeB)->create(['name' => 'Brownies Panggang']);

    $order = Order::factory()->for($customer)->for($storeA)->create([
        'order_number' => 'KSM-20261122-0777',
    ]);
    $orderItem = OrderItem::factory()->for($order)->for($productA)->create();

    ProductReview::query()->create([
        'product_id' => $productA->id,
        'user_id' => $customer->id,
        'order_item_id' => $orderItem->id,
        'author_name' => 'Ibu Rina',
        'rating' => 2,
        'comment' => 'Pengiriman agak terlambat sore hari.',
        'is_hidden' => false,
    ]);

    ProductReview::query()->create([
        'product_id' => $productB->id,
        'user_id' => $customer->id,
        'author_name' => 'Bapak Budi',
        'rating' => 5,
        'comment' => 'Brownies lembut sekali!',
        'is_hidden' => true,
        'hidden_reason' => 'Spam iklan',
        'admin_reply' => 'Terima kasih atas ulasannya.',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reviews/index')
            ->has('reviews.data', 2)
            ->where('stats.total', 2)
            ->where('stats.low_rating', 1)
            ->where('stats.hidden', 1));

    $this->actingAs($admin)
        ->get(route('admin.reviews.index', [
            'product_id' => $productA->id,
            'store_id' => $storeA->id,
            'rating' => 'low',
            'visibility' => 'visible',
            'reply_status' => 'unreplied',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('reviews.data', 1)
            ->where('reviews.data.0.order_number', 'KSM-20261122-0777'));
});

test('hiding and restoring a review requires reason, updates product rating, and controls storefront visibility', function () {
    $admin = createReviewAdmin();
    $customer = createReviewCustomer();
    $product = Product::factory()->create([
        'is_active' => true,
        'rating_avg' => 3.0,
        'reviews_count' => 2,
    ]);

    $goodReview = ProductReview::query()->create([
        'product_id' => $product->id,
        'user_id' => $customer->id,
        'author_name' => 'Siti Aminah',
        'rating' => 5,
        'comment' => 'Rasa sangat enak dan pas.',
    ]);

    $abusiveReview = ProductReview::query()->create([
        'product_id' => $product->id,
        'user_id' => $customer->id,
        'author_name' => 'Akun Spam',
        'rating' => 1,
        'comment' => 'Promosi judi online dan kata kasar.',
    ]);

    // Validation requires moderation reason
    $this->actingAs($admin)
        ->post(route('admin.reviews.hide', $abusiveReview), ['reason' => ''])
        ->assertSessionHasErrors('reason');

    // Hide abusive review
    $this->actingAs($admin)
        ->post(route('admin.reviews.hide', $abusiveReview), [
            'reason' => 'Spam atau promosi tautan di luar topik produk',
        ])
        ->assertRedirect();

    $abusiveReview->refresh();
    $product->refresh();

    expect($abusiveReview->is_hidden)->toBeTrue()
        ->and($abusiveReview->hidden_reason)->toBe('Spam atau promosi tautan di luar topik produk')
        ->and($abusiveReview->moderated_by)->toBe($admin->id)
        ->and($product->reviews_count)->toBe(1)
        ->and((float) $product->rating_avg)->toBe(5.0);

    // Storefront only shows visible review
    $this->get(route('products.show', ['slug' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/show')
            ->has('product.reviews', 1)
            ->where('product.reviews.0.id', (string) $goodReview->id));

    // Restore review recalculates rating back to 3.0 and shows both on storefront
    $this->actingAs($admin)
        ->post(route('admin.reviews.restore', $abusiveReview))
        ->assertRedirect();

    $abusiveReview->refresh();
    $product->refresh();

    expect($abusiveReview->is_hidden)->toBeFalse()
        ->and($abusiveReview->hidden_reason)->toBeNull()
        ->and($product->reviews_count)->toBe(2)
        ->and((float) $product->rating_avg)->toBe(3.0);

    $this->get(route('products.show', ['slug' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('product.reviews', 2));
});

test('admin can post official reply that appears on storefront product detail', function () {
    $admin = createReviewAdmin();
    $customer = createReviewCustomer();
    $product = Product::factory()->create(['is_active' => true]);

    $review = ProductReview::query()->create([
        'product_id' => $product->id,
        'user_id' => $customer->id,
        'author_name' => 'Dewi Lestari',
        'rating' => 3,
        'comment' => 'Rasa enak, tetapi kemasan sedikit penyok saat tiba.',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.reviews.reply', $review), [
            'reply' => 'Mohon maaf atas ketidaknyamanannya. Kami telah mengevaluasi kemasan dengan mitra UMKM.',
        ])
        ->assertRedirect();

    $review->refresh();
    expect($review->admin_reply)->toBe('Mohon maaf atas ketidaknyamanannya. Kami telah mengevaluasi kemasan dengan mitra UMKM.')
        ->and($review->admin_replied_by)->toBe($admin->id);

    $this->get(route('products.show', ['slug' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('product.reviews.0.adminReply', 'Mohon maaf atas ketidaknyamanannya. Kami telah mengevaluasi kemasan dengan mitra UMKM.'));
});

test('admin can queue review export job', function () {
    Queue::fake();
    $admin = createReviewAdmin();

    $this->actingAs($admin)
        ->post(route('admin.reviews.export'), [
            'format' => 'csv',
            'rating' => 'low',
        ])
        ->assertRedirect();

    Queue::assertPushed(GenerateTabularExportJob::class, function (GenerateTabularExportJob $job): bool {
        return $job->providerClass === ReviewQueuedExportProvider::class
            && $job->format === 'csv';
    });
});
