<?php

use App\Enums\Order\OrderStatus;
use App\Models\Category\Category;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderStatusHistory;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Role;
use App\Models\Store\Store;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createDashboardAdmin(): User
{
    $role = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('admin dashboard route uses the /admin/dashboard prefix', function () {
    expect(route('admin.dashboard', absolute: false))->toBe('/admin/dashboard');
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('admin.dashboard'));
    $response->assertRedirect(route('login'));
});

test('customer users cannot visit the admin dashboard', function () {
    $role = Role::firstOrCreate(['name' => 'Customer']);
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user);

    $response = $this->get(route('admin.dashboard'));
    $response->assertForbidden();
});

test('admin users receive complete operational kpis, action queue, sales chart, recent activities, and highlights', function () {
    $admin = createDashboardAdmin();

    $customerRole = Role::firstOrCreate(['name' => 'Customer']);
    $buyerOne = User::factory()->create(['name' => 'Siti Aminah']);
    $buyerOne->assignRole($customerRole);
    $buyerTwo = User::factory()->create(['name' => 'Budi Santoso']);
    $buyerTwo->assignRole($customerRole);

    $category = Category::factory()->create(['name' => 'Frozen Food']);
    $store = Store::factory()->create(['name' => 'Dapur Ibu Ani', 'location' => 'Bogor Utara']);

    $topProduct = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
        'name' => 'Risol Mayo Lumer',
        'price' => 35000,
        'stock' => 25,
        'sold_count' => 10,
        'is_active' => true,
    ]);

    $outOfStockProduct = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
        'name' => 'Dimsum Ayam Udang',
        'price' => 40000,
        'stock' => 0,
        'is_active' => true,
    ]);

    $lowStockProduct = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
        'name' => 'Pempek Kapal Selam',
        'price' => 45000,
        'stock' => 3,
        'is_active' => true,
    ]);

    // Current period completed order (today)
    $completedOrder = Order::factory()->create([
        'order_number' => 'KSM-20261122-0001',
        'user_id' => $buyerOne->id,
        'store_id' => $store->id,
        'status' => OrderStatus::Completed,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'total_amount' => 105000,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $completedItem = OrderItem::factory()->create([
        'order_id' => $completedOrder->id,
        'product_id' => $topProduct->id,
        'product_name' => $topProduct->name,
        'product_slug' => $topProduct->slug,
        'price' => 35000,
        'quantity' => 3,
        'subtotal' => 105000,
    ]);

    OrderStatusHistory::factory()->create([
        'order_id' => $completedOrder->id,
        'status' => OrderStatus::Completed->value,
        'title' => 'Pesanan selesai diterima pembeli',
        'occurred_at' => now(),
    ]);

    // Stale processing order (>24h ago -> needs attention, within 7d/30d period)
    $staleProcessingOrder = Order::factory()->create([
        'order_number' => 'KSM-20261120-0002',
        'user_id' => $buyerTwo->id,
        'store_id' => $store->id,
        'status' => OrderStatus::Processing,
        'payment_method' => 'bank_transfer',
        'payment_status' => 'paid',
        'total_amount' => 95000,
        'created_at' => now()->subHours(30),
        'updated_at' => now()->subHours(29),
    ]);

    OrderItem::factory()->create([
        'order_id' => $staleProcessingOrder->id,
        'product_id' => $lowStockProduct->id,
        'product_name' => $lowStockProduct->name,
        'product_slug' => $lowStockProduct->slug,
        'price' => 45000,
        'quantity' => 2,
        'subtotal' => 90000,
    ]);

    // Pending payment expiring soon (<=6h -> needs attention, excluded from sales revenue)
    Order::factory()->create([
        'order_number' => 'KSM-20261122-0003',
        'user_id' => $buyerOne->id,
        'store_id' => $store->id,
        'status' => OrderStatus::PendingPayment,
        'payment_method' => 'qris',
        'payment_status' => 'unpaid',
        'payment_due_at' => now()->addHours(2),
        'total_amount' => 50000,
        'created_at' => now()->subHour(),
        'updated_at' => now()->subHour(),
    ]);

    // Cancelled order (excluded from sales revenue, counted in cancellation rate)
    Order::factory()->create([
        'order_number' => 'KSM-20261121-0004',
        'user_id' => $buyerTwo->id,
        'store_id' => $store->id,
        'status' => OrderStatus::Cancelled,
        'payment_method' => 'cod',
        'payment_status' => 'cancelled',
        'total_amount' => 75000,
        'created_at' => now()->subDays(2),
        'updated_at' => now()->subDays(2),
    ]);

    // Previous period order (for growth comparison: 100,000 vs current 200,000 => +100%)
    Order::factory()->create([
        'order_number' => 'KSM-20261110-0005',
        'user_id' => $buyerOne->id,
        'store_id' => $store->id,
        'status' => OrderStatus::Completed,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'total_amount' => 100000,
        'created_at' => now()->subDays(10),
        'updated_at' => now()->subDays(10),
    ]);

    // Visible low-rating unreplied review
    ProductReview::query()->create([
        'product_id' => $topProduct->id,
        'user_id' => $buyerOne->id,
        'order_item_id' => $completedItem->id,
        'author_name' => $buyerOne->name,
        'author_location' => 'Bogor Utara',
        'rating' => 2,
        'comment' => 'Pengiriman agak lama tapi rasanya enak.',
        'is_hidden' => false,
    ]);

    // Hidden review (must be excluded from visible metrics)
    ProductReview::query()->create([
        'product_id' => $topProduct->id,
        'author_name' => 'Spammer',
        'rating' => 1,
        'comment' => 'Spam',
        'is_hidden' => true,
        'hidden_reason' => 'Spam',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard', ['period' => '7d']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard/index')
            ->where('period', '7d')
            ->where('kpis.revenue.current', 200000)
            ->where('kpis.revenue.previous', 100000)
            ->where('kpis.revenue.growth_percent', 100)
            ->where('kpis.revenue.today', 105000)
            ->where('kpis.revenue.completed', 105000)
            ->where('kpis.orders.current', 2)
            ->where('kpis.orders.completed', 1)
            ->where('kpis.orders.cancelled', 1)
            ->where('kpis.average_order_value.current', 100000)
            ->where('kpis.customers_and_rating.active_buyers', 2)
            ->where('kpis.customers_and_rating.total_customers', 2)
            ->where('kpis.customers_and_rating.visible_reviews', 1)
            ->where('actionQueue.pending_payment', 1)
            ->where('actionQueue.processing', 1)
            ->where('actionQueue.needs_attention', 2)
            ->where('actionQueue.out_of_stock_products', 1)
            ->where('actionQueue.low_stock_products', 1)
            ->where('actionQueue.unreplied_reviews', 1)
            ->where('actionQueue.low_rating_reviews', 1)
            ->has('salesChart.points', 7)
            ->where('salesChart.summary.total_revenue', 200000)
            ->where('salesChart.summary.total_orders', 2)
            ->has('orderPipeline', 5)
            ->has('paymentMethods', 3)
            ->has('recentActivities', 5)
            ->where('recentActivities.0.order_number', 'KSM-20261122-0001')
            ->where('highlights.topProducts.0.id', $topProduct->id)
            ->where('highlights.lowStockProducts.0.id', $outOfStockProduct->id)
            ->where('highlights.topStores.0.id', $store->id)
            ->where('highlights.recentReviews.0.rating', 2));
});

test('admin dashboard supports 30d and 12m chart periods and falls back safely on invalid period', function () {
    $admin = createDashboardAdmin();

    $this->actingAs($admin)
        ->get(route('admin.dashboard', ['period' => '12m']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('period', '12m')
            ->where('salesChart.granularity', 'month')
            ->has('salesChart.points', 12));

    $this->actingAs($admin)
        ->get(route('admin.dashboard', ['period' => 'invalid']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('period', '30d')
            ->where('salesChart.granularity', 'day')
            ->has('salesChart.points', 30));
});
