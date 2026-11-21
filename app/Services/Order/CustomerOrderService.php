<?php

namespace App\Services\Order;

use App\Contracts\Cart\CartServiceInterface;
use App\Contracts\Order\CustomerOrderServiceInterface;
use App\Enums\Order\OrderStatus;
use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderStatusHistory;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerOrderService implements CustomerOrderServiceInterface
{
    private const int PER_PAGE = 10;

    public function __construct(
        public readonly CartServiceInterface $cartService,
    ) {}

    public function getOrdersPageData(User $user, array $filters): array
    {
        $status = $this->normalizeStatus($filters['status'] ?? null);
        $search = is_string($filters['search'] ?? null) ? trim($filters['search']) : '';
        $preset = $this->normalizePreset($filters['preset'] ?? null);
        $dateFrom = $this->normalizeDate($filters['date_from'] ?? null);
        $dateTo = $this->normalizeDate($filters['date_to'] ?? null);

        $statusCounts = $this->buildStatusCounts($user);

        $query = Order::query()
            ->where('user_id', $user->id)
            ->with([
                'store:id,name,slug,location,whatsapp_number,is_verified',
                'items' => fn ($itemQuery) => $itemQuery->with([
                    'product' => fn ($productQuery) => $productQuery
                        ->select(['id', 'slug', 'stock', 'is_active'])
                        ->with('primaryImage'),
                    'review:id,order_item_id,rating,comment,created_at',
                ]),
                'statusHistories',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function (Builder $searchQuery) use ($like): void {
                $searchQuery
                    ->where('order_number', 'like', $like)
                    ->orWhereHas('store', fn (Builder $storeQuery) => $storeQuery->where('name', 'like', $like))
                    ->orWhereHas('items', fn (Builder $itemQuery) => $itemQuery->where('product_name', 'like', $like));
            });
        }

        if ($preset === '30d') {
            $query->where('created_at', '>=', now()->subDays(30)->startOfDay());
        } elseif ($preset === '90d') {
            $query->where('created_at', '>=', now()->subDays(90)->startOfDay());
        } else {
            if ($dateFrom instanceof Carbon) {
                $query->where('created_at', '>=', $dateFrom->copy()->startOfDay());
            }

            if ($dateTo instanceof Carbon) {
                $query->where('created_at', '<=', $dateTo->copy()->endOfDay());
            }
        }

        $paginator = $query->paginate(self::PER_PAGE)->withQueryString();

        $formattedOrders = collect($paginator->items())
            ->map(fn (Order $order): array => $this->formatOrder($order))
            ->values()
            ->all();

        return [
            'orders' => [
                'data' => $formattedOrders,
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'statusCounts' => $statusCounts,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'preset' => $preset,
                'date_from' => $dateFrom?->toDateString() ?? '',
                'date_to' => $dateTo?->toDateString() ?? '',
            ],
        ];
    }

    public function getActiveOrderCount(User $user): int
    {
        return Order::query()
            ->where('user_id', $user->id)
            ->whereIn('status', OrderStatus::activeValues())
            ->count();
    }

    public function buyAgain(User $user, Order $order): array
    {
        $order->loadMissing(['items.product']);

        $cart = $this->cartService->resolveCart($user, null, true);
        $existingQuantities = [];

        if ($cart instanceof Cart) {
            $existingQuantities = $cart->items()
                ->pluck('quantity', 'product_id')
                ->map(fn ($qty): int => (int) $qty)
                ->all();
        }

        $addedCount = 0;
        $skippedNames = [];

        foreach ($order->items as $item) {
            $product = $item->product;

            if (! $product instanceof Product || ! $product->is_active || $product->stock < 1) {
                $skippedNames[] = $item->product_name;

                continue;
            }

            $alreadyInCart = $existingQuantities[$product->id] ?? 0;
            $remainingCapacity = $product->stock - $alreadyInCart;

            if ($remainingCapacity < 1) {
                $addedCount += 1;

                if ($cart instanceof Cart) {
                    $cartItem = $cart->items()->where('product_id', $product->id)->first();

                    if ($cartItem instanceof CartItem && ! $cartItem->is_selected) {
                        $this->cartService->toggleItemSelection($cart, $cartItem, true);
                    }
                }

                continue;
            }

            $qtyToAdd = min($item->quantity, $remainingCapacity);
            $this->cartService->addItem(
                user: $user,
                guestToken: null,
                productId: $product->id,
                quantity: $qtyToAdd,
                buyNow: false,
            );
            $existingQuantities[$product->id] = $alreadyInCart + $qtyToAdd;
            $addedCount += 1;
        }

        return [
            'addedCount' => $addedCount,
            'skippedNames' => $skippedNames,
        ];
    }

    public function cancelOrder(User $user, Order $order, string $reason): Order
    {
        if ($order->status !== OrderStatus::PendingPayment) {
            throw ValidationException::withMessages([
                'order' => 'Hanya pesanan yang masih menunggu pembayaran yang dapat dibatalkan.',
            ]);
        }

        return DB::transaction(function () use ($order, $reason): Order {
            $cleanReason = trim($reason);
            $now = now();

            $order->forceFill([
                'status' => OrderStatus::Cancelled,
                'payment_status' => 'cancelled',
                'cancellation_reason' => $cleanReason,
                'cancelled_at' => $now,
            ])->save();

            $order->statusHistories()->create([
                'status' => OrderStatus::Cancelled->value,
                'title' => 'Pesanan dibatalkan oleh pembeli',
                'description' => 'Alasan: '.$cleanReason,
                'location' => 'Sistem Kossuma Kota Bogor',
                'occurred_at' => $now,
            ]);

            return $order->fresh() ?? $order;
        });
    }

    public function confirmReceived(User $user, Order $order): Order
    {
        if ($order->status !== OrderStatus::Shipped) {
            throw ValidationException::withMessages([
                'order' => 'Hanya pesanan yang sedang dikirim yang dapat dikonfirmasi telah diterima.',
            ]);
        }

        return DB::transaction(function () use ($order): Order {
            $now = now();
            $district = is_string($order->shipping_address_snapshot['district'] ?? null)
                ? $order->shipping_address_snapshot['district']
                : 'Kota Bogor';

            $order->forceFill([
                'status' => OrderStatus::Completed,
                'completed_at' => $now,
            ])->save();

            $order->statusHistories()->create([
                'status' => OrderStatus::Completed->value,
                'title' => 'Pesanan dikonfirmasi diterima oleh pembeli',
                'description' => 'Terima kasih sudah berbelanja produk UMKM binaan Kossuma Kota Bogor.',
                'location' => $district,
                'occurred_at' => $now,
            ]);

            return $order->fresh() ?? $order;
        });
    }

    public function submitItemReview(
        User $user,
        Order $order,
        int $orderItemId,
        int $rating,
        string $comment,
    ): ProductReview {
        if ($order->status !== OrderStatus::Completed) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Ulasan hanya dapat ditulis untuk pesanan yang sudah selesai.',
            ]);
        }

        $orderItem = $order->items()
            ->with(['product', 'review'])
            ->where('id', $orderItemId)
            ->first();

        if (! $orderItem instanceof OrderItem) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Produk pada pesanan ini tidak ditemukan.',
            ]);
        }

        if ($orderItem->review instanceof ProductReview) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Produk pada pesanan ini sudah pernah Anda ulas.',
            ]);
        }

        $product = $orderItem->product;

        if (! $product instanceof Product) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Produk sudah tidak tersedia untuk diulas.',
            ]);
        }

        return DB::transaction(function () use ($user, $order, $orderItem, $product, $rating, $comment): ProductReview {
            $district = is_string($order->shipping_address_snapshot['district'] ?? null)
                ? $order->shipping_address_snapshot['district']
                : null;

            $review = ProductReview::query()->create([
                'product_id' => $product->id,
                'user_id' => $user->id,
                'order_item_id' => $orderItem->id,
                'author_name' => $user->name,
                'author_location' => $district !== null && $district !== '' ? $district.', Kota Bogor' : 'Kota Bogor',
                'rating' => $rating,
                'variant' => $orderItem->unit_label,
                'comment' => trim($comment),
            ]);

            $stats = ProductReview::query()
                ->where('product_id', $product->id)
                ->selectRaw('COUNT(*) as aggregate_count, AVG(rating) as aggregate_avg')
                ->first();

            $count = (int) ($stats?->getAttribute('aggregate_count') ?? 0);
            $avg = round((float) ($stats?->getAttribute('aggregate_avg') ?? 0), 2);

            $product->forceFill([
                'reviews_count' => $count,
                'rating_avg' => $avg,
            ])->save();

            return $review;
        });
    }

    /**
     * @return array<string, int>
     */
    private function buildStatusCounts(User $user): array
    {
        $rows = Order::query()
            ->where('user_id', $user->id)
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

    /**
     * @return array<string, mixed>
     */
    private function formatOrder(Order $order): array
    {
        $store = $order->store;
        $storeName = $store instanceof Store ? $store->name : 'Mitra UMKM Kossuma';
        $storeLocation = $store instanceof Store ? $store->location : 'Kota Bogor';
        $storeWhatsapp = $store instanceof Store ? $store->resolvedWhatsappNumber() : '6281289005544';

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
                    'canBuyAgain' => $product instanceof Product && $product->is_active && $product->stock > 0,
                    'isReviewed' => $review instanceof ProductReview,
                    'review' => $review instanceof ProductReview ? [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'createdAt' => $review->created_at?->toIso8601String(),
                    ] : null,
                ];
            })
            ->values()
            ->all();

        $unreviewedCount = collect($items)
            ->filter(fn (array $item): bool => ! $item['isReviewed'] && $item['productId'] !== null)
            ->count();

        $firstItemName = $items[0]['productName'] ?? 'Pesanan Kossuma';
        $waText = rawurlencode(
            "Assalamu'alaikum {$storeName}, saya ingin bertanya mengenai pesanan {$order->order_number} ({$firstItemName})."
        );

        $histories = $order->statusHistories
            ->map(fn (OrderStatusHistory $history): array => [
                'id' => $history->id,
                'status' => $history->status,
                'title' => $history->title,
                'description' => $history->description,
                'location' => $history->location,
                'occurredAt' => $history->occurred_at->toIso8601String(),
                'occurredAtLabel' => $this->formatIndonesianDate($history->occurred_at, true),
            ])
            ->values()
            ->all();

        return [
            'id' => $order->id,
            'orderNumber' => $order->order_number,
            'status' => $order->status->value,
            'statusLabel' => $order->status->label(),
            'createdAt' => $order->created_at?->toIso8601String(),
            'createdAtLabel' => $this->formatIndonesianDate($order->created_at, false),
            'createdAtFullLabel' => $this->formatIndonesianDate($order->created_at, true),
            'paymentMethod' => $order->payment_method,
            'paymentChannel' => $order->payment_channel ?? strtoupper($order->payment_method),
            'paymentStatus' => $order->payment_status,
            'paymentDueAtLabel' => $order->payment_due_at !== null
                ? $this->formatIndonesianDate($order->payment_due_at, true)
                : null,
            'shippingMethod' => $order->shipping_method,
            'shippingCourier' => $order->shipping_courier ?? 'Kurir Koperasi Kossuma',
            'trackingNumber' => $order->tracking_number,
            'shippingAddress' => [
                'label' => (string) ($order->shipping_address_snapshot['label'] ?? 'Alamat'),
                'recipientName' => (string) ($order->shipping_address_snapshot['recipientName'] ?? ''),
                'phone' => (string) ($order->shipping_address_snapshot['phone'] ?? ''),
                'fullAddress' => (string) ($order->shipping_address_snapshot['fullAddress'] ?? ''),
                'district' => (string) ($order->shipping_address_snapshot['district'] ?? ''),
                'city' => (string) ($order->shipping_address_snapshot['city'] ?? ''),
                'postalCode' => (string) ($order->shipping_address_snapshot['postalCode'] ?? ''),
                'courierNote' => (string) ($order->shipping_address_snapshot['courierNote'] ?? ''),
            ],
            'subtotal' => $order->subtotal,
            'shippingFee' => $order->shipping_fee,
            'discountAmount' => $order->discount_amount,
            'serviceFee' => $order->service_fee,
            'totalAmount' => $order->total_amount,
            'customerNote' => $order->customer_note,
            'cancellationReason' => $order->cancellation_reason,
            'store' => [
                'id' => $store instanceof Store ? $store->id : $order->store_id,
                'name' => $storeName,
                'location' => $storeLocation,
                'whatsappUrl' => "https://wa.me/{$storeWhatsapp}?text={$waText}",
            ],
            'items' => $items,
            'histories' => $histories,
            'actions' => [
                'canPay' => $order->status === OrderStatus::PendingPayment,
                'canCancel' => $order->status === OrderStatus::PendingPayment,
                'canTrack' => in_array($order->status, [
                    OrderStatus::Processing,
                    OrderStatus::Shipped,
                    OrderStatus::Completed,
                ], true),
                'canConfirmReceived' => $order->status === OrderStatus::Shipped,
                'canReview' => $order->status === OrderStatus::Completed && $unreviewedCount > 0,
                'allReviewed' => $order->status === OrderStatus::Completed && $unreviewedCount === 0 && count($items) > 0,
                'canBuyAgain' => collect($items)->contains(fn (array $item): bool => $item['canBuyAgain']),
            ],
        ];
    }

    private function normalizeStatus(?string $status): string
    {
        if (! is_string($status) || $status === '' || $status === 'all') {
            return 'all';
        }

        return in_array($status, OrderStatus::values(), true) ? $status : 'all';
    }

    private function normalizePreset(?string $preset): string
    {
        return match ($preset) {
            '30d', '90d', 'custom' => $preset,
            default => 'all',
        };
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

    private function normalizeDate(?string $value): ?Carbon
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
}
