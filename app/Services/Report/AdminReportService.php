<?php

namespace App\Services\Report;

use App\Contracts\Report\AdminReportServiceInterface;
use App\Enums\Order\OrderStatus;
use App\Models\Category\Category;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AdminReportService implements AdminReportServiceInterface
{
    private const int LOW_STOCK_THRESHOLD = 5;

    /**
     * @var list<string>
     */
    private const array VALID_STATUSES = [
        OrderStatus::Processing->value,
        OrderStatus::Shipped->value,
        OrderStatus::Completed->value,
    ];

    /**
     * @var array<string, string>
     */
    private const array PAYMENT_METHOD_LABELS = [
        'qris' => 'QRIS',
        'bank_transfer' => 'Transfer Bank',
        'cod' => 'Bayar di Tempat (COD)',
    ];

    /**
     * @var array<string, string>
     */
    private const array STATUS_SCOPE_LABELS = [
        'valid' => 'Pesanan Valid (Diproses, Dikirim, Selesai)',
        'completed' => 'Hanya Pesanan Selesai',
        'all' => 'Semua Status Pesanan',
    ];

    public function __construct(
        public readonly ReportPeriodResolver $periodResolver,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getReportData(array $filters = []): array
    {
        $now = CarbonImmutable::now();
        $resolvedPeriod = $this->periodResolver->resolve($filters, $now);

        $storeId = $this->normalizePositiveInt($filters['store_id'] ?? null);
        $categoryId = $this->normalizePositiveInt($filters['category_id'] ?? null);
        $paymentMethod = $this->normalizePaymentMethod((string) ($filters['payment_method'] ?? ''));
        $statusScope = $this->normalizeStatusScope((string) ($filters['status_scope'] ?? 'valid'));
        $activeTab = $this->normalizeTab((string) ($filters['tab'] ?? 'overview'));

        $dimensions = [
            'store_id' => $storeId,
            'category_id' => $categoryId,
            'payment_method' => $paymentMethod,
            'status_scope' => $statusScope,
        ];

        $currentStart = $resolvedPeriod['current_start'];
        $currentEnd = $resolvedPeriod['current_end'];
        $previousStart = $resolvedPeriod['previous_start'];
        $previousEnd = $resolvedPeriod['previous_end'];

        $currentAllOrders = $this->fetchOrdersInWindow($currentStart, $currentEnd, $dimensions, false);
        $previousAllOrders = $this->fetchOrdersInWindow($previousStart, $previousEnd, $dimensions, false);

        $currentScopedOrders = $this->filterByStatusScope($currentAllOrders, $statusScope);
        $previousScopedOrders = $this->filterByStatusScope($previousAllOrders, $statusScope);

        $currentItems = $this->fetchOrderItemsForOrders($currentScopedOrders, $categoryId);

        $timeline = $this->buildTimeline(
            allOrders: $currentAllOrders,
            scopedOrders: $currentScopedOrders,
            start: $currentStart,
            end: $currentEnd,
            granularity: $resolvedPeriod['granularity'],
        );

        $options = $this->buildFilterOptions($now);

        return [
            'activeTab' => $activeTab,
            'filters' => [
                'period_type' => $resolvedPeriod['period_type'],
                'compare_mode' => $resolvedPeriod['compare_mode'],
                'date' => $resolvedPeriod['date'],
                'month' => $resolvedPeriod['month'],
                'quarter' => $resolvedPeriod['quarter'],
                'year' => $resolvedPeriod['year'],
                'date_from' => $resolvedPeriod['date_from'],
                'date_to' => $resolvedPeriod['date_to'],
                'store_id' => $storeId ? (string) $storeId : '',
                'category_id' => $categoryId ? (string) $categoryId : '',
                'payment_method' => $paymentMethod ?? '',
                'status_scope' => $statusScope,
            ],
            'periodMeta' => [
                'period_label' => $resolvedPeriod['period_label'],
                'comparison_label' => $resolvedPeriod['comparison_label'],
                'granularity' => $resolvedPeriod['granularity'],
                'generated_at_label' => $this->formatDateTime($now),
                'active_filter_summary' => $this->buildActiveFilterSummary($dimensions, $options),
            ],
            'options' => $options,
            'overview' => [
                'kpis' => $this->buildKpis(
                    currentAllOrders: $currentAllOrders,
                    previousAllOrders: $previousAllOrders,
                    currentScopedOrders: $currentScopedOrders,
                    previousScopedOrders: $previousScopedOrders,
                ),
                'financial' => $this->buildFinancialBreakdown($currentAllOrders, $currentScopedOrders),
                'salesTrend' => [
                    'granularity' => $resolvedPeriod['granularity'],
                    'points' => $timeline['chartPoints'],
                    'summary' => $timeline['chartSummary'],
                ],
                'orderStatusBreakdown' => $this->buildOrderStatusBreakdown($currentAllOrders),
                'paymentMethods' => $this->buildPaymentMethodBreakdown($currentScopedOrders),
                'shippingMethods' => $this->buildShippingMethodBreakdown($currentScopedOrders),
            ],
            'salesTimeline' => [
                'rows' => $timeline['rows'],
                'totals' => $timeline['totals'],
            ],
            'products' => $this->buildProductsReport($currentItems, $storeId, $categoryId),
            'storesAndCategories' => $this->buildStoresAndCategoriesReport(
                allOrders: $currentAllOrders,
                scopedOrders: $currentScopedOrders,
                scopedItems: $currentItems,
                storeId: $storeId,
                categoryId: $categoryId,
            ),
            'operationsAndReviews' => $this->buildOperationsAndReviewsReport(
                allOrders: $currentAllOrders,
                scopedOrders: $currentScopedOrders,
                currentStart: $currentStart,
                currentEnd: $currentEnd,
                storeId: $storeId,
                categoryId: $categoryId,
            ),
        ];
    }

    /**
     * @param  array{store_id: ?int, category_id: ?int, payment_method: ?string, status_scope: string}  $dimensions
     * @return Collection<int, Order>
     */
    private function fetchOrdersInWindow(
        CarbonImmutable $start,
        CarbonImmutable $end,
        array $dimensions,
        bool $applyStatusScope = true,
    ): Collection {
        $query = Order::query()
            ->select([
                'id',
                'order_number',
                'user_id',
                'store_id',
                'status',
                'payment_method',
                'payment_status',
                'shipping_method',
                'shipping_courier',
                'subtotal',
                'shipping_fee',
                'discount_amount',
                'service_fee',
                'total_amount',
                'cancellation_reason',
                'paid_at',
                'shipped_at',
                'completed_at',
                'cancelled_at',
                'created_at',
            ])
            ->with([
                'user:id,name,email',
                'store:id,name,location',
            ])
            ->whereBetween('created_at', [$start, $end]);

        if ($dimensions['store_id'] !== null) {
            $query->where('store_id', $dimensions['store_id']);
        }

        if ($dimensions['payment_method'] !== null) {
            $query->where('payment_method', $dimensions['payment_method']);
        }

        if ($dimensions['category_id'] !== null) {
            $categoryId = $dimensions['category_id'];
            $query->whereHas('items.product', function (Builder $productQuery) use ($categoryId): void {
                $productQuery->where('category_id', $categoryId);
            });
        }

        if ($applyStatusScope) {
            $statuses = $this->resolveStatusesForScope($dimensions['status_scope']);

            if ($statuses !== null) {
                $query->whereIn('status', $statuses);
            }
        }

        return $query->orderBy('created_at')->get();
    }

    /**
     * @param  Collection<int, Order>  $orders
     * @return Collection<int, Order>
     */
    private function filterByStatusScope(Collection $orders, string $statusScope): Collection
    {
        $statuses = $this->resolveStatusesForScope($statusScope);

        if ($statuses === null) {
            return $orders;
        }

        return $orders
            ->filter(static fn (Order $order): bool => in_array($order->status->value, $statuses, true))
            ->values();
    }

    /**
     * @param  Collection<int, Order>  $orders
     * @return Collection<int, OrderItem>
     */
    private function fetchOrderItemsForOrders(Collection $orders, ?int $categoryId): Collection
    {
        if ($orders->isEmpty()) {
            return new Collection;
        }

        $query = OrderItem::query()
            ->select([
                'id',
                'order_id',
                'product_id',
                'product_name',
                'product_slug',
                'quantity',
                'subtotal',
            ])
            ->with([
                'product:id,name,slug,category_id,store_id,stock,price,is_preorder,preorder_days,rating_avg',
                'product.category:id,name',
                'product.store:id,name',
            ])
            ->whereIn('order_id', $orders->pluck('id')->all());

        if ($categoryId !== null) {
            $query->whereHas('product', function (Builder $productQuery) use ($categoryId): void {
                $productQuery->where('category_id', $categoryId);
            });
        }

        return $query->get();
    }

    /**
     * @param  Collection<int, Order>  $currentAllOrders
     * @param  Collection<int, Order>  $previousAllOrders
     * @param  Collection<int, Order>  $currentScopedOrders
     * @param  Collection<int, Order>  $previousScopedOrders
     * @return array<string, mixed>
     */
    private function buildKpis(
        Collection $currentAllOrders,
        Collection $previousAllOrders,
        Collection $currentScopedOrders,
        Collection $previousScopedOrders,
    ): array {
        $currentGross = (int) $currentScopedOrders->sum('total_amount');
        $previousGross = (int) $previousScopedOrders->sum('total_amount');

        $currentNet = $this->calculateNetRevenue($currentScopedOrders);
        $previousNet = $this->calculateNetRevenue($previousScopedOrders);

        $currentOrderCount = $currentScopedOrders->count();
        $previousOrderCount = $previousScopedOrders->count();

        $currentAov = $currentOrderCount > 0 ? (int) round($currentGross / $currentOrderCount) : 0;
        $previousAov = $previousOrderCount > 0 ? (int) round($previousGross / $previousOrderCount) : 0;

        $currentAllCount = $currentAllOrders->count();
        $currentCompletedCount = $currentAllOrders->filter(
            static fn (Order $order): bool => $order->status === OrderStatus::Completed,
        )->count();
        $currentCancelledCount = $currentAllOrders->filter(
            static fn (Order $order): bool => $order->status === OrderStatus::Cancelled,
        )->count();

        $previousAllCount = $previousAllOrders->count();
        $previousCompletedCount = $previousAllOrders->filter(
            static fn (Order $order): bool => $order->status === OrderStatus::Completed,
        )->count();

        $currentCompletionRate = $currentAllCount > 0
            ? round(($currentCompletedCount / $currentAllCount) * 100, 1)
            : 0.0;
        $previousCompletionRate = $previousAllCount > 0
            ? round(($previousCompletedCount / $previousAllCount) * 100, 1)
            : 0.0;

        $cancellationRate = $currentAllCount > 0
            ? round(($currentCancelledCount / $currentAllCount) * 100, 1)
            : 0.0;

        $currentBuyers = $currentScopedOrders->pluck('user_id')->filter()->unique()->count();
        $previousBuyers = $previousScopedOrders->pluck('user_id')->filter()->unique()->count();

        return [
            'gross_sales' => [
                'current' => $currentGross,
                'previous' => $previousGross,
                'growth_percent' => $this->calculateGrowthPercent($currentGross, $previousGross),
            ],
            'net_revenue' => [
                'current' => $currentNet,
                'previous' => $previousNet,
                'growth_percent' => $this->calculateGrowthPercent($currentNet, $previousNet),
            ],
            'orders' => [
                'current' => $currentOrderCount,
                'previous' => $previousOrderCount,
                'growth_percent' => $this->calculateGrowthPercent($currentOrderCount, $previousOrderCount),
                'all_count' => $currentAllCount,
                'completed_count' => $currentCompletedCount,
                'cancelled_count' => $currentCancelledCount,
                'cancellation_rate' => $cancellationRate,
            ],
            'average_order_value' => [
                'current' => $currentAov,
                'previous' => $previousAov,
                'growth_percent' => $this->calculateGrowthPercent($currentAov, $previousAov),
            ],
            'completion_rate' => [
                'current' => $currentCompletionRate,
                'previous' => $previousCompletionRate,
                'delta_points' => round($currentCompletionRate - $previousCompletionRate, 1),
            ],
            'active_buyers' => [
                'current' => $currentBuyers,
                'previous' => $previousBuyers,
                'growth_percent' => $this->calculateGrowthPercent($currentBuyers, $previousBuyers),
            ],
        ];
    }

    /**
     * @param  Collection<int, Order>  $allOrders
     * @param  Collection<int, Order>  $scopedOrders
     * @return array<string, int>
     */
    private function buildFinancialBreakdown(Collection $allOrders, Collection $scopedOrders): array
    {
        $completedAmount = (int) $allOrders
            ->filter(static fn (Order $order): bool => $order->status === OrderStatus::Completed)
            ->sum('total_amount');

        $pendingAmount = (int) $allOrders
            ->filter(static fn (Order $order): bool => $order->status === OrderStatus::PendingPayment)
            ->sum('total_amount');

        $cancelledOrders = $allOrders->filter(
            static fn (Order $order): bool => $order->status === OrderStatus::Cancelled,
        );

        return [
            'subtotal' => (int) $scopedOrders->sum('subtotal'),
            'discount_amount' => (int) $scopedOrders->sum('discount_amount'),
            'shipping_fee' => (int) $scopedOrders->sum('shipping_fee'),
            'service_fee' => (int) $scopedOrders->sum('service_fee'),
            'total_amount' => (int) $scopedOrders->sum('total_amount'),
            'net_revenue' => $this->calculateNetRevenue($scopedOrders),
            'completed_amount' => $completedAmount,
            'pending_amount' => $pendingAmount,
            'cancelled_amount' => (int) $cancelledOrders->sum('total_amount'),
            'cancelled_orders_count' => $cancelledOrders->count(),
        ];
    }

    /**
     * @param  Collection<int, Order>  $allOrders
     * @param  Collection<int, Order>  $scopedOrders
     * @param  'hour'|'day'|'month'  $granularity
     * @return array{
     *     chartPoints: list<array<string, mixed>>,
     *     chartSummary: array<string, mixed>,
     *     rows: list<array<string, mixed>>,
     *     totals: array<string, int>
     * }
     */
    private function buildTimeline(
        Collection $allOrders,
        Collection $scopedOrders,
        CarbonImmutable $start,
        CarbonImmutable $end,
        string $granularity,
    ): array {
        $buckets = [];

        if ($granularity === 'hour') {
            for ($hour = 0; $hour < 24; $hour++) {
                $key = sprintf('%02d', $hour);
                $label = sprintf('%02d:00', $hour);
                $buckets[$key] = $this->makeEmptyBucket($key, $label, "{$label} – ".sprintf('%02d:59', $hour).' WIB');
            }
        } elseif ($granularity === 'month') {
            $cursor = $start->startOfMonth();
            $limit = $end->startOfMonth();

            while ($cursor->lte($limit)) {
                $key = $cursor->format('Y-m');
                $shortLabel = ReportPeriodResolver::SHORT_MONTHS[$cursor->month].' '.$cursor->format('y');
                $fullLabel = ReportPeriodResolver::FULL_MONTHS[$cursor->month].' '.$cursor->year;
                $buckets[$key] = $this->makeEmptyBucket($key, $shortLabel, $fullLabel);
                $cursor = $cursor->addMonth();
            }
        } else {
            $cursor = $start->startOfDay();
            $limit = $end->startOfDay();

            while ($cursor->lte($limit)) {
                $key = $cursor->format('Y-m-d');
                $shortLabel = $cursor->day.' '.ReportPeriodResolver::SHORT_MONTHS[$cursor->month];
                $fullLabel = $cursor->day.' '.ReportPeriodResolver::FULL_MONTHS[$cursor->month].' '.$cursor->year;
                $buckets[$key] = $this->makeEmptyBucket($key, $shortLabel, $fullLabel);
                $cursor = $cursor->addDay();
            }
        }

        foreach ($allOrders as $order) {
            if ($order->created_at === null) {
                continue;
            }

            $key = $this->bucketKeyForTimestamp($order->created_at, $granularity);

            if (! isset($buckets[$key])) {
                continue;
            }

            $buckets[$key]['all_orders_count']++;

            if ($order->status === OrderStatus::Completed) {
                $buckets[$key]['completed_count']++;
            }

            if ($order->status === OrderStatus::Cancelled) {
                $buckets[$key]['cancelled_count']++;
            }
        }

        foreach ($scopedOrders as $order) {
            if ($order->created_at === null) {
                continue;
            }

            $key = $this->bucketKeyForTimestamp($order->created_at, $granularity);

            if (! isset($buckets[$key])) {
                continue;
            }

            $buckets[$key]['orders_count']++;
            $buckets[$key]['subtotal'] += (int) $order->subtotal;
            $buckets[$key]['discount_amount'] += (int) $order->discount_amount;
            $buckets[$key]['shipping_fee'] += (int) $order->shipping_fee;
            $buckets[$key]['service_fee'] += (int) $order->service_fee;
            $buckets[$key]['total_amount'] += (int) $order->total_amount;
            $buckets[$key]['net_revenue'] += max(0, (int) $order->subtotal - (int) $order->discount_amount + (int) $order->service_fee);
        }

        $rows = array_values($buckets);
        $peakLabel = null;
        $peakRevenue = 0;

        $chartPoints = [];
        $totals = [
            'all_orders_count' => 0,
            'orders_count' => 0,
            'completed_count' => 0,
            'cancelled_count' => 0,
            'subtotal' => 0,
            'discount_amount' => 0,
            'shipping_fee' => 0,
            'service_fee' => 0,
            'net_revenue' => 0,
            'total_amount' => 0,
        ];

        foreach ($rows as $row) {
            $chartPoints[] = [
                'key' => $row['key'],
                'label' => $row['label'],
                'full_label' => $row['full_label'],
                'revenue' => $row['total_amount'],
                'net_revenue' => $row['net_revenue'],
                'orders_count' => $row['orders_count'],
            ];

            if ($row['total_amount'] > $peakRevenue) {
                $peakRevenue = $row['total_amount'];
                $peakLabel = $row['full_label'];
            }

            $totals['all_orders_count'] += $row['all_orders_count'];
            $totals['orders_count'] += $row['orders_count'];
            $totals['completed_count'] += $row['completed_count'];
            $totals['cancelled_count'] += $row['cancelled_count'];
            $totals['subtotal'] += $row['subtotal'];
            $totals['discount_amount'] += $row['discount_amount'];
            $totals['shipping_fee'] += $row['shipping_fee'];
            $totals['service_fee'] += $row['service_fee'];
            $totals['net_revenue'] += $row['net_revenue'];
            $totals['total_amount'] += $row['total_amount'];
        }

        return [
            'chartPoints' => $chartPoints,
            'chartSummary' => [
                'total_revenue' => $totals['total_amount'],
                'total_orders' => $totals['orders_count'],
                'peak_label' => $peakLabel,
                'peak_revenue' => $peakRevenue,
            ],
            'rows' => $rows,
            'totals' => $totals,
        ];
    }

    /**
     * @param  Collection<int, Order>  $allOrders
     * @return list<array<string, mixed>>
     */
    private function buildOrderStatusBreakdown(Collection $allOrders): array
    {
        $totalCount = $allOrders->count();
        $result = [];

        foreach (OrderStatus::cases() as $status) {
            $matching = $allOrders->filter(
                static fn (Order $order): bool => $order->status === $status,
            );

            $count = $matching->count();

            $result[] = [
                'status' => $status->value,
                'label' => $status->label(),
                'count' => $count,
                'amount' => (int) $matching->sum('total_amount'),
                'percentage' => $totalCount > 0 ? round(($count / $totalCount) * 100, 1) : 0.0,
            ];
        }

        return $result;
    }

    /**
     * @param  Collection<int, Order>  $scopedOrders
     * @return list<array<string, mixed>>
     */
    private function buildPaymentMethodBreakdown(Collection $scopedOrders): array
    {
        $totalAmount = (int) $scopedOrders->sum('total_amount');
        $result = [];

        foreach (self::PAYMENT_METHOD_LABELS as $method => $label) {
            $matching = $scopedOrders->filter(
                static fn (Order $order): bool => $order->payment_method === $method,
            );

            $amount = (int) $matching->sum('total_amount');

            $result[] = [
                'method' => $method,
                'label' => $label,
                'count' => $matching->count(),
                'amount' => $amount,
                'percentage' => $totalAmount > 0 ? round(($amount / $totalAmount) * 100, 1) : 0.0,
            ];
        }

        return $result;
    }

    /**
     * @param  Collection<int, Order>  $scopedOrders
     * @return list<array<string, mixed>>
     */
    private function buildShippingMethodBreakdown(Collection $scopedOrders): array
    {
        $totalOrders = $scopedOrders->count();
        $grouped = [];

        foreach ($scopedOrders as $order) {
            $rawKey = trim((string) ($order->shipping_courier ?: $order->shipping_method ?: 'Lainnya'));
            $label = $this->formatShippingLabel($rawKey);

            if (! isset($grouped[$label])) {
                $grouped[$label] = [
                    'label' => $label,
                    'count' => 0,
                    'shipping_fee' => 0,
                ];
            }

            $grouped[$label]['count']++;
            $grouped[$label]['shipping_fee'] += (int) $order->shipping_fee;
        }

        usort($grouped, static fn (array $a, array $b): int => $b['count'] <=> $a['count']);

        return array_map(
            static fn (array $row): array => [
                ...$row,
                'percentage' => $totalOrders > 0 ? round(($row['count'] / $totalOrders) * 100, 1) : 0.0,
            ],
            $grouped,
        );
    }

    /**
     * @param  Collection<int, OrderItem>  $scopedItems
     * @return array<string, mixed>
     */
    private function buildProductsReport(Collection $scopedItems, ?int $storeId, ?int $categoryId): array
    {
        $productsQuery = Product::query()
            ->select([
                'id',
                'name',
                'slug',
                'category_id',
                'store_id',
                'price',
                'stock',
                'is_preorder',
                'preorder_days',
                'rating_avg',
                'is_active',
            ])
            ->with([
                'category:id,name',
                'store:id,name',
            ]);

        if ($storeId !== null) {
            $productsQuery->where('store_id', $storeId);
        }

        if ($categoryId !== null) {
            $productsQuery->where('category_id', $categoryId);
        }

        $allProducts = $productsQuery->get();
        $activeProducts = $allProducts->where('is_active', true)->values();

        $salesByProduct = [];
        $totalRevenue = 0;
        $totalUnitsSold = 0;

        foreach ($scopedItems as $item) {
            $key = $item->product_id !== null ? 'id-'.$item->product_id : 'slug-'.$item->product_slug;
            $product = $item->product;
            $hasProduct = $product instanceof Product;
            $category = $hasProduct ? $product->category : null;
            $store = $hasProduct ? $product->store : null;

            if (! isset($salesByProduct[$key])) {
                $salesByProduct[$key] = [
                    'id' => $item->product_id ?? 0,
                    'name' => $hasProduct ? $product->name : $item->product_name,
                    'slug' => $hasProduct ? $product->slug : $item->product_slug,
                    'category_name' => $category instanceof Category ? $category->name : '-',
                    'store_name' => $store instanceof Store ? $store->name : '-',
                    'sold_qty' => 0,
                    'order_ids' => [],
                    'revenue' => 0,
                    'stock' => $hasProduct ? $product->stock : 0,
                    'is_preorder' => $hasProduct && $product->is_preorder,
                    'preorder_days' => $hasProduct ? $product->preorder_days : null,
                    'rating_avg' => round($hasProduct ? (float) $product->rating_avg : 0.0, 1),
                ];
            }

            $salesByProduct[$key]['sold_qty'] += (int) $item->quantity;
            $salesByProduct[$key]['revenue'] += (int) $item->subtotal;
            $salesByProduct[$key]['order_ids'][$item->order_id] = true;

            $totalRevenue += (int) $item->subtotal;
            $totalUnitsSold += (int) $item->quantity;
        }

        usort($salesByProduct, static function (array $a, array $b): int {
            return $b['revenue'] <=> $a['revenue'] ?: $b['sold_qty'] <=> $a['sold_qty'];
        });

        $soldProductIds = [];
        $topProducts = [];

        foreach (array_slice($salesByProduct, 0, 25) as $row) {
            if ($row['id'] > 0) {
                $soldProductIds[$row['id']] = true;
            }

            $topProducts[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'slug' => $row['slug'],
                'category_name' => $row['category_name'],
                'store_name' => $row['store_name'],
                'sold_qty' => $row['sold_qty'],
                'orders_count' => count($row['order_ids']),
                'revenue' => $row['revenue'],
                'revenue_share' => $totalRevenue > 0 ? round(($row['revenue'] / $totalRevenue) * 100, 1) : 0.0,
                'stock' => $row['stock'],
                'is_preorder' => $row['is_preorder'],
                'preorder_days' => $row['preorder_days'],
                'rating_avg' => $row['rating_avg'],
            ];
        }

        foreach ($salesByProduct as $row) {
            if ($row['id'] > 0) {
                $soldProductIds[$row['id']] = true;
            }
        }

        $zeroSalesCollection = $activeProducts
            ->filter(static fn (Product $product): bool => ! isset($soldProductIds[$product->id]))
            ->sortByDesc('stock')
            ->values();

        $lowStockCollection = $activeProducts
            ->filter(static fn (Product $product): bool => $product->stock <= self::LOW_STOCK_THRESHOLD)
            ->sortBy('stock')
            ->values();

        return [
            'summary' => [
                'total_products' => $allProducts->count(),
                'active_products' => $activeProducts->count(),
                'sold_products_count' => count($salesByProduct),
                'zero_sales_count' => $zeroSalesCollection->count(),
                'low_stock_count' => $activeProducts->filter(
                    static fn (Product $product): bool => $product->stock > 0 && $product->stock <= self::LOW_STOCK_THRESHOLD,
                )->count(),
                'out_of_stock_count' => $activeProducts->filter(
                    static fn (Product $product): bool => $product->stock === 0,
                )->count(),
                'preorder_count' => $activeProducts->where('is_preorder', true)->count(),
                'total_units_sold' => $totalUnitsSold,
            ],
            'topProducts' => $topProducts,
            'zeroSalesProducts' => $zeroSalesCollection->take(20)->map(static function (Product $product): array {
                $category = $product->category;
                $store = $product->store;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'category_name' => $category instanceof Category ? $category->name : '-',
                    'store_name' => $store instanceof Store ? $store->name : '-',
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'is_preorder' => $product->is_preorder,
                    'preorder_days' => $product->preorder_days,
                ];
            })->values()->all(),
            'lowStockProducts' => $lowStockCollection->take(20)->map(static function (Product $product): array {
                $category = $product->category;
                $store = $product->store;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'category_name' => $category instanceof Category ? $category->name : '-',
                    'store_name' => $store instanceof Store ? $store->name : '-',
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'is_preorder' => $product->is_preorder,
                    'preorder_days' => $product->preorder_days,
                ];
            })->values()->all(),
        ];
    }

    /**
     * @param  Collection<int, Order>  $allOrders
     * @param  Collection<int, Order>  $scopedOrders
     * @param  Collection<int, OrderItem>  $scopedItems
     * @return array<string, mixed>
     */
    private function buildStoresAndCategoriesReport(
        Collection $allOrders,
        Collection $scopedOrders,
        Collection $scopedItems,
        ?int $storeId,
        ?int $categoryId,
    ): array {
        $storesQuery = Store::query()
            ->select(['id', 'name', 'location', 'is_verified'])
            ->withCount([
                'products as active_products_count' => function (Builder $query) use ($categoryId): void {
                    $query->where('is_active', true);

                    if ($categoryId !== null) {
                        $query->where('category_id', $categoryId);
                    }
                },
            ]);

        if ($storeId !== null) {
            $storesQuery->where('id', $storeId);
        }

        $stores = $storesQuery->orderBy('name')->get();

        $itemsCountByOrder = [];
        foreach ($scopedItems as $item) {
            $itemsCountByOrder[$item->order_id] = ($itemsCountByOrder[$item->order_id] ?? 0) + (int) $item->quantity;
        }

        $storeMetrics = [];
        foreach ($stores as $store) {
            $storeMetrics[$store->id] = [
                'id' => $store->id,
                'name' => $store->name,
                'location' => $store->location,
                'all_orders_count' => 0,
                'orders_count' => 0,
                'completed_count' => 0,
                'cancelled_count' => 0,
                'items_sold' => 0,
                'revenue' => 0,
                'active_products_count' => (int) $store->getAttribute('active_products_count'),
            ];
        }

        foreach ($allOrders as $order) {
            if (! isset($storeMetrics[$order->store_id])) {
                continue;
            }

            $storeMetrics[$order->store_id]['all_orders_count']++;

            if ($order->status === OrderStatus::Completed) {
                $storeMetrics[$order->store_id]['completed_count']++;
            }

            if ($order->status === OrderStatus::Cancelled) {
                $storeMetrics[$order->store_id]['cancelled_count']++;
            }
        }

        foreach ($scopedOrders as $order) {
            if (! isset($storeMetrics[$order->store_id])) {
                continue;
            }

            $storeMetrics[$order->store_id]['orders_count']++;
            $storeMetrics[$order->store_id]['revenue'] += (int) $order->total_amount;
            $storeMetrics[$order->store_id]['items_sold'] += $itemsCountByOrder[$order->id] ?? 0;
        }

        $activeStores = [];
        $inactiveStores = [];

        foreach ($storeMetrics as $row) {
            if ($row['orders_count'] === 0) {
                $inactiveStores[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'location' => $row['location'],
                    'active_products_count' => $row['active_products_count'],
                ];

                continue;
            }

            $completionRate = $row['all_orders_count'] > 0
                ? round(($row['completed_count'] / $row['all_orders_count']) * 100, 1)
                : 0.0;

            $activeStores[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'location' => $row['location'],
                'orders_count' => $row['orders_count'],
                'completed_count' => $row['completed_count'],
                'cancelled_count' => $row['cancelled_count'],
                'completion_rate' => $completionRate,
                'items_sold' => $row['items_sold'],
                'revenue' => $row['revenue'],
                'average_order_value' => (int) round($row['revenue'] / $row['orders_count']),
                'active_products_count' => $row['active_products_count'],
            ];
        }

        usort($activeStores, static fn (array $a, array $b): int => $b['revenue'] <=> $a['revenue']);

        $categoriesQuery = Category::query()
            ->select(['id', 'name', 'slug'])
            ->withCount([
                'products as products_count' => function (Builder $query) use ($storeId): void {
                    if ($storeId !== null) {
                        $query->where('store_id', $storeId);
                    }
                },
            ]);

        if ($categoryId !== null) {
            $categoriesQuery->where('id', $categoryId);
        }

        $categories = $categoriesQuery->orderBy('name')->get();

        $categoryMetrics = [];
        foreach ($categories as $category) {
            $categoryMetrics[$category->id] = [
                'id' => $category->id,
                'name' => $category->name,
                'products_count' => (int) $category->getAttribute('products_count'),
                'order_ids' => [],
                'items_sold' => 0,
                'revenue' => 0,
            ];
        }

        $totalCategoryRevenue = 0;

        foreach ($scopedItems as $item) {
            $catId = $item->product?->category_id;

            if ($catId === null || ! isset($categoryMetrics[$catId])) {
                continue;
            }

            $categoryMetrics[$catId]['order_ids'][$item->order_id] = true;
            $categoryMetrics[$catId]['items_sold'] += (int) $item->quantity;
            $categoryMetrics[$catId]['revenue'] += (int) $item->subtotal;
            $totalCategoryRevenue += (int) $item->subtotal;
        }

        $categoryRows = array_map(
            static fn (array $row): array => [
                'id' => $row['id'],
                'name' => $row['name'],
                'products_count' => $row['products_count'],
                'orders_count' => count($row['order_ids']),
                'items_sold' => $row['items_sold'],
                'revenue' => $row['revenue'],
                'revenue_share' => $totalCategoryRevenue > 0
                    ? round(($row['revenue'] / $totalCategoryRevenue) * 100, 1)
                    : 0.0,
            ],
            array_values($categoryMetrics),
        );

        usort($categoryRows, static fn (array $a, array $b): int => $b['revenue'] <=> $a['revenue']);

        return [
            'summary' => [
                'total_stores' => $stores->count(),
                'active_transacting_stores' => count($activeStores),
                'inactive_stores_count' => count($inactiveStores),
                'total_categories' => $categories->count(),
            ],
            'stores' => $activeStores,
            'inactiveStores' => $inactiveStores,
            'categories' => $categoryRows,
        ];
    }

    /**
     * @param  Collection<int, Order>  $allOrders
     * @param  Collection<int, Order>  $scopedOrders
     * @return array<string, mixed>
     */
    private function buildOperationsAndReviewsReport(
        Collection $allOrders,
        Collection $scopedOrders,
        CarbonImmutable $currentStart,
        CarbonImmutable $currentEnd,
        ?int $storeId,
        ?int $categoryId,
    ): array {
        $buyerIds = $scopedOrders->pluck('user_id')->filter()->unique()->values()->all();
        $priorBuyerIds = [];

        if ($buyerIds !== []) {
            $priorBuyerIds = Order::query()
                ->whereIn('user_id', $buyerIds)
                ->whereIn('status', self::VALID_STATUSES)
                ->where('created_at', '<', $currentStart)
                ->distinct()
                ->pluck('user_id')
                ->all();
        }

        $priorBuyerMap = array_fill_keys($priorBuyerIds, true);
        $newBuyers = 0;
        $returningBuyers = 0;

        foreach ($buyerIds as $buyerId) {
            if (isset($priorBuyerMap[$buyerId])) {
                $returningBuyers++;
            } else {
                $newBuyers++;
            }
        }

        $totalBuyers = count($buyerIds);
        $repeatRate = $totalBuyers > 0 ? round(($returningBuyers / $totalBuyers) * 100, 1) : 0.0;

        $buyerAggregates = [];
        foreach ($scopedOrders as $order) {
            $uid = (string) $order->user_id;
            $buyer = $order->user;

            if (! isset($buyerAggregates[$uid])) {
                $buyerAggregates[$uid] = [
                    'id' => $uid,
                    'name' => $buyer instanceof User ? $buyer->name : 'Pelanggan',
                    'email' => $buyer instanceof User ? $buyer->email : '-',
                    'orders_count' => 0,
                    'total_spent' => 0,
                    'is_returning' => isset($priorBuyerMap[$uid]),
                    'last_order_at' => $order->created_at,
                ];
            }

            $buyerAggregates[$uid]['orders_count']++;
            $buyerAggregates[$uid]['total_spent'] += (int) $order->total_amount;

            if ($order->created_at !== null && ($buyerAggregates[$uid]['last_order_at'] === null || $order->created_at->gt($buyerAggregates[$uid]['last_order_at']))) {
                $buyerAggregates[$uid]['last_order_at'] = $order->created_at;
            }
        }

        usort($buyerAggregates, static fn (array $a, array $b): int => $b['total_spent'] <=> $a['total_spent']);

        $topBuyers = array_map(
            fn (array $buyer): array => [
                'id' => $buyer['id'],
                'name' => $buyer['name'],
                'email' => $buyer['email'],
                'orders_count' => $buyer['orders_count'],
                'total_spent' => $buyer['total_spent'],
                'is_returning' => $buyer['is_returning'],
                'last_order_at_label' => $buyer['last_order_at'] instanceof CarbonInterface
                    ? $this->formatDateTime($buyer['last_order_at'])
                    : '-',
            ],
            array_slice($buyerAggregates, 0, 15),
        );

        $hoursToShip = [];
        $hoursToComplete = [];
        $cancellationReasonsMap = [];

        foreach ($allOrders as $order) {
            if ($order->paid_at !== null && $order->shipped_at !== null && $order->shipped_at->gte($order->paid_at)) {
                $hoursToShip[] = $order->paid_at->diffInMinutes($order->shipped_at) / 60;
            }

            if ($order->shipped_at !== null && $order->completed_at !== null && $order->completed_at->gte($order->shipped_at)) {
                $hoursToComplete[] = $order->shipped_at->diffInMinutes($order->completed_at) / 60;
            }

            if ($order->status === OrderStatus::Cancelled) {
                $reason = trim((string) ($order->cancellation_reason ?: 'Alasan tidak dicantumkan'));

                if (! isset($cancellationReasonsMap[$reason])) {
                    $cancellationReasonsMap[$reason] = [
                        'reason' => $reason,
                        'count' => 0,
                        'amount' => 0,
                    ];
                }

                $cancellationReasonsMap[$reason]['count']++;
                $cancellationReasonsMap[$reason]['amount'] += (int) $order->total_amount;
            }
        }

        usort($cancellationReasonsMap, static fn (array $a, array $b): int => $b['count'] <=> $a['count']);

        $reviewsQuery = ProductReview::query()
            ->select(['id', 'product_id', 'rating', 'is_hidden', 'admin_reply'])
            ->whereBetween('created_at', [$currentStart, $currentEnd]);

        if ($storeId !== null || $categoryId !== null) {
            $reviewsQuery->whereHas('product', function (Builder $productQuery) use ($storeId, $categoryId): void {
                if ($storeId !== null) {
                    $productQuery->where('store_id', $storeId);
                }

                if ($categoryId !== null) {
                    $productQuery->where('category_id', $categoryId);
                }
            });
        }

        $reviews = $reviewsQuery->get();
        $totalReviews = $reviews->count();
        $hiddenReviews = $reviews->where('is_hidden', true)->count();
        $visibleReviews = $totalReviews - $hiddenReviews;
        $repliedReviews = $reviews->filter(
            static fn (ProductReview $review): bool => trim((string) $review->admin_reply) !== '',
        )->count();
        $averageRating = $totalReviews > 0 ? round((float) $reviews->avg('rating'), 2) : 0.0;
        $replyRate = $totalReviews > 0 ? round(($repliedReviews / $totalReviews) * 100, 1) : 0.0;

        $ratingDistribution = [];
        for ($star = 5; $star >= 1; $star--) {
            $count = $reviews->where('rating', $star)->count();
            $ratingDistribution[] = [
                'rating' => $star,
                'count' => $count,
                'percentage' => $totalReviews > 0 ? round(($count / $totalReviews) * 100, 1) : 0.0,
            ];
        }

        return [
            'customers' => [
                'total_buyers' => $totalBuyers,
                'new_buyers' => $newBuyers,
                'returning_buyers' => $returningBuyers,
                'repeat_rate' => $repeatRate,
                'top_buyers' => $topBuyers,
            ],
            'fulfillment' => [
                'avg_hours_to_ship' => count($hoursToShip) > 0 ? round(array_sum($hoursToShip) / count($hoursToShip), 1) : null,
                'avg_hours_to_complete' => count($hoursToComplete) > 0 ? round(array_sum($hoursToComplete) / count($hoursToComplete), 1) : null,
                'shipped_sample_count' => count($hoursToShip),
                'completed_sample_count' => count($hoursToComplete),
                'cancellation_reasons' => array_slice($cancellationReasonsMap, 0, 10),
            ],
            'reviews' => [
                'total_reviews' => $totalReviews,
                'visible_reviews' => $visibleReviews,
                'hidden_reviews' => $hiddenReviews,
                'replied_reviews' => $repliedReviews,
                'reply_rate' => $replyRate,
                'average_rating' => $averageRating,
                'distribution' => $ratingDistribution,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildFilterOptions(CarbonImmutable $now): array
    {
        $earliestOrderDate = Order::query()->min('created_at');
        $minYear = is_string($earliestOrderDate)
            ? min($now->year, CarbonImmutable::parse($earliestOrderDate)->year)
            : $now->year;

        $years = [];
        for ($year = $now->year; $year >= max(2020, $minYear - 1); $year--) {
            $years[] = $year;
        }

        return [
            'stores' => Store::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get()
                ->map(static fn (Store $store): array => [
                    'id' => $store->id,
                    'name' => $store->name,
                ])
                ->all(),
            'categories' => Category::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get()
                ->map(static fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                ])
                ->all(),
            'years' => $years,
            'months' => collect(ReportPeriodResolver::FULL_MONTHS)
                ->map(static fn (string $label, int $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
            'quarters' => collect(ReportPeriodResolver::QUARTER_LABELS)
                ->map(static fn (string $label, int $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
            'paymentMethods' => collect(self::PAYMENT_METHOD_LABELS)
                ->map(static fn (string $label, string $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
            'statusScopes' => collect(self::STATUS_SCOPE_LABELS)
                ->map(static fn (string $label, string $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array{store_id: ?int, category_id: ?int, payment_method: ?string, status_scope: string}  $dimensions
     * @param  array<string, mixed>  $options
     */
    private function buildActiveFilterSummary(array $dimensions, array $options): string
    {
        $parts = [];

        if ($dimensions['store_id'] !== null && is_array($options['stores'] ?? null)) {
            foreach ($options['stores'] as $store) {
                if (is_array($store) && ($store['id'] ?? null) === $dimensions['store_id'] && isset($store['name'])) {
                    $parts[] = 'Toko: '.$store['name'];
                    break;
                }
            }
        }

        if ($dimensions['category_id'] !== null && is_array($options['categories'] ?? null)) {
            foreach ($options['categories'] as $category) {
                if (is_array($category) && ($category['id'] ?? null) === $dimensions['category_id'] && isset($category['name'])) {
                    $parts[] = 'Kategori: '.$category['name'];
                    break;
                }
            }
        }

        if ($dimensions['payment_method'] !== null) {
            $parts[] = 'Pembayaran: '.(self::PAYMENT_METHOD_LABELS[$dimensions['payment_method']] ?? $dimensions['payment_method']);
        }

        $parts[] = self::STATUS_SCOPE_LABELS[$dimensions['status_scope']] ?? self::STATUS_SCOPE_LABELS['valid'];

        return implode(' • ', $parts);
    }

    /**
     * @param  Collection<int, Order>  $orders
     */
    private function calculateNetRevenue(Collection $orders): int
    {
        return (int) $orders->sum(
            static fn (Order $order): int => max(0, (int) $order->subtotal - (int) $order->discount_amount + (int) $order->service_fee),
        );
    }

    private function calculateGrowthPercent(int|float $current, int|float $previous): ?float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * @return array<string, mixed>
     */
    private function makeEmptyBucket(string $key, string $label, string $fullLabel): array
    {
        return [
            'key' => $key,
            'label' => $label,
            'full_label' => $fullLabel,
            'all_orders_count' => 0,
            'orders_count' => 0,
            'completed_count' => 0,
            'cancelled_count' => 0,
            'subtotal' => 0,
            'discount_amount' => 0,
            'shipping_fee' => 0,
            'service_fee' => 0,
            'net_revenue' => 0,
            'total_amount' => 0,
        ];
    }

    private function bucketKeyForTimestamp(CarbonInterface $timestamp, string $granularity): string
    {
        return match ($granularity) {
            'hour' => $timestamp->format('H'),
            'month' => $timestamp->format('Y-m'),
            default => $timestamp->format('Y-m-d'),
        };
    }

    /**
     * @return list<string>|null
     */
    private function resolveStatusesForScope(string $statusScope): ?array
    {
        return match ($statusScope) {
            'completed' => [OrderStatus::Completed->value],
            'all' => null,
            default => self::VALID_STATUSES,
        };
    }

    private function normalizePositiveInt(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }

        $intVal = (int) $value;

        return $intVal > 0 ? $intVal : null;
    }

    private function normalizePaymentMethod(string $value): ?string
    {
        $trimmed = trim($value);

        return array_key_exists($trimmed, self::PAYMENT_METHOD_LABELS) ? $trimmed : null;
    }

    private function normalizeStatusScope(string $value): string
    {
        $trimmed = trim($value);

        return array_key_exists($trimmed, self::STATUS_SCOPE_LABELS) ? $trimmed : 'valid';
    }

    private function normalizeTab(string $value): string
    {
        return match (trim($value)) {
            'sales', 'products', 'stores', 'operations' => trim($value),
            default => 'overview',
        };
    }

    private function formatShippingLabel(string $raw): string
    {
        $lower = strtolower($raw);

        if (str_contains($lower, 'sameday') || str_contains($lower, 'same_day')) {
            return 'Kirim Hari yang Sama';
        }

        if (str_contains($lower, 'instant')) {
            return 'Pengiriman Instan';
        }

        if (str_contains($lower, 'pickup') || str_contains($lower, 'ambil')) {
            return 'Ambil di Gerai';
        }

        return $raw;
    }

    private function formatDateTime(CarbonInterface $timestamp): string
    {
        return $timestamp->day
            .' '.ReportPeriodResolver::SHORT_MONTHS[$timestamp->month]
            .' '.$timestamp->year
            .', '.$timestamp->format('H:i');
    }
}
