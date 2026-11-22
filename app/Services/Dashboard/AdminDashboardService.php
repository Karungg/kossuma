<?php

namespace App\Services\Dashboard;

use App\Contracts\Dashboard\AdminDashboardServiceInterface;
use App\Enums\Order\OrderStatus;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderStatusHistory;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class AdminDashboardService implements AdminDashboardServiceInterface
{
    private const int LOW_STOCK_THRESHOLD = 5;

    /**
     * @var list<string>
     */
    private const array SALES_STATUSES = [
        OrderStatus::Processing->value,
        OrderStatus::Shipped->value,
        OrderStatus::Completed->value,
    ];

    /**
     * @var array<int, string>
     */
    private const array SHORT_MONTHS = [
        1 => 'Jan',
        2 => 'Feb',
        3 => 'Mar',
        4 => 'Apr',
        5 => 'Mei',
        6 => 'Jun',
        7 => 'Jul',
        8 => 'Agu',
        9 => 'Sep',
        10 => 'Okt',
        11 => 'Nov',
        12 => 'Des',
    ];

    public function getDashboardData(string $period = '30d'): array
    {
        $normalizedPeriod = $this->normalizePeriod($period);
        $now = CarbonImmutable::now();

        [
            'currentStart' => $currentStart,
            'currentEnd' => $currentEnd,
            'previousStart' => $previousStart,
            'previousEnd' => $previousEnd,
            'periodLabel' => $periodLabel,
            'comparisonLabel' => $comparisonLabel,
            'granularity' => $granularity,
        ] = $this->resolvePeriodWindow($normalizedPeriod, $now);

        return [
            'period' => $normalizedPeriod,
            'periodLabel' => $periodLabel,
            'comparisonLabel' => $comparisonLabel,
            'generatedAtLabel' => $this->formatShortDateTime($now),
            'kpis' => $this->buildKpis($currentStart, $currentEnd, $previousStart, $previousEnd, $now),
            'actionQueue' => $this->buildActionQueue($now),
            'salesChart' => $this->buildSalesChart($currentStart, $currentEnd, $granularity),
            'orderPipeline' => $this->buildOrderPipeline(),
            'paymentMethods' => $this->buildPaymentMethodBreakdown($currentStart, $currentEnd),
            'recentActivities' => $this->buildRecentActivities($now),
            'highlights' => [
                'topProducts' => $this->buildTopProducts($currentStart, $currentEnd),
                'lowStockProducts' => $this->buildLowStockProducts(),
                'topStores' => $this->buildTopStores($currentStart, $currentEnd),
                'recentReviews' => $this->buildRecentReviews($now),
            ],
        ];
    }

    /**
     * @return '7d'|'30d'|'12m'
     */
    private function normalizePeriod(string $period): string
    {
        return match (trim($period)) {
            '7d' => '7d',
            '12m' => '12m',
            default => '30d',
        };
    }

    /**
     * @param  '7d'|'30d'|'12m'  $period
     * @return array{
     *     currentStart: CarbonImmutable,
     *     currentEnd: CarbonImmutable,
     *     previousStart: CarbonImmutable,
     *     previousEnd: CarbonImmutable,
     *     periodLabel: string,
     *     comparisonLabel: string,
     *     granularity: 'day'|'month'
     * }
     */
    private function resolvePeriodWindow(string $period, CarbonImmutable $now): array
    {
        if ($period === '7d') {
            $currentStart = $now->subDays(6)->startOfDay();
            $currentEnd = $now->endOfDay();

            return [
                'currentStart' => $currentStart,
                'currentEnd' => $currentEnd,
                'previousStart' => $currentStart->subDays(7)->startOfDay(),
                'previousEnd' => $currentStart->subDay()->endOfDay(),
                'periodLabel' => '7 Hari Terakhir',
                'comparisonLabel' => 'vs 7 hari sebelumnya',
                'granularity' => 'day',
            ];
        }

        if ($period === '12m') {
            $currentStart = $now->startOfMonth()->subMonths(11)->startOfDay();
            $currentEnd = $now->endOfMonth()->endOfDay();

            return [
                'currentStart' => $currentStart,
                'currentEnd' => $currentEnd,
                'previousStart' => $currentStart->subMonths(12)->startOfDay(),
                'previousEnd' => $currentStart->subDay()->endOfDay(),
                'periodLabel' => '12 Bulan Terakhir',
                'comparisonLabel' => 'vs 12 bulan sebelumnya',
                'granularity' => 'month',
            ];
        }

        $currentStart = $now->subDays(29)->startOfDay();
        $currentEnd = $now->endOfDay();

        return [
            'currentStart' => $currentStart,
            'currentEnd' => $currentEnd,
            'previousStart' => $currentStart->subDays(30)->startOfDay(),
            'previousEnd' => $currentStart->subDay()->endOfDay(),
            'periodLabel' => '30 Hari Terakhir',
            'comparisonLabel' => 'vs 30 hari sebelumnya',
            'granularity' => 'day',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildKpis(
        CarbonImmutable $currentStart,
        CarbonImmutable $currentEnd,
        CarbonImmutable $previousStart,
        CarbonImmutable $previousEnd,
        CarbonImmutable $now,
    ): array {
        $currentSales = Order::query()
            ->whereIn('status', self::SALES_STATUSES)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->selectRaw('COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total, COUNT(DISTINCT user_id) as buyers_count')
            ->toBase()
            ->first();

        $previousSales = Order::query()
            ->whereIn('status', self::SALES_STATUSES)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->selectRaw('COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total, COUNT(DISTINCT user_id) as buyers_count')
            ->toBase()
            ->first();

        $currentRevenue = (int) ($currentSales->revenue_total ?? 0);
        $previousRevenue = (int) ($previousSales->revenue_total ?? 0);
        $currentOrders = (int) ($currentSales->orders_count ?? 0);
        $previousOrders = (int) ($previousSales->orders_count ?? 0);
        $activeBuyers = (int) ($currentSales->buyers_count ?? 0);
        $previousBuyers = (int) ($previousSales->buyers_count ?? 0);

        $currentAov = $currentOrders > 0 ? (int) round($currentRevenue / $currentOrders) : 0;
        $previousAov = $previousOrders > 0 ? (int) round($previousRevenue / $previousOrders) : 0;

        $todayRevenue = (int) Order::query()
            ->whereIn('status', self::SALES_STATUSES)
            ->whereBetween('created_at', [$now->startOfDay(), $now->endOfDay()])
            ->sum('total_amount');

        $completedStats = Order::query()
            ->where('status', OrderStatus::Completed->value)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->selectRaw('COUNT(*) as completed_count, COALESCE(SUM(total_amount), 0) as completed_revenue')
            ->toBase()
            ->first();

        $periodAllOrders = Order::query()
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $periodCancelledOrders = Order::query()
            ->where('status', OrderStatus::Cancelled->value)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $cancellationRate = $periodAllOrders > 0
            ? round(($periodCancelledOrders / $periodAllOrders) * 100, 1)
            : 0.0;

        $totalCustomers = User::query()
            ->whereHas('roles', static function (Builder $query): void {
                $query->where('name', 'Customer');
            })
            ->count();

        $reviewAggregate = ProductReview::query()
            ->visible()
            ->selectRaw('COUNT(*) as visible_count, COALESCE(AVG(rating), 0) as avg_rating')
            ->toBase()
            ->first();

        return [
            'revenue' => [
                'current' => $currentRevenue,
                'previous' => $previousRevenue,
                'growth_percent' => $this->calculateGrowthPercent($currentRevenue, $previousRevenue),
                'today' => $todayRevenue,
                'completed' => (int) ($completedStats->completed_revenue ?? 0),
            ],
            'orders' => [
                'current' => $currentOrders,
                'previous' => $previousOrders,
                'growth_percent' => $this->calculateGrowthPercent($currentOrders, $previousOrders),
                'completed' => (int) ($completedStats->completed_count ?? 0),
                'cancelled' => $periodCancelledOrders,
                'cancellation_rate' => $cancellationRate,
            ],
            'average_order_value' => [
                'current' => $currentAov,
                'previous' => $previousAov,
                'growth_percent' => $this->calculateGrowthPercent($currentAov, $previousAov),
            ],
            'customers_and_rating' => [
                'active_buyers' => $activeBuyers,
                'previous_buyers' => $previousBuyers,
                'growth_percent' => $this->calculateGrowthPercent($activeBuyers, $previousBuyers),
                'total_customers' => $totalCustomers,
                'average_rating' => round((float) ($reviewAggregate->avg_rating ?? 0), 2),
                'visible_reviews' => (int) ($reviewAggregate->visible_count ?? 0),
            ],
        ];
    }

    /**
     * @return array<string, int>
     */
    private function buildActionQueue(CarbonImmutable $now): array
    {
        $statusRows = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $needsAttention = Order::query()
            ->where(function (Builder $query) use ($now): void {
                $query
                    ->where(function (Builder $processingStale) use ($now): void {
                        $processingStale
                            ->where('status', OrderStatus::Processing->value)
                            ->where('created_at', '<=', $now->subHours(24));
                    })
                    ->orWhere(function (Builder $pendingExpiring) use ($now): void {
                        $pendingExpiring
                            ->where('status', OrderStatus::PendingPayment->value)
                            ->whereNotNull('payment_due_at')
                            ->where('payment_due_at', '<=', $now->addHours(6));
                    });
            })
            ->count();

        $outOfStockProducts = Product::query()
            ->where('stock', 0)
            ->count();

        $lowStockProducts = Product::query()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->count();

        $unrepliedReviews = ProductReview::query()
            ->visible()
            ->whereNull('admin_reply')
            ->count();

        $lowRatingReviews = ProductReview::query()
            ->visible()
            ->where('rating', '<=', 2)
            ->count();

        return [
            'pending_payment' => (int) ($statusRows[OrderStatus::PendingPayment->value] ?? 0),
            'processing' => (int) ($statusRows[OrderStatus::Processing->value] ?? 0),
            'needs_attention' => $needsAttention,
            'shipped' => (int) ($statusRows[OrderStatus::Shipped->value] ?? 0),
            'out_of_stock_products' => $outOfStockProducts,
            'low_stock_products' => $lowStockProducts,
            'unreplied_reviews' => $unrepliedReviews,
            'low_rating_reviews' => $lowRatingReviews,
        ];
    }

    /**
     * @param  'day'|'month'  $granularity
     * @return array<string, mixed>
     */
    private function buildSalesChart(
        CarbonImmutable $start,
        CarbonImmutable $end,
        string $granularity,
    ): array {
        $rowsQuery = Order::query()
            ->whereIn('status', self::SALES_STATUSES)
            ->whereBetween('created_at', [$start, $end]);

        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            if ($granularity === 'month') {
                $rowsQuery
                    ->selectRaw("strftime('%Y-%m', created_at) as bucket_key, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total")
                    ->groupByRaw("strftime('%Y-%m', created_at)");
            } else {
                $rowsQuery
                    ->selectRaw("strftime('%Y-%m-%d', created_at) as bucket_key, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total")
                    ->groupByRaw("strftime('%Y-%m-%d', created_at)");
            }
        } elseif ($driver === 'pgsql') {
            if ($granularity === 'month') {
                $rowsQuery
                    ->selectRaw("to_char(created_at, 'YYYY-MM') as bucket_key, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total")
                    ->groupByRaw("to_char(created_at, 'YYYY-MM')");
            } else {
                $rowsQuery
                    ->selectRaw("to_char(created_at, 'YYYY-MM-DD') as bucket_key, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total")
                    ->groupByRaw("to_char(created_at, 'YYYY-MM-DD')");
            }
        } elseif ($granularity === 'month') {
            $rowsQuery
                ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as bucket_key, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total")
                ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')");
        } else {
            $rowsQuery
                ->selectRaw("DATE_FORMAT(created_at, '%Y-%m-%d') as bucket_key, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total")
                ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m-%d')");
        }

        $rows = $rowsQuery
            ->toBase()
            ->get()
            ->keyBy('bucket_key');

        $points = [];
        $totalRevenue = 0;
        $totalOrders = 0;
        $peakLabel = null;
        $peakRevenue = 0;

        if ($granularity === 'month') {
            $cursor = $start->startOfMonth();
            $limit = $end->startOfMonth();

            while ($cursor->lte($limit)) {
                $key = $cursor->format('Y-m');
                $row = $rows->get($key);
                $revenue = (int) ($row->revenue_total ?? 0);
                $ordersCount = (int) ($row->orders_count ?? 0);
                $monthName = self::SHORT_MONTHS[$cursor->month] ?? $cursor->format('M');
                $label = $monthName;
                $fullLabel = "{$monthName} {$cursor->year}";

                $points[] = [
                    'key' => $key,
                    'label' => $label,
                    'full_label' => $fullLabel,
                    'revenue' => $revenue,
                    'orders_count' => $ordersCount,
                ];

                $totalRevenue += $revenue;
                $totalOrders += $ordersCount;

                if ($revenue > $peakRevenue) {
                    $peakRevenue = $revenue;
                    $peakLabel = $fullLabel;
                }

                $cursor = $cursor->addMonth();
            }
        } else {
            $cursor = $start->startOfDay();
            $limit = $end->startOfDay();

            while ($cursor->lte($limit)) {
                $key = $cursor->format('Y-m-d');
                $row = $rows->get($key);
                $revenue = (int) ($row->revenue_total ?? 0);
                $ordersCount = (int) ($row->orders_count ?? 0);
                $monthName = self::SHORT_MONTHS[$cursor->month] ?? $cursor->format('M');
                $label = "{$cursor->day} {$monthName}";
                $fullLabel = "{$cursor->day} {$monthName} {$cursor->year}";

                $points[] = [
                    'key' => $key,
                    'label' => $label,
                    'full_label' => $fullLabel,
                    'revenue' => $revenue,
                    'orders_count' => $ordersCount,
                ];

                $totalRevenue += $revenue;
                $totalOrders += $ordersCount;

                if ($revenue > $peakRevenue) {
                    $peakRevenue = $revenue;
                    $peakLabel = $fullLabel;
                }

                $cursor = $cursor->addDay();
            }
        }

        return [
            'granularity' => $granularity,
            'points' => $points,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'peak_label' => $peakLabel,
                'peak_revenue' => $peakRevenue,
            ],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildOrderPipeline(): array
    {
        $rows = Order::query()
            ->selectRaw('status, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total')
            ->groupBy('status')
            ->toBase()
            ->get()
            ->keyBy('status');

        $totalOrders = 0;

        foreach ($rows as $row) {
            $totalOrders += (int) ($row->orders_count ?? 0);
        }

        $pipeline = [];

        foreach (OrderStatus::cases() as $status) {
            $row = $rows->get($status->value);
            $count = (int) ($row->orders_count ?? 0);
            $amount = (int) ($row->revenue_total ?? 0);

            $pipeline[] = [
                'status' => $status->value,
                'label' => $status->label(),
                'count' => $count,
                'amount' => $amount,
                'percentage' => $totalOrders > 0 ? round(($count / $totalOrders) * 100, 1) : 0.0,
            ];
        }

        return $pipeline;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildPaymentMethodBreakdown(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $rows = Order::query()
            ->whereIn('status', self::SALES_STATUSES)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('payment_method, COUNT(*) as orders_count, COALESCE(SUM(total_amount), 0) as revenue_total')
            ->groupBy('payment_method')
            ->toBase()
            ->get()
            ->keyBy('payment_method');

        $totalCount = 0;

        foreach ($rows as $row) {
            $totalCount += (int) ($row->orders_count ?? 0);
        }

        $methods = [
            'qris' => 'QRIS',
            'bank_transfer' => 'Transfer Bank',
            'cod' => 'Bayar di Tempat (COD)',
        ];

        $breakdown = [];

        foreach ($methods as $key => $label) {
            $row = $rows->get($key);
            $count = (int) ($row->orders_count ?? 0);
            $amount = (int) ($row->revenue_total ?? 0);

            $breakdown[] = [
                'method' => $key,
                'label' => $label,
                'count' => $count,
                'amount' => $amount,
                'percentage' => $totalCount > 0 ? round(($count / $totalCount) * 100, 1) : 0.0,
            ];
        }

        return $breakdown;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildRecentActivities(CarbonImmutable $now): array
    {
        $orders = Order::query()
            ->with([
                'user:id,name',
                'store:id,name',
                'items:id,order_id,product_name,quantity',
                'statusHistories' => static function ($query): void {
                    $query->limit(1);
                },
            ])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        $activities = [];

        foreach ($orders as $order) {
            $address = $order->shipping_address_snapshot;
            $recipient = is_string($address['recipient_name'] ?? null) ? trim($address['recipient_name']) : '';
            $customerName = $recipient !== ''
                ? $recipient
                : ($order->user instanceof User ? $order->user->name : 'Pembeli');

            $firstItem = $order->items->first();
            $otherItemsCount = max(0, $order->items->count() - 1);
            $totalQuantity = (int) $order->items->sum('quantity');

            $latestHistory = $order->statusHistories->first();
            $eventTitle = $latestHistory instanceof OrderStatusHistory
                ? $latestHistory->title
                : 'Pesanan '.$order->status->label();

            $occurredAt = $latestHistory instanceof OrderStatusHistory
                ? $latestHistory->occurred_at
                : ($order->updated_at ?? $order->created_at ?? $now);

            $needsAttention = (
                $order->status === OrderStatus::Processing
                && $order->created_at !== null
                && $order->created_at->lte($now->subHours(24))
            ) || (
                $order->status === OrderStatus::PendingPayment
                && $order->payment_due_at !== null
                && $order->payment_due_at->lte($now->addHours(6))
            );

            $activities[] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'payment_status' => $order->payment_status,
                'event_title' => $eventTitle,
                'customer_name' => $customerName,
                'store_name' => $order->store instanceof Store ? $order->store->name : 'UMKM Kossuma',
                'primary_item_name' => $firstItem instanceof OrderItem ? $firstItem->product_name : 'Produk Kossuma',
                'other_items_count' => $otherItemsCount,
                'total_quantity' => $totalQuantity,
                'total_amount' => $order->total_amount,
                'needs_attention' => $needsAttention,
                'occurred_at_label' => $this->formatShortDateTime($occurredAt),
                'relative_time' => $this->formatRelativeTime($occurredAt, $now),
            ];
        }

        return $activities;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildTopProducts(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $periodRows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', self::SALES_STATUSES)
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('order_items.product_id')
            ->selectRaw('order_items.product_id, SUM(order_items.quantity) as sold_qty, SUM(order_items.subtotal) as revenue_total')
            ->groupBy('order_items.product_id')
            ->orderByDesc('sold_qty')
            ->limit(5)
            ->get();

        if ($periodRows->isNotEmpty()) {
            $productIds = $periodRows->pluck('product_id')->map(static fn (mixed $id): int => (int) $id)->all();
            $products = Product::query()
                ->with(['store:id,name', 'primaryImage:id,product_id,image_path,is_primary,sort_order'])
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            $items = [];

            foreach ($periodRows as $row) {
                $product = $products->get((int) $row->product_id);

                if (! $product instanceof Product) {
                    continue;
                }

                $items[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'store_name' => $product->store instanceof Store ? $product->store->name : 'UMKM Kossuma',
                    'image_url' => $product->getPrimaryImageUrl(true),
                    'sold_qty' => (int) $row->sold_qty,
                    'revenue' => (int) $row->revenue_total,
                    'stock' => $product->stock,
                ];
            }

            if ($items !== []) {
                return $items;
            }
        }

        return array_values(
            Product::query()
                ->with(['store:id,name', 'primaryImage:id,product_id,image_path,is_primary,sort_order'])
                ->where('is_active', true)
                ->orderByDesc('sold_count')
                ->orderByDesc('id')
                ->limit(5)
                ->get()
                ->map(static fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'store_name' => $product->store instanceof Store ? $product->store->name : 'UMKM Kossuma',
                    'image_url' => $product->getPrimaryImageUrl(true),
                    'sold_qty' => $product->sold_count,
                    'revenue' => $product->sold_count * $product->price,
                    'stock' => $product->stock,
                ])
                ->all(),
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildLowStockProducts(): array
    {
        return array_values(
            Product::query()
                ->with(['store:id,name', 'primaryImage:id,product_id,image_path,is_primary,sort_order'])
                ->where('is_active', true)
                ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
                ->orderBy('stock')
                ->orderByDesc('sold_count')
                ->limit(5)
                ->get()
                ->map(static fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'store_name' => $product->store instanceof Store ? $product->store->name : 'UMKM Kossuma',
                    'image_url' => $product->getPrimaryImageUrl(true),
                    'stock' => $product->stock,
                    'price' => $product->price,
                ])
                ->all(),
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildTopStores(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $rows = DB::table('orders')
            ->join('stores', 'stores.id', '=', 'orders.store_id')
            ->whereIn('orders.status', self::SALES_STATUSES)
            ->whereBetween('orders.created_at', [$start, $end])
            ->selectRaw('stores.id, stores.name, stores.location, COUNT(orders.id) as orders_count, COALESCE(SUM(orders.total_amount), 0) as revenue_total')
            ->groupBy('stores.id', 'stores.name', 'stores.location')
            ->orderByDesc('revenue_total')
            ->limit(5)
            ->get();

        return array_values(
            $rows->map(static fn (object $row): array => [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'location' => is_string($row->location) && trim($row->location) !== '' ? $row->location : 'Kota Bogor',
                'orders_count' => (int) $row->orders_count,
                'revenue' => (int) $row->revenue_total,
            ])->all(),
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildRecentReviews(CarbonImmutable $now): array
    {
        return array_values(
            ProductReview::query()
                ->visible()
                ->with(['product:id,name,store_id', 'product.store:id,name'])
                ->orderByRaw('CASE WHEN admin_reply IS NULL THEN 0 ELSE 1 END')
                ->orderByRaw('CASE WHEN rating <= 2 THEN 0 ELSE 1 END')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get()
                ->map(function (ProductReview $review) use ($now): array {
                    $createdAt = $review->created_at ?? $now;

                    return [
                        'id' => $review->id,
                        'product_name' => $review->product instanceof Product ? $review->product->name : 'Produk Kossuma',
                        'store_name' => $review->product instanceof Product && $review->product->store instanceof Store
                            ? $review->product->store->name
                            : 'UMKM Kossuma',
                        'author_name' => $review->author_name,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'has_reply' => is_string($review->admin_reply) && trim($review->admin_reply) !== '',
                        'relative_time' => $this->formatRelativeTime($createdAt, $now),
                    ];
                })
                ->all(),
        );
    }

    private function calculateGrowthPercent(int $current, int $previous): ?float
    {
        if ($previous === 0) {
            return $current === 0 ? 0.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function formatShortDateTime(CarbonInterface $date): string
    {
        $monthName = self::SHORT_MONTHS[$date->month] ?? $date->format('M');

        return sprintf('%d %s %d, %s', $date->day, $monthName, $date->year, $date->format('H:i'));
    }

    private function formatRelativeTime(CarbonInterface $date, CarbonImmutable $now): string
    {
        $diffMinutes = (int) floor($date->diffInMinutes($now));

        if ($diffMinutes < 1) {
            return 'Baru saja';
        }

        if ($diffMinutes < 60) {
            return "{$diffMinutes} menit lalu";
        }

        $diffHours = (int) floor($date->diffInHours($now));

        if ($diffHours < 24) {
            return "{$diffHours} jam lalu";
        }

        $diffDays = (int) floor($date->diffInDays($now));

        if ($diffDays < 30) {
            return "{$diffDays} hari lalu";
        }

        $monthName = self::SHORT_MONTHS[$date->month] ?? $date->format('M');

        return "{$date->day} {$monthName} {$date->year}";
    }
}
