<?php

namespace Database\Factories\Order;

use App\Models\Order\Order;
use App\Models\Order\OrderStatusHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
{
    protected $model = OrderStatusHistory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'status' => 'processing',
            'title' => 'Pesanan sedang disiapkan penjual',
            'description' => 'Produk sedang dikemas rapi oleh mitra UMKM Kossuma.',
            'location' => 'Gerai Kossuma Kota Bogor',
            'occurred_at' => now(),
        ];
    }
}
