<?php

use App\Enums\Order\OrderStatus;
use App\Jobs\Export\GenerateTabularExportJob;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Role;
use App\Models\Store\Store;
use App\Models\User;
use App\Services\Order\OrderQueuedExportProvider;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

function createOrderAdmin(): User
{
    $role = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function createOrderCustomer(): User
{
    $role = Role::firstOrCreate(['name' => 'Customer']);
    $user = User::factory()->create(['phone' => '081234567890']);
    $user->assignRole($role);

    return $user;
}

test('guests are redirected and customers are forbidden from admin order routes', function () {
    $customer = createOrderCustomer();
    $order = Order::factory()->for($customer)->create();

    $this->get(route('admin.orders.index'))->assertRedirect(route('login'));
    $this->get(route('admin.orders.show', $order))->assertRedirect(route('login'));
    $this->get(route('admin.orders.invoice', $order))->assertRedirect(route('login'));
    $this->post(route('admin.orders.confirm-payment', $order))->assertRedirect(route('login'));
    $this->post(route('admin.orders.ship', $order))->assertRedirect(route('login'));
    $this->post(route('admin.orders.tracking', $order))->assertRedirect(route('login'));
    $this->post(route('admin.orders.complete', $order))->assertRedirect(route('login'));
    $this->post(route('admin.orders.cancel', $order))->assertRedirect(route('login'));
    $this->post(route('admin.orders.internal-notes.store', $order))->assertRedirect(route('login'));
    $this->post(route('admin.orders.export'), ['format' => 'csv'])->assertRedirect(route('login'));

    $this->actingAs($customer)->get(route('admin.orders.index'))->assertForbidden();
    $this->actingAs($customer)->get(route('admin.orders.show', $order))->assertForbidden();
    $this->actingAs($customer)->post(route('admin.orders.confirm-payment', $order))->assertForbidden();
    $this->actingAs($customer)->post(route('admin.orders.cancel', $order), ['reason' => 'Test alasan'])->assertForbidden();
});

test('admin can list and filter transactions by status, product, store, payment, courier, and review status', function () {
    $admin = createOrderAdmin();
    $customer = createOrderCustomer();
    $storeA = Store::factory()->create(['name' => 'Dapur Rendang A']);
    $storeB = Store::factory()->create(['name' => 'Warung Kue B']);
    $productA = Product::factory()->for($storeA)->create(['name' => 'Rendang Sapi Khas']);
    $productB = Product::factory()->for($storeB)->create(['name' => 'Kue Nastar Premium']);

    $orderCompleted = Order::factory()->for($customer)->for($storeA)->create([
        'order_number' => 'KSM-20261122-0001',
        'status' => OrderStatus::Completed,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'shipping_courier' => 'Paxel',
        'total_amount' => 120000,
    ]);
    $itemCompleted = OrderItem::factory()->for($orderCompleted)->for($productA)->create([
        'product_name' => $productA->name,
        'product_slug' => $productA->slug,
    ]);
    ProductReview::query()->create([
        'product_id' => $productA->id,
        'user_id' => $customer->id,
        'order_item_id' => $itemCompleted->id,
        'author_name' => $customer->name,
        'author_location' => 'Bogor Tengah',
        'rating' => 5,
        'comment' => 'Rendang empuk dan bumbunya meresap.',
    ]);

    $orderPending = Order::factory()->for($customer)->for($storeB)->create([
        'order_number' => 'KSM-20261122-0002',
        'status' => OrderStatus::PendingPayment,
        'payment_method' => 'bank_transfer',
        'payment_status' => 'unpaid',
        'shipping_courier' => 'Kurir Koperasi Kossuma',
        'total_amount' => 85000,
    ]);
    OrderItem::factory()->for($orderPending)->for($productB)->create([
        'product_name' => $productB->name,
        'product_slug' => $productB->slug,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index')
            ->has('orders.data', 2)
            ->where('stats.total', 2)
            ->where('stats.completed_revenue', 120000)
            ->where('statusCounts.completed', 1)
            ->where('statusCounts.pending_payment', 1));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', [
            'status' => OrderStatus::Completed->value,
            'product_id' => $productA->id,
            'store_id' => $storeA->id,
            'payment_status' => 'paid',
            'payment_method' => 'qris',
            'shipping_courier' => 'Paxel',
            'review_status' => 'reviewed',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.order_number', 'KSM-20261122-0001'));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['search' => 'Nastar']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.order_number', 'KSM-20261122-0002'));
});

