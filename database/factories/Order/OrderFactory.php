<?php

namespace Database\Factories\Order;

use App\Enums\Order\OrderStatus;
use App\Models\Order\Order;
use App\Models\Store\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(35000, 180000);
        $shippingFee = 12000;
        $serviceFee = 1000;

        return [
            'order_number' => 'KSM-'.now()->format('Ymd').'-'.strtoupper(Str::random(4)),
            'user_id' => User::factory(),
            'store_id' => Store::factory(),
            'status' => OrderStatus::Processing,
            'payment_method' => 'qris',
            'payment_channel' => 'QRIS Instan',
            'payment_status' => 'paid',
            'payment_due_at' => null,
            'shipping_method' => 'Kirim Hari yang Sama',
            'shipping_courier' => 'Kurir Koperasi Kossuma',
            'tracking_number' => 'KSM-TRK-'.fake()->numerify('######'),
            'shipping_address_snapshot' => [
                'label' => 'Rumah',
                'recipientName' => fake()->name(),
                'phone' => '081288441122',
                'fullAddress' => 'Jl. Cimanggu Permai Blok B2 No. 14',
                'district' => 'Tanah Sareal',
                'city' => 'Kota Bogor, Jawa Barat',
                'postalCode' => '16164',
                'courierNote' => 'Rumah pagar hijau',
            ],
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingFee,
            'discount_amount' => 0,
            'service_fee' => $serviceFee,
            'total_amount' => $subtotal + $shippingFee + $serviceFee,
            'customer_note' => null,
            'cancellation_reason' => null,
            'paid_at' => now()->subHours(3),
            'shipped_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
        ];
    }

    public function pendingPayment(): static
    {
        return $this->state(fn (): array => [
            'status' => OrderStatus::PendingPayment,
            'payment_status' => 'unpaid',
            'payment_due_at' => now()->addHours(12),
            'paid_at' => null,
            'tracking_number' => null,
        ]);
    }

    public function shipped(): static
    {
        return $this->state(fn (): array => [
            'status' => OrderStatus::Shipped,
            'payment_status' => 'paid',
            'paid_at' => now()->subHours(6),
            'shipped_at' => now()->subHours(2),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'status' => OrderStatus::Completed,
            'payment_status' => 'paid',
            'paid_at' => now()->subDays(3),
            'shipped_at' => now()->subDays(2),
            'completed_at' => now()->subDay(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => [
            'status' => OrderStatus::Cancelled,
            'payment_status' => 'cancelled',
            'paid_at' => null,
            'tracking_number' => null,
            'cancellation_reason' => 'Ingin mengubah daftar produk di keranjang',
            'cancelled_at' => now()->subDays(2),
        ]);
    }
}
