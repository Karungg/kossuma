<?php

namespace App\Models\Order;

use App\Enums\Order\OrderStatus;
use App\Models\Store\Store;
use App\Models\User;
use App\Policies\Order\OrderPolicy;
use Database\Factories\Order\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $order_number
 * @property string $user_id
 * @property int $store_id
 * @property OrderStatus $status
 * @property string $payment_method
 * @property string|null $payment_channel
 * @property string $payment_status
 * @property Carbon|null $payment_due_at
 * @property string $shipping_method
 * @property string|null $shipping_courier
 * @property string|null $tracking_number
 * @property array<string, mixed> $shipping_address_snapshot
 * @property int $subtotal
 * @property int $shipping_fee
 * @property int $discount_amount
 * @property int $service_fee
 * @property int $total_amount
 * @property string|null $customer_note
 * @property string|null $cancellation_reason
 * @property Carbon|null $paid_at
 * @property Carbon|null $shipped_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $cancelled_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_number',
    'user_id',
    'store_id',
    'status',
    'payment_method',
    'payment_channel',
    'payment_status',
    'payment_due_at',
    'shipping_method',
    'shipping_courier',
    'tracking_number',
    'shipping_address_snapshot',
    'subtotal',
    'shipping_fee',
    'discount_amount',
    'service_fee',
    'total_amount',
    'customer_note',
    'cancellation_reason',
    'paid_at',
    'shipped_at',
    'completed_at',
    'cancelled_at',
])]
#[UsePolicy(OrderPolicy::class)]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected static function newFactory(): OrderFactory
    {
        return OrderFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'shipping_address_snapshot' => 'array',
            'subtotal' => 'integer',
            'shipping_fee' => 'integer',
            'discount_amount' => 'integer',
            'service_fee' => 'integer',
            'total_amount' => 'integer',
            'payment_due_at' => 'datetime',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Store, $this>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class)->orderBy('id');
    }

    /**
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)
            ->orderByDesc('occurred_at')
            ->orderByDesc('id');
    }

    /**
     * @return HasMany<OrderInternalNote, $this>
     */
    public function internalNotes(): HasMany
    {
        return $this->hasMany(OrderInternalNote::class)
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }
}