test('admin can view order detail with three-party follow-up links and download pdf invoice', function () {
    $admin = createOrderAdmin();
    $customer = createOrderCustomer();
    $store = Store::factory()->create([
        'name' => 'Dapur Ibu Salma',
        'whatsapp_number' => '081299887766',
    ]);
    $product = Product::factory()->for($store)->create(['name' => 'Pempek Kapal Selam']);

    $order = Order::factory()->for($customer)->for($store)->create([
        'order_number' => 'KSM-20261122-0099',
        'status' => OrderStatus::Shipped,
        'shipping_courier' => 'Paxel',
        'tracking_number' => 'PXL-998877',
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'product_name' => $product->name,
        'product_slug' => $product->slug,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/show')
            ->where('order.orderNumber', 'KSM-20261122-0099')
            ->where('order.followUp.store.name', 'Dapur Ibu Salma')
            ->where('order.followUp.courier.trackingNumber', 'PXL-998877')
            ->where('order.followUp.courier.trackingUrl', 'https://paxel.co/id/lacak-pengiriman?awb=PXL-998877'));

    $invoiceResponse = $this->actingAs($admin)
        ->get(route('admin.orders.invoice', $order));

    $invoiceResponse->assertOk();
    expect($invoiceResponse->headers->get('content-type'))->toContain('application/pdf');
});

test('admin can progress an order through payment confirmation, shipping, tracking, completion, and internal notes', function () {
    $admin = createOrderAdmin();
    $customer = createOrderCustomer();
    $order = Order::factory()->for($customer)->create([
        'status' => OrderStatus::PendingPayment,
        'payment_status' => 'unpaid',
        'paid_at' => null,
        'shipped_at' => null,
        'completed_at' => null,
    ]);

    // 1. Confirm payment
    $this->actingAs($admin)
        ->post(route('admin.orders.confirm-payment', $order), [
            'note' => 'Mutasi BSI terverifikasi.',
        ])
        ->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Processing)
        ->and($order->payment_status)->toBe('paid')
        ->and($order->paid_at)->not->toBeNull();

    // 2. Ship order
    $this->actingAs($admin)
        ->post(route('admin.orders.ship', $order), [
            'shipping_courier' => 'Paxel',
            'tracking_number' => 'PXL-123456',
            'note' => 'Sudah diserahkan ke kurir.',
        ])
        ->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Shipped)
        ->and($order->shipping_courier)->toBe('Paxel')
        ->and($order->tracking_number)->toBe('PXL-123456')
        ->and($order->shipped_at)->not->toBeNull();

    // 3. Add manual tracking update
    $this->actingAs($admin)
        ->post(route('admin.orders.tracking', $order), [
            'title' => 'Paket tiba di hub Bogor',
            'description' => 'Segera diantar ke alamat penerima.',
            'location' => 'Bogor Utara',
        ])
        ->assertRedirect();

    expect($order->statusHistories()->where('title', 'Paket tiba di hub Bogor')->where('actor_type', 'admin')->exists())->toBeTrue();

    // 4. Add internal note
    $this->actingAs($admin)
        ->post(route('admin.orders.internal-notes.store', $order), [
            'note' => 'Sudah koordinasi dengan pembeli via WA, penerima ada di rumah sore ini.',
        ])
        ->assertRedirect();

    expect($order->internalNotes()->where('admin_id', $admin->id)->count())->toBe(1);

    // 5. Complete order
    $this->actingAs($admin)
        ->post(route('admin.orders.complete', $order), [
            'note' => 'Pembeli sudah konfirmasi terima paket.',
        ])
        ->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Completed)
        ->and($order->completed_at)->not->toBeNull();

    // 6. Cannot cancel an already completed order
    $this->actingAs($admin)
        ->post(route('admin.orders.cancel', $order), [
            'reason' => 'Alasan tidak valid',
        ])
        ->assertSessionHasErrors('order');
});

test('admin cancellation restores product stock and records reason in timeline', function () {
    $admin = createOrderAdmin();
    $customer = createOrderCustomer();
    $product = Product::factory()->create(['stock' => 10]);

    $order = Order::factory()->for($customer)->for($product->store)->create([
        'status' => OrderStatus::Processing,
        'payment_status' => 'paid',
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'quantity' => 3,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.orders.cancel', $order), [
            'reason' => 'Bahan baku utama habis di dapur UMKM.',
        ])
        ->assertRedirect();

    $order->refresh();
    $product->refresh();

    expect($order->status)->toBe(OrderStatus::Cancelled)
        ->and($order->payment_status)->toBe('refunded')
        ->and($order->cancellation_reason)->toBe('Bahan baku utama habis di dapur UMKM.')
        ->and($product->stock)->toBe(13);
});

test('admin can queue transaction export job', function () {
    Queue::fake();
    $admin = createOrderAdmin();

    $this->actingAs($admin)
        ->post(route('admin.orders.export'), [
            'format' => 'xlsx',
            'status' => OrderStatus::Completed->value,
        ])
        ->assertRedirect();

    Queue::assertPushed(GenerateTabularExportJob::class, function (GenerateTabularExportJob $job): bool {
        return $job->providerClass === OrderQueuedExportProvider::class
            && $job->format === 'xlsx';
    });
});
