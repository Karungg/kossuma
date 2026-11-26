<?php

use App\Contracts\Notification\NotificationServiceInterface;
use App\Contracts\Report\AdminReportServiceInterface;
use App\Enums\Order\OrderStatus;
use App\Jobs\Report\GenerateOperationalReportExportJob;
use App\Models\Category\Category;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Role;
use App\Models\Store\Store;
use App\Models\User;
use App\Services\Report\AdminReportExportService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function createReportAdmin(): User
{
    $role = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function createReportCustomer(): User
{
    $role = Role::firstOrCreate(['name' => 'Customer']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('guests are redirected and customers are forbidden from admin report routes', function () {
    $this->get(route('admin.reports.index'))->assertRedirect(route('login'));
    $this->post(route('admin.reports.export'), ['format' => 'pdf'])->assertRedirect(route('login'));

    $customer = createReportCustomer();
    $this->actingAs($customer);

    $this->get(route('admin.reports.index'))->assertForbidden();
    $this->post(route('admin.reports.export'), ['format' => 'pdf'])->assertForbidden();
});

test('admin can view operational report filtered by Indonesian fiscal quarter Q1-Q4, month, day, year, and date range', function () {
    $admin = createReportAdmin();
    $buyer = createReportCustomer();
    $categoryA = Category::factory()->create(['name' => 'Frozen Food', 'slug' => 'frozen-food']);
    $categoryB = Category::factory()->create(['name' => 'Kue Basah', 'slug' => 'kue-basah']);
    $storeA = Store::factory()->create(['name' => 'Dapur Ummi Salma']);
    $storeB = Store::factory()->create(['name' => 'Pawon Ibu Fatimah']);

    $productA = Product::factory()->create([
        'category_id' => $categoryA->id,
        'store_id' => $storeA->id,
        'name' => 'Kaki Naga Ayam',
        'price' => 30000,
        'stock' => 3,
    ]);

    $productB = Product::factory()->create([
        'category_id' => $categoryB->id,
        'store_id' => $storeB->id,
        'name' => 'Risol Mayo',
        'price' => 25000,
        'stock' => 20,
    ]);

    $q2Date = CarbonImmutable::create(2026, 5, 15, 10, 30, 0);
    $q1Date = CarbonImmutable::create(2026, 2, 10, 14, 0, 0);

    $orderQ2 = Order::factory()->create([
        'user_id' => $buyer->id,
        'store_id' => $storeA->id,
        'status' => OrderStatus::Completed,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'subtotal' => 60000,
        'discount_amount' => 5000,
        'shipping_fee' => 10000,
        'service_fee' => 2000,
        'total_amount' => 67000,
        'paid_at' => $q2Date,
        'shipped_at' => $q2Date->addHours(4),
        'completed_at' => $q2Date->addHours(10),
        'created_at' => $q2Date,
        'updated_at' => $q2Date,
    ]);

    OrderItem::factory()->create([
        'order_id' => $orderQ2->id,
        'product_id' => $productA->id,
        'product_name' => $productA->name,
        'product_slug' => $productA->slug,
        'price' => 30000,
        'quantity' => 2,
        'subtotal' => 60000,
    ]);

    $orderQ1 = Order::factory()->create([
        'user_id' => $buyer->id,
        'store_id' => $storeB->id,
        'status' => OrderStatus::Completed,
        'payment_method' => 'bank_transfer',
        'payment_status' => 'paid',
        'subtotal' => 50000,
        'discount_amount' => 0,
        'shipping_fee' => 8000,
        'service_fee' => 2000,
        'total_amount' => 60000,
        'created_at' => $q1Date,
        'updated_at' => $q1Date,
    ]);

    OrderItem::factory()->create([
        'order_id' => $orderQ1->id,
        'product_id' => $productB->id,
        'product_name' => $productB->name,
        'product_slug' => $productB->slug,
        'price' => 25000,
        'quantity' => 2,
        'subtotal' => 50000,
    ]);

    $cancelledQ2 = Order::factory()->create([
        'user_id' => $buyer->id,
        'store_id' => $storeA->id,
        'status' => OrderStatus::Cancelled,
        'payment_method' => 'cod',
        'subtotal' => 25000,
        'total_amount' => 25000,
        'cancellation_reason' => 'Salah alamat pengiriman',
        'created_at' => $q2Date->addDay(),
        'updated_at' => $q2Date->addDay(),
    ]);

    $this->actingAs($admin);

    $this->get(route('admin.reports.index', [
        'period_type' => 'quarter',
        'quarter' => 2,
        'year' => 2026,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/index')
            ->where('periodMeta.period_label', 'Q2 (Apr – Jun) 2026')
            ->where('periodMeta.comparison_label', 'vs Q1 2026')
            ->where('overview.kpis.gross_sales.current', 67000)
            ->where('overview.kpis.gross_sales.previous', 60000)
            ->where('overview.kpis.orders.current', 1)
            ->where('overview.kpis.orders.cancelled_count', 1)
            ->where('overview.financial.cancelled_amount', $cancelledQ2->total_amount)
            ->where('products.summary.total_units_sold', 2)
            ->where('products.summary.zero_sales_count', 1)
            ->where('storesAndCategories.summary.active_transacting_stores', 1)
            ->where('storesAndCategories.summary.inactive_stores_count', 1)
            ->where('operationsAndReviews.customers.returning_buyers', 1)
            ->where('operationsAndReviews.fulfillment.avg_hours_to_ship', 4)
        );

    $this->get(route('admin.reports.index', [
        'period_type' => 'day',
        'date' => '2026-05-15',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('periodMeta.granularity', 'hour')
            ->where('overview.kpis.gross_sales.current', 67000)
        );

    $this->get(route('admin.reports.index', [
        'period_type' => 'year',
        'year' => 2026,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('periodMeta.period_label', 'Tahun Fiskal 2026 (Jan – Des)')
            ->where('overview.kpis.gross_sales.current', 127000)
            ->where('overview.kpis.orders.current', 2)
        );

    $this->get(route('admin.reports.index', [
        'period_type' => 'range',
        'date_from' => '2026-01-01',
        'date_to' => '2026-12-31',
        'store_id' => $storeB->id,
        'payment_method' => 'bank_transfer',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('overview.kpis.gross_sales.current', 60000)
            ->where('overview.kpis.orders.current', 1)
        );
});

test('admin export endpoint dispatches background report export job and validates input', function () {
    Queue::fake();

    $admin = createReportAdmin();
    $this->actingAs($admin);

    $this->post(route('admin.reports.export'), [
        'format' => 'invalid',
    ])->assertSessionHasErrors('format');

    $this->post(route('admin.reports.export'), [
        'format' => 'xlsx',
        'scope' => 'all',
        'period_type' => 'quarter',
        'quarter' => 3,
        'year' => 2026,
        'status_scope' => 'valid',
    ])->assertRedirect();

    Queue::assertPushed(GenerateOperationalReportExportJob::class, function (GenerateOperationalReportExportJob $job) use ($admin): bool {
        return $job->userId === (string) $admin->id
            && $job->format === 'xlsx'
            && $job->scope === 'all'
            && $job->filters['period_type'] === 'quarter'
            && (int) $job->filters['quarter'] === 3;
    });
});

test('background report export job stores pdf, csv, and multi-sheet xlsx files and creates downloadable notifications', function (string $format) {
    Storage::fake('local');

    $admin = createReportAdmin();
    $buyer = createReportCustomer();
    $category = Category::factory()->create(['name' => 'Lauk Siap Masak']);
    $store = Store::factory()->create(['name' => 'Dapur Berkah']);
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
        'price' => 45000,
    ]);

    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'store_id' => $store->id,
        'status' => OrderStatus::Completed,
        'payment_method' => 'qris',
        'subtotal' => 45000,
        'total_amount' => 55000,
        'shipping_fee' => 10000,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_name' => $product->name,
        'product_slug' => $product->slug,
        'price' => 45000,
        'quantity' => 1,
        'subtotal' => 45000,
    ]);

    $job = new GenerateOperationalReportExportJob(
        userId: (string) $admin->id,
        format: $format,
        scope: 'all',
        filters: [
            'period_type' => 'year',
            'year' => now()->year,
        ],
    );

    $job->handle(
        app(AdminReportServiceInterface::class),
        app(AdminReportExportService::class),
        app(NotificationServiceInterface::class),
    );

    $notification = $admin->fresh()->notifications()->first();
    expect($notification)->not->toBeNull();

    $meta = $notification->data['meta'] ?? [];
    expect($meta['export_path'] ?? null)->not->toBeNull();
    Storage::disk('local')->assertExists($meta['export_path']);

    $this->actingAs($admin)
        ->get(route('notifications.download', ['notification' => $notification->id]))
        ->assertOk();
})->with(['pdf', 'csv', 'xlsx']);
