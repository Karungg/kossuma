<?php

namespace App\Services\Order;

use App\Contracts\Order\AdminOrderServiceInterface;
use App\Enums\Order\OrderStatus;
use App\Models\Order\Order;
use App\Models\Order\OrderInternalNote;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderStatusHistory;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminOrderService implements AdminOrderServiceInterface
{
    private const array SORTABLE_COLUMNS = [
        'created_at',
        'total_amount',
        'order_number',
        'status',
    ];

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $paginator = $this->buildQuery($filters)
            ->paginate($perPage)
            ->withQueryString();

        $paginator->setCollection(
            $paginator->getCollection()->map(
                fn (Order $order): array => $this->formatOrderRow($order),
            ),
        );

        /** @var LengthAwarePaginator<int, array<string, mixed>> $paginator */
        return $paginator;
    }

    public function getForExport(array $filters = [], array $ids = []): Collection
    {
        $query = $this->buildQuery($filters);

        if ($ids !== []) {
            $query->whereIn('id', $ids);
        }

        return $query->get();
    }

    public function getStats(): array
    {
        $statusCounts = $this->getStatusCounts();
        $completedRevenue = (int) Order::query()
            ->where('status', OrderStatus::Completed->value)
            ->sum('total_amount');
        $needsAttention = $this->applyNeedsAttentionFilter(Order::query())->count();

        return [
            'total' => $statusCounts['all'],
            'pending_payment' => $statusCounts[OrderStatus::PendingPayment->value],
            'processing' => $statusCounts[OrderStatus::Processing->value],
            'shipped' => $statusCounts[OrderStatus::Shipped->value],
            'completed' => $statusCounts[OrderStatus::Completed->value],
            'cancelled' => $statusCounts[OrderStatus::Cancelled->value],
            'needs_attention' => $needsAttention,
            'completed_revenue' => $completedRevenue,
        ];
    }

    public function getStatusCounts(): array
    {
        $rows = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $counts = [
            'all' => 0,
            OrderStatus::PendingPayment->value => 0,
            OrderStatus::Processing->value => 0,
            OrderStatus::Shipped->value => 0,
            OrderStatus::Completed->value => 0,
            OrderStatus::Cancelled->value => 0,
        ];

        foreach ($rows as $statusKey => $total) {
            $key = (string) $statusKey;
            $intTotal = (int) $total;

            if (array_key_exists($key, $counts)) {
                $counts[$key] = $intTotal;
            }

            $counts['all'] += $intTotal;
        }

        return $counts;
    }

    public function getFilterOptions(): array
    {
        $couriers = Order::query()
            ->whereNotNull('shipping_courier')
            ->where('shipping_courier', '!=', '')
            ->distinct()
            ->orderBy('shipping_courier')
            ->pluck('shipping_courier')
            ->values()
            ->all();

        /** @var array<string, array<string, mixed>> $courierConfig */
        $courierConfig = config('shipping.couriers', []);
        $configuredCouriers = [];

        foreach ($courierConfig as $entry) {
            if (is_string($entry['name'] ?? null) && $entry['name'] !== '') {
                $configuredCouriers[] = $entry['name'];
            }
        }

        $mergedCouriers = collect([...$couriers, ...$configuredCouriers])
            ->unique()
            ->sort()
            ->values()
            ->all();

        return [
            'stores' => Store::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Store $store): array => [
                    'id' => $store->id,
                    'name' => $store->name,
                ])
                ->all(),
            'products' => Product::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                ])
                ->all(),
            'couriers' => $mergedCouriers,
        ];
    }

    public function getOrderDetail(Order $order): array
    {
        $order->load([
            'user:id,name,email,phone',
            'store:id,name,slug,location,whatsapp_number,is_verified',
            'items' => fn ($itemQuery) => $itemQuery->with([
                'product' => fn ($productQuery) => $productQuery
                    ->select(['id', 'name', 'slug', 'stock', 'is_active'])
                    ->with('primaryImage'),
                'review:id,order_item_id,product_id,author_name,rating,comment,is_hidden,hidden_reason,admin_reply,admin_replied_at,created_at',
            ]),
            'statusHistories.actor:id,name',
            'internalNotes.admin:id,name',
        ]);

        $store = $order->store;
        $user = $order->user;

        $address = $this->formatShippingAddress($order);
        $customerName = $address['recipientName'] !== '' ? $address['recipientName'] : ($user instanceof User ? $user->name : 'Pembeli Kossuma');
        $customerPhone = $address['phone'] !== '' ? $address['phone'] : ($user instanceof User ? (string) ($user->phone ?? '') : '');
        $customerWaNumber = $this->normalizeWhatsappNumber($customerPhone);

        $storeName = $store instanceof Store ? $store->name : 'Mitra UMKM Kossuma';
        $storeLocation = $store instanceof Store ? $store->location : 'Kota Bogor';
        $storeWaNumber = $store instanceof Store ? $store->resolvedWhatsappNumber() : '6281289005544';

        $items = $order->items
            ->map(function (OrderItem $item): array {
                $product = $item->product;
                $imageUrl = $item->product_image_path !== null
                    ? Product::resolveImageUrl($item->product_image_path, true)
                    : $product?->getPrimaryImageUrl(true);
                $review = $item->review;

                return [
                    'id' => $item->id,
                    'productId' => $item->product_id,
                    'productName' => $item->product_name,
                    'productSlug' => $product instanceof Product ? $product->slug : $item->product_slug,
                    'imageUrl' => $imageUrl,
                    'unitLabel' => $item->unit_label ?? '',
                    'price' => $item->price,
                    'originalPrice' => $item->original_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                    'review' => $review instanceof ProductReview ? [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'isHidden' => $review->is_hidden,
                        'hiddenReason' => $review->hidden_reason,
                        'adminReply' => $review->admin_reply,
                        'createdAtLabel' => $this->formatIndonesianDate($review->created_at, true),
                    ] : null,
                ];
            })
            ->values()
            ->all();

        $itemSummary = collect($items)
            ->map(fn (array $item): string => "{$item['productName']} ({$item['quantity']}x)")
            ->take(3)
            ->implode(', ');

        $customerWaText = rawurlencode($this->buildCustomerFollowUpMessage($order, $customerName, $storeName));
        $storeWaText = rawurlencode(
            "Assalamu'alaikum {$storeName}, saya Admin Kossuma Kota Bogor ingin menindaklanjuti pesanan {$order->order_number} ({$itemSummary}) dengan status {$order->status->label()}."
        );

        $courierInfo = $this->resolveCourierInfo($order);

        $histories = $order->statusHistories
            ->map(fn (OrderStatusHistory $history): array => [
                'id' => $history->id,
                'status' => $history->status,
                'title' => $history->title,
                'description' => $history->description,
                'location' => $history->location,
                'actorType' => $history->actor_type,
                'actorName' => $history->actor instanceof User ? $history->actor->name : null,
                'occurredAt' => $history->occurred_at->toIso8601String(),
                'occurredAtLabel' => $this->formatIndonesianDate($history->occurred_at, true),
            ])
            ->values()
            ->all();

        $internalNotes = $order->internalNotes
            ->map(fn (OrderInternalNote $note): array => [
                'id' => $note->id,
                'note' => $note->note,
                'adminName' => $note->admin instanceof User ? $note->admin->name : 'Admin Kossuma',
                'createdAt' => $note->created_at?->toIso8601String(),
                'createdAtLabel' => $this->formatIndonesianDate($note->created_at, true),
            ])
            ->values()
            ->all();

        return [
            'id' => $order->id,
            'orderNumber' => $order->order_number,
            'status' => $order->status->value,
            'statusLabel' => $order->status->label(),
            'paymentMethod' => $order->payment_method,
            'paymentChannel' => $order->payment_channel ?? strtoupper($order->payment_method),
            'paymentStatus' => $order->payment_status,
            'paymentStatusLabel' => $this->paymentStatusLabel($order->payment_status),
            'paymentDueAtLabel' => $this->formatIndonesianDate($order->payment_due_at, true) ?: null,
            'paidAtLabel' => $this->formatIndonesianDate($order->paid_at, true) ?: null,
            'shippedAtLabel' => $this->formatIndonesianDate($order->shipped_at, true) ?: null,
            'completedAtLabel' => $this->formatIndonesianDate($order->completed_at, true) ?: null,
            'cancelledAtLabel' => $this->formatIndonesianDate($order->cancelled_at, true) ?: null,
            'createdAtLabel' => $this->formatIndonesianDate($order->created_at, true),
            'shippingMethod' => $order->shipping_method,
            'shippingCourier' => $order->shipping_courier ?? 'Kurir Koperasi Kossuma',
            'trackingNumber' => $order->tracking_number,
            'shippingAddress' => $address,
            'subtotal' => $order->subtotal,
            'shippingFee' => $order->shipping_fee,
            'discountAmount' => $order->discount_amount,
            'serviceFee' => $order->service_fee,
            'totalAmount' => $order->total_amount,
            'customerNote' => $order->customer_note,
            'cancellationReason' => $order->cancellation_reason,
            'customer' => [
                'id' => $user instanceof User ? $user->id : $order->user_id,
                'name' => $user instanceof User ? $user->name : $customerName,
                'email' => $user instanceof User ? $user->email : '',
                'phone' => $customerPhone,
            ],
            'store' => [
                'id' => $store instanceof Store ? $store->id : $order->store_id,
                'name' => $storeName,
                'location' => $storeLocation,
                'whatsappNumber' => $store instanceof Store ? ($store->whatsapp_number ?? $storeWaNumber) : $storeWaNumber,
            ],
            'followUp' => [
                'customer' => [
                    'name' => $customerName,
                    'phone' => $customerPhone,
                    'email' => $user instanceof User ? $user->email : '',
                    'whatsappUrl' => $customerWaNumber !== null ? "https://wa.me/{$customerWaNumber}?text={$customerWaText}" : null,
                ],
                'store' => [
                    'name' => $storeName,
                    'location' => $storeLocation,
                    'phone' => $store instanceof Store ? ($store->whatsapp_number ?? $storeWaNumber) : $storeWaNumber,
                    'whatsappUrl' => "https://wa.me/{$storeWaNumber}?text={$storeWaText}",
                ],
                'courier' => $courierInfo,
            ],
            'items' => $items,
            'histories' => $histories,
            'internalNotes' => $internalNotes,
            'actions' => [
                'canConfirmPayment' => $order->status === OrderStatus::PendingPayment,
                'canShip' => in_array($order->status, [OrderStatus::Processing, OrderStatus::Shipped], true),
                'canAddTracking' => in_array($order->status, [OrderStatus::Processing, OrderStatus::Shipped], true),
                'canComplete' => $order->status === OrderStatus::Shipped,
                'canCancel' => in_array($order->status, [OrderStatus::PendingPayment, OrderStatus::Processing], true),
            ],
        ];
    }

    public function confirmPayment(User $admin, Order $order, ?string $note = null): Order
    {
        if ($order->status !== OrderStatus::PendingPayment) {
            throw ValidationException::withMessages([
                'order' => 'Hanya pesanan yang masih menunggu pembayaran yang dapat dikonfirmasi pembayarannya.',
            ]);
        }

        return DB::transaction(function () use ($admin, $order, $note): Order {
            $now = now();
            $cleanNote = is_string($note) ? trim($note) : '';

            $order->forceFill([
                'status' => OrderStatus::Processing,
                'payment_status' => 'paid',
                'paid_at' => $order->paid_at ?? $now,
            ])->save();

            $order->statusHistories()->create([
                'status' => OrderStatus::Processing->value,
                'title' => 'Pembayaran dikonfirmasi oleh Admin Kossuma',
                'description' => $cleanNote !== '' ? $cleanNote : 'Pembayaran telah diverifikasi dan pesanan diteruskan ke toko UMKM untuk disiapkan.',
                'location' => 'Admin Koperasi Kossuma',
                'actor_type' => 'admin',
                'actor_id' => $admin->id,
                'occurred_at' => $now,
            ]);

            return $order->fresh() ?? $order;
        });
    }

    public function shipOrder(
        User $admin,
        Order $order,
        string $shippingCourier,
        string $trackingNumber,
        ?string $note = null,
    ): Order {
        if (! in_array($order->status, [OrderStatus::Processing, OrderStatus::Shipped], true)) {
            throw ValidationException::withMessages([
                'order' => 'Nomor resi hanya dapat diisi untuk pesanan yang sedang diproses atau dikirim.',
            ]);
        }

        return DB::transaction(function () use ($admin, $order, $shippingCourier, $trackingNumber, $note): Order {
            $now = now();
            $isUpdatingExistingShipment = $order->status === OrderStatus::Shipped;
            $cleanCourier = trim($shippingCourier);
            $cleanTracking = trim($trackingNumber);
            $cleanNote = is_string($note) ? trim($note) : '';

            $order->forceFill([
                'status' => OrderStatus::Shipped,
                'shipping_courier' => $cleanCourier,
                'tracking_number' => $cleanTracking,
                'shipped_at' => $order->shipped_at ?? $now,
            ])->save();

            $order->statusHistories()->create([
                'status' => OrderStatus::Shipped->value,
                'title' => $isUpdatingExistingShipment
                    ? 'Informasi pengiriman diperbarui oleh Admin'
                    : 'Pesanan dikirim melalui '.$cleanCourier,
                'description' => $cleanNote !== ''
                    ? "Nomor resi: {$cleanTracking}. {$cleanNote}"
                    : "Nomor resi pengiriman: {$cleanTracking}.",
                'location' => $order->store instanceof Store ? $order->store->location : 'Kota Bogor',
                'actor_type' => 'admin',
                'actor_id' => $admin->id,
                'occurred_at' => $now,
            ]);

            return $order->fresh() ?? $order;
        });
    }

    public function addTrackingUpdate(
        User $admin,
        Order $order,
        string $title,
        ?string $description = null,
        ?string $location = null,
    ): OrderStatusHistory {
        if (! in_array($order->status, [OrderStatus::Processing, OrderStatus::Shipped], true)) {
            throw ValidationException::withMessages([
                'order' => 'Pembaruan pelacakan hanya dapat ditambahkan untuk pesanan yang sedang diproses atau dikirim.',
            ]);
        }

        return $order->statusHistories()->create([
            'status' => $order->status->value,
            'title' => trim($title),
            'description' => is_string($description) && trim($description) !== '' ? trim($description) : null,
            'location' => is_string($location) && trim($location) !== '' ? trim($location) : 'Kota Bogor',
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'occurred_at' => now(),
        ]);
    }

    public function completeOrder(User $admin, Order $order, ?string $note = null): Order
    {
        if ($order->status !== OrderStatus::Shipped) {
            throw ValidationException::withMessages([
                'order' => 'Hanya pesanan yang sedang dikirim yang dapat ditandai selesai.',
            ]);
        }

        return DB::transaction(function () use ($admin, $order, $note): Order {
            $now = now();
            $cleanNote = is_string($note) ? trim($note) : '';
            $district = is_string($order->shipping_address_snapshot['district'] ?? null)
                ? $order->shipping_address_snapshot['district']
                : 'Kota Bogor';

            $order->forceFill([
                'status' => OrderStatus::Completed,
                'completed_at' => $now,
            ])->save();

            $order->statusHistories()->create([
                'status' => OrderStatus::Completed->value,
                'title' => 'Pesanan ditandai selesai oleh Admin Kossuma',
                'description' => $cleanNote !== '' ? $cleanNote : 'Pesanan telah dipastikan diterima oleh pembeli.',
                'location' => $district,
                'actor_type' => 'admin',
                'actor_id' => $admin->id,
                'occurred_at' => $now,
            ]);

            return $order->fresh() ?? $order;
        });
    }

    public function cancelOrder(User $admin, Order $order, string $reason): Order
    {
        if (! in_array($order->status, [OrderStatus::PendingPayment, OrderStatus::Processing], true)) {
            throw ValidationException::withMessages([
                'order' => 'Hanya pesanan berstatus Menunggu Pembayaran atau Diproses yang dapat dibatalkan.',
            ]);
        }

        return DB::transaction(function () use ($admin, $order, $reason): Order {
            $now = now();
            $cleanReason = trim($reason);

            $order->loadMissing('items');

            foreach ($order->items as $item) {
                if ($item->product_id === null) {
                    continue;
                }

                $product = Product::query()
                    ->whereKey($item->product_id)
                    ->lockForUpdate()
                    ->first();

                if ($product instanceof Product) {
                    $product->increment('stock', $item->quantity);
                }
            }

            $order->forceFill([
                'status' => OrderStatus::Cancelled,
                'payment_status' => $order->payment_status === 'paid' ? 'refunded' : 'cancelled',
                'cancellation_reason' => $cleanReason,
                'cancelled_at' => $now,
            ])->save();

            $order->statusHistories()->create([
                'status' => OrderStatus::Cancelled->value,
                'title' => 'Pesanan dibatalkan oleh Admin Kossuma',
                'description' => 'Alasan: '.$cleanReason.'. Stok produk dikembalikan otomatis.',
                'location' => 'Admin Koperasi Kossuma',
                'actor_type' => 'admin',
                'actor_id' => $admin->id,
                'occurred_at' => $now,
            ]);

            return $order->fresh() ?? $order;
        });
    }

    public function addInternalNote(User $admin, Order $order, string $note): OrderInternalNote
    {
        return $order->internalNotes()->create([
            'admin_id' => $admin->id,
            'note' => trim($note),
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Order>
     */
    private function buildQuery(array $filters): Builder
    {
        $query = Order::query()
            ->with([
                'user:id,name,email,phone',
                'store:id,name,location,whatsapp_number',
                'items' => fn ($itemQuery) => $itemQuery->with([
                    'product:id,name,slug',
                    'review:id,order_item_id,rating,is_hidden',
                ]),
            ])
            ->withCount('internalNotes');

        $search = is_string($filters['search'] ?? null) ? trim($filters['search']) : '';

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function (Builder $searchQuery) use ($like): void {
                $searchQuery
                    ->where('order_number', 'like', $like)
                    ->orWhere('tracking_number', 'like', $like)
                    ->orWhereHas('user', fn (Builder $userQuery) => $userQuery
                        ->where('name', 'like', $like)
                        ->orWhere('phone', 'like', $like)
                        ->orWhere('email', 'like', $like))
                    ->orWhereHas('store', fn (Builder $storeQuery) => $storeQuery->where('name', 'like', $like))
                    ->orWhereHas('items', fn (Builder $itemQuery) => $itemQuery->where('product_name', 'like', $like));
            });
        }

        $status = is_string($filters['status'] ?? null) ? trim($filters['status']) : '';
        if ($status !== '' && $status !== 'all' && in_array($status, OrderStatus::values(), true)) {
            $query->where('status', $status);
        }

        $paymentStatus = is_string($filters['payment_status'] ?? null) ? trim($filters['payment_status']) : '';
        if ($paymentStatus !== '' && in_array($paymentStatus, ['unpaid', 'paid', 'cancelled', 'refunded'], true)) {
            $query->where('payment_status', $paymentStatus);
        }

        $paymentMethod = is_string($filters['payment_method'] ?? null) ? trim($filters['payment_method']) : '';
        if ($paymentMethod !== '' && in_array($paymentMethod, ['qris', 'bank_transfer', 'cod'], true)) {
            $query->where('payment_method', $paymentMethod);
        }

        if (isset($filters['store_id']) && is_numeric($filters['store_id'])) {
            $query->where('store_id', (int) $filters['store_id']);
        }

        if (isset($filters['product_id']) && is_numeric($filters['product_id'])) {
            $productId = (int) $filters['product_id'];
            $query->whereHas('items', fn (Builder $itemQuery) => $itemQuery->where('product_id', $productId));
        }

        $courier = is_string($filters['shipping_courier'] ?? null) ? trim($filters['shipping_courier']) : '';
        if ($courier !== '') {
            $query->where('shipping_courier', $courier);
        }

        $reviewStatus = is_string($filters['review_status'] ?? null) ? trim($filters['review_status']) : '';
        if ($reviewStatus === 'reviewed') {
            $query->whereHas('items.review');
        } elseif ($reviewStatus === 'unreviewed') {
            $query->where('status', OrderStatus::Completed->value)
                ->whereDoesntHave('items.review');
        }

        if (($filters['needs_attention'] ?? null) === '1' || ($filters['needs_attention'] ?? null) === true) {
            $this->applyNeedsAttentionFilter($query);
        }

        $dateFrom = $this->normalizeDate($filters['date_from'] ?? null);
        if ($dateFrom instanceof Carbon) {
            $query->where('created_at', '>=', $dateFrom->copy()->startOfDay());
        }

        $dateTo = $this->normalizeDate($filters['date_to'] ?? null);
        if ($dateTo instanceof Carbon) {
            $query->where('created_at', '<=', $dateTo->copy()->endOfDay());
        }

        $sort = is_string($filters['sort'] ?? null) && in_array($filters['sort'], self::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'created_at';
        $direction = ($filters['direction'] ?? null) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)->orderByDesc('id');
    }

    /**
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    private function applyNeedsAttentionFilter(Builder $query): Builder
    {
        return $query->where(function (Builder $attentionQuery): void {
            $attentionQuery
                ->where(function (Builder $processingStale): void {
                    $processingStale
                        ->where('status', OrderStatus::Processing->value)
                        ->where('created_at', '<=', now()->subHours(24));
                })
                ->orWhere(function (Builder $pendingExpiring): void {
                    $pendingExpiring
                        ->where('status', OrderStatus::PendingPayment->value)
                        ->whereNotNull('payment_due_at')
                        ->where('payment_due_at', '<=', now()->addHours(6));
                });
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOrderRow(Order $order): array
    {
        $address = $this->formatShippingAddress($order);
        $user = $order->user;
        $store = $order->store;
        $items = $order->items;

        $firstItem = $items->first();
        $totalQuantity = (int) $items->sum('quantity');
        $reviewedCount = $items->filter(fn (OrderItem $item): bool => $item->review instanceof ProductReview)->count();
        $itemsCount = $items->count();

        $customerName = $address['recipientName'] !== ''
            ? $address['recipientName']
            : ($user instanceof User ? $user->name : 'Pembeli');
        $customerPhone = $address['phone'] !== ''
            ? $address['phone']
            : ($user instanceof User ? (string) ($user->phone ?? '') : '');

        $needsAttention = (
            $order->status === OrderStatus::Processing
            && $order->created_at !== null
            && $order->created_at->lte(now()->subHours(24))
        ) || (
            $order->status === OrderStatus::PendingPayment
            && $order->payment_due_at !== null
            && $order->payment_due_at->lte(now()->addHours(6))
        );

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'payment_status' => $order->payment_status,
            'payment_status_label' => $this->paymentStatusLabel($order->payment_status),
            'payment_channel' => $order->payment_channel ?? strtoupper($order->payment_method),
            'shipping_courier' => $order->shipping_courier ?? 'Kurir Koperasi Kossuma',
            'tracking_number' => $order->tracking_number,
            'customer_name' => $customerName,
            'customer_phone' => $customerPhone,
            'store_name' => $store instanceof Store ? $store->name : 'Mitra UMKM Kossuma',
            'primary_item_name' => $firstItem instanceof OrderItem ? $firstItem->product_name : '-',
            'other_items_count' => max(0, $itemsCount - 1),
            'total_quantity' => $totalQuantity,
            'total_amount' => $order->total_amount,
            'reviewed_count' => $reviewedCount,
            'items_count' => $itemsCount,
            'internal_notes_count' => (int) $order->getAttribute('internal_notes_count'),
            'needs_attention' => $needsAttention,
            'created_at' => $order->created_at?->toIso8601String() ?? '',
        ];
    }

    /**
     * @return array<string, string>
     */
    private function formatShippingAddress(Order $order): array
    {
        $snapshot = $order->shipping_address_snapshot;

        return [
            'label' => (string) ($snapshot['label'] ?? 'Alamat'),
            'recipientName' => (string) ($snapshot['recipientName'] ?? ''),
            'phone' => (string) ($snapshot['phone'] ?? ''),
            'fullAddress' => (string) ($snapshot['fullAddress'] ?? ''),
            'district' => (string) ($snapshot['district'] ?? ''),
            'city' => (string) ($snapshot['city'] ?? ''),
            'postalCode' => (string) ($snapshot['postalCode'] ?? ''),
            'courierNote' => (string) ($snapshot['courierNote'] ?? ''),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveCourierInfo(Order $order): array
    {
        $courierName = trim((string) ($order->shipping_courier ?? $order->shipping_method));
        $lookupKey = mb_strtolower($courierName);

        /** @var array<string, array<string, mixed>> $directory */
        $directory = config('shipping.couriers', []);
        /** @var array<string, mixed> $fallback */
        $fallback = config('shipping.fallback', []);

        $matched = null;

        foreach ($directory as $key => $entry) {
            if ($lookupKey !== '' && str_contains($lookupKey, mb_strtolower((string) $key))) {
                $matched = $entry;

                break;
            }
        }

        $info = is_array($matched) ? $matched : $fallback;
        $trackingNumber = $order->tracking_number;

        $trackingUrl = null;
        if (is_string($info['tracking_url'] ?? null) && $info['tracking_url'] !== '') {
            $trackingUrl = str_replace(
                '{tracking_number}',
                rawurlencode((string) ($trackingNumber ?? '')),
                $info['tracking_url'],
            );
        }

        $waNumber = is_string($info['whatsapp'] ?? null) ? $this->normalizeWhatsappNumber($info['whatsapp']) : null;
        $courierWaText = rawurlencode(
            "Halo {$courierName}, kami dari Admin Koperasi Kossuma Kota Bogor ingin menanyakan status pengiriman untuk pesanan {$order->order_number}"
            .($trackingNumber !== null && $trackingNumber !== '' ? " dengan nomor resi {$trackingNumber}." : '.')
        );

        return [
            'name' => $courierName !== '' ? $courierName : 'Kurir Koperasi Kossuma',
            'method' => $order->shipping_method,
            'trackingNumber' => $trackingNumber,
            'phone' => is_string($info['phone'] ?? null) ? $info['phone'] : null,
            'whatsappUrl' => $waNumber !== null ? "https://wa.me/{$waNumber}?text={$courierWaText}" : null,
            'trackingUrl' => $trackingUrl,
            'notes' => is_string($info['notes'] ?? null) ? $info['notes'] : null,
        ];
    }

    private function buildCustomerFollowUpMessage(Order $order, string $customerName, string $storeName): string
    {
        return match ($order->status) {
            OrderStatus::PendingPayment => "Assalamu'alaikum Ibu/Bapak {$customerName}, kami dari Admin Kossuma Kota Bogor ingin mengonfirmasi pesanan {$order->order_number} di {$storeName} yang masih menunggu pembayaran. Apakah ada kendala saat melakukan pembayaran?",
            OrderStatus::Processing => "Assalamu'alaikum Ibu/Bapak {$customerName}, kami dari Admin Kossuma Kota Bogor menginformasikan bahwa pesanan {$order->order_number} di {$storeName} sedang disiapkan. Mohon kesediaannya menunggu informasi pengiriman.",
            OrderStatus::Shipped => "Assalamu'alaikum Ibu/Bapak {$customerName}, kami dari Admin Kossuma Kota Bogor ingin memastikan status pengiriman pesanan {$order->order_number} (resi: ".($order->tracking_number ?? '-').'). Apakah paket sudah diterima dengan baik?',
            OrderStatus::Completed => "Assalamu'alaikum Ibu/Bapak {$customerName}, terima kasih telah berbelanja di Kossuma Kota Bogor (pesanan {$order->order_number}). Kami siap membantu jika ada masukan atau kendala terkait pesanan Anda.",
            OrderStatus::Cancelled => "Assalamu'alaikum Ibu/Bapak {$customerName}, kami dari Admin Kossuma Kota Bogor ingin menindaklanjuti pembatalan pesanan {$order->order_number}. Silakan hubungi kami jika membutuhkan bantuan lebih lanjut.",
        };
    }

    private function paymentStatusLabel(string $status): string
    {
        return match ($status) {
            'paid' => 'Lunas',
            'unpaid' => 'Belum Dibayar',
            'refunded' => 'Dikembalikan',
            'cancelled' => 'Dibatalkan',
            default => $status,
        };
    }

    private function normalizeWhatsappNumber(?string $phone): ?string
    {
        if (! is_string($phone) || trim($phone) === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone);

        if (! is_string($digits) || $digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        return $digits;
    }

    private function normalizeDate(mixed $value): ?Carbon
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function formatIndonesianDate(?DateTimeInterface $date, bool $withTime): string
    {
        if (! $date instanceof DateTimeInterface) {
            return '';
        }

        $monthLabel = match ((int) $date->format('n')) {
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
        };

        $datePart = $date->format('d').' '.$monthLabel.' '.$date->format('Y');

        if (! $withTime) {
            return $datePart;
        }

        return $datePart.', '.$date->format('H:i').' WIB';
    }
}
