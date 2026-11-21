<?php

use App\Enums\Order\OrderStatus;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderStatusHistory;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\OrderSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('guest is redirected to login when accessing customer orders', function () {
    $this->get(route('customer.orders.index'))
        ->assertRedirect(route('login'));
});

test('customer sees only their own orders and can filter by status, date range, and search', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();

    $storeA = Store::factory()->create(['name' => 'Dapur Ummi Salma']);
    $storeB = Store::factory()->create(['name' => 'Kedai Berkah Bogor']);

    $productA = Product::factory()->create(['store_id' => $storeA->id, 'name' => 'Risol Mayo Keju']);
    $productB = Product::factory()->create(['store_id' => $storeB->id, 'name' => 'Ayam Ungkep Lengkuas']);

    $recentCompleted = Order::factory()->completed()->create([
        'user_id' => $customer->id,
        'store_id' => $storeA->id,
        'order_number' => 'KSM-20261120-1111',
        'created_at' => now()->subDays(5),
    ]);
    OrderItem::factory()->create([
        'order_id' => $recentCompleted->id,
        'product_id' => $productA->id,
        'product_name' => $productA->name,
        'product_slug' => $productA->slug,
    ]);

    $olderShipped = Order::factory()->shipped()->create([
        'user_id' => $customer->id,
        'store_id' => $storeB->id,
        'order_number' => 'KSM-20260901-2222',
        'created_at' => now()->subDays(60),
    ]);
    OrderItem::factory()->create([
        'order_id' => $olderShipped->id,
        'product_id' => $productB->id,
        'product_name' => $productB->name,
        'product_slug' => $productB->slug,
    ]);
    OrderStatusHistory::factory()->create([
        'order_id' => $olderShipped->id,
        'status' => OrderStatus::Shipped->value,
        'title' => 'Pesanan sedang diantar kurir',
    ]);

    Order::factory()->completed()->create([
        'user_id' => $otherCustomer->id,
        'order_number' => 'KSM-OTHER-9999',
    ]);

    $this->actingAs($customer);

    $this->get(route('customer.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/orders/index')
            ->where('orderSummary.active_count', 1)
            ->where('statusCounts.all', 2)
            ->where('statusCounts.completed', 1)
            ->where('statusCounts.shipped', 1)
            ->has('orders.data', 2)
            ->where('orders.data.0.orderNumber', 'KSM-20261120-1111'));

    $this->get(route('customer.orders.index', ['status' => 'shipped']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.orderNumber', 'KSM-20260901-2222')
            ->has('orders.data.0.histories', 1));

    $this->get(route('customer.orders.index', ['search' => 'Risol Mayo']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.orderNumber', 'KSM-20261120-1111'));

    $this->get(route('customer.orders.index', ['preset' => '30d']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.orderNumber', 'KSM-20261120-1111'));

    $this->get(route('customer.orders.index', [
        'preset' => 'custom',
        'date_from' => now()->subDays(70)->toDateString(),
        'date_to' => now()->subDays(50)->toDateString(),
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.orderNumber', 'KSM-20260901-2222'));
});

test('customer can buy again from past order and skips out-of-stock products', function () {
    $customer = User::factory()->create();
    $available = Product::factory()->create(['stock' => 5, 'is_active' => true, 'price' => 30000]);
    $outOfStock = Product::factory()->create(['stock' => 0, 'is_active' => true, 'price' => 25000]);

    $order = Order::factory()->completed()->create([
        'user_id' => $customer->id,
        'store_id' => $available->store_id,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $available->id,
        'product_name' => $available->name,
        'product_slug' => $available->slug,
        'quantity' => 2,
        'price' => $available->price,
        'subtotal' => $available->price * 2,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $outOfStock->id,
        'product_name' => $outOfStock->name,
        'product_slug' => $outOfStock->slug,
        'quantity' => 1,
        'price' => $outOfStock->price,
        'subtotal' => $outOfStock->price,
    ]);

    $this->actingAs($customer)
        ->post(route('customer.orders.buy-again', $order))
        ->assertRedirect(route('cart'));

    $cart = $customer->cart()->with('items')->firstOrFail();
    expect($cart->items)->toHaveCount(1);
    expect($cart->items->first()->product_id)->toBe($available->id);
    expect($cart->items->first()->quantity)->toBe(2);
});

test('customer can cancel pending payment order and cannot cancel processing order or another users order', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();

    $pendingOrder = Order::factory()->pendingPayment()->create(['user_id' => $customer->id]);
    $processingOrder = Order::factory()->create([
        'user_id' => $customer->id,
        'status' => OrderStatus::Processing,
    ]);
    $otherOrder = Order::factory()->pendingPayment()->create(['user_id' => $otherCustomer->id]);

    $this->actingAs($customer);

    $this->from(route('customer.orders.index'))
        ->post(route('customer.orders.cancel', $pendingOrder), [
            'reason' => 'Ingin mengganti metode pembayaran',
        ])
        ->assertRedirect(route('customer.orders.index'));

    $pendingOrder->refresh();
    expect($pendingOrder->status)->toBe(OrderStatus::Cancelled);
    expect($pendingOrder->cancellation_reason)->toBe('Ingin mengganti metode pembayaran');
    expect($pendingOrder->statusHistories()->where('status', OrderStatus::Cancelled->value)->exists())->toBeTrue();

    $this->from(route('customer.orders.index'))
        ->post(route('customer.orders.cancel', $processingOrder), [
            'reason' => 'Berubah pikiran',
        ])
        ->assertSessionHasErrors('order');

    $this->post(route('customer.orders.cancel', $otherOrder), [
        'reason' => 'Coba akses orang lain',
    ])->assertForbidden();
});

test('customer can confirm shipped order as received and submit verified review once per order item', function () {
    $customer = User::factory()->create();
    $product = Product::factory()->create([
        'rating_avg' => 0,
        'reviews_count' => 0,
    ]);

    $order = Order::factory()->shipped()->create([
        'user_id' => $customer->id,
        'store_id' => $product->store_id,
    ]);

    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_name' => $product->name,
        'product_slug' => $product->slug,
    ]);

    $this->actingAs($customer);

    $this->from(route('customer.orders.index'))
        ->post(route('customer.orders.reviews.store', $order), [
            'order_item_id' => $orderItem->id,
            'rating' => 5,
            'comment' => 'Belum selesai sudah coba ulas',
        ])
        ->assertSessionHasErrors('order_item_id');

    $this->from(route('customer.orders.index'))
        ->post(route('customer.orders.confirm-received', $order))
        ->assertRedirect(route('customer.orders.index'));

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Completed);
    expect($order->completed_at)->not->toBeNull();

    $this->from(route('customer.orders.index'))
        ->post(route('customer.orders.reviews.store', $order), [
            'order_item_id' => $orderItem->id,
            'rating' => 5,
            'comment' => 'Rasanya enak banget, pengiriman super cepat dan rapi!',
        ])
        ->assertRedirect(route('customer.orders.index'));

    $review = ProductReview::query()->where('order_item_id', $orderItem->id)->first();
    expect($review)->not->toBeNull();
    expect($review->rating)->toBe(5);
    expect($review->user_id)->toBe($customer->id);

    $product->refresh();
    expect($product->reviews_count)->toBe(1);
    expect($product->rating_avg)->toBe(5.0);

    $this->from(route('customer.orders.index'))
        ->post(route('customer.orders.reviews.store', $order), [
            'order_item_id' => $orderItem->id,
            'rating' => 4,
            'comment' => 'Mencoba mengulas dua kali untuk item yang sama',
        ])
        ->assertSessionHasErrors('order_item_id');
});

test('order seeder populates sample addresses and orders idempotently for demo customer', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(OrderSeeder::class);

    $customer = User::query()->where('email', 'customer@example.com')->firstOrFail();

    expect($customer->addresses()->count())->toBe(2);
    expect($customer->addresses()->where('is_primary', true)->count())->toBe(1);
    expect($customer->orders()->count())->toBe(5);

    $this->actingAs($customer)
        ->get(route('customer.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('statusCounts.all', 5)
            ->where('orderSummary.active_count', 3)
            ->has('orders.data', 5));
});
