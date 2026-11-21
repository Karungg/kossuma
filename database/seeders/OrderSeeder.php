<?php

namespace Database\Seeders;

use App\Enums\Order\OrderStatus;
use App\Models\Order\Order;
use App\Models\Product\Product;
use App\Models\Store\Store;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        Store::query()
            ->whereNull('whatsapp_number')
            ->update(['whatsapp_number' => '6281289005544']);

        $customer = User::query()->where('email', 'customer@example.com')->first();

        if (! $customer instanceof User) {
            return;
        }

        if ($customer->phone === null) {
            $customer->forceFill(['phone' => '081288441122'])->save();
        }

        if (! $customer->addresses()->exists()) {
            UserAddress::query()->create([
                'user_id' => $customer->id,
                'label' => 'Rumah',
                'recipient_name' => $customer->name,
                'phone' => '081288441122',
                'full_address' => 'Jl. Cimanggu Permai Blok B2 No. 14',
                'district' => 'Tanah Sareal',
                'city' => 'Kota Bogor, Jawa Barat',
                'postal_code' => '16164',
                'courier_note' => 'Rumah pagar hijau dekat masjid Al-Ikhlas',
                'is_primary' => true,
            ]);

            UserAddress::query()->create([
                'user_id' => $customer->id,
                'label' => 'Kantor',
                'recipient_name' => $customer->name,
                'phone' => '081288441122',
                'full_address' => 'Jl. Raya Pajajaran No. 45, Gedung Koperasi',
                'district' => 'Bogor Tengah',
                'city' => 'Kota Bogor, Jawa Barat',
                'postal_code' => '16143',
                'courier_note' => 'Titip di meja resepsionis lantai 1',
                'is_primary' => false,
            ]);
        }

        if ($customer->orders()->exists()) {
            return;
        }

        $products = Product::query()
            ->with(['store', 'primaryImage'])
            ->where('is_active', true)
            ->orderBy('id')
            ->limit(6)
            ->get();

        if ($products->isEmpty()) {
            return;
        }

        $primaryAddress = $customer->primaryAddress()->first();
        $addressSnapshot = [
            'label' => $primaryAddress?->label ?? 'Rumah',
            'recipientName' => $primaryAddress?->recipient_name ?? $customer->name,
            'phone' => $primaryAddress?->phone ?? '081288441122',
            'fullAddress' => $primaryAddress?->full_address ?? 'Jl. Cimanggu Permai Blok B2 No. 14',
            'district' => $primaryAddress?->district ?? 'Tanah Sareal',
            'city' => $primaryAddress?->city ?? 'Kota Bogor, Jawa Barat',
            'postalCode' => $primaryAddress?->postal_code ?? '16164',
            'courierNote' => $primaryAddress?->courier_note,
        ];

        $scenarios = [
            [
                'order_number' => 'KSM-'.now()->format('Ymd').'-1001',
                'status' => OrderStatus::PendingPayment,
                'payment_method' => 'qris',
                'payment_channel' => 'QRIS Instan',
                'payment_status' => 'unpaid',
                'payment_due_at' => now()->addHours(18),
                'shipping_method' => 'Kirim Hari yang Sama',
                'shipping_courier' => 'Kurir Koperasi Kossuma',
                'tracking_number' => null,
                'shipping_fee' => 12000,
                'discount_amount' => 0,
                'created_at' => now()->subHours(2),
                'paid_at' => null,
                'shipped_at' => null,
                'completed_at' => null,
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'note' => 'Mohon kirim dalam kondisi beku ya Bu',
                'product_indexes' => [0],
                'histories' => [
                    [
                        'status' => OrderStatus::PendingPayment->value,
                        'title' => 'Pesanan dibuat, menunggu pembayaran',
                        'description' => 'Segera selesaikan pembayaran QRIS sebelum batas waktu berakhir.',
                        'location' => 'Sistem Kossuma Kota Bogor',
                        'occurred_at' => now()->subHours(2),
                    ],
                ],
            ],
            [
                'order_number' => 'KSM-'.now()->subDay()->format('Ymd').'-1002',
                'status' => OrderStatus::Processing,
                'payment_method' => 'bank',
                'payment_channel' => 'BSI Virtual Account',
                'payment_status' => 'paid',
                'payment_due_at' => null,
                'shipping_method' => 'Kirim Hari yang Sama',
                'shipping_courier' => 'Kurir Koperasi Kossuma',
                'tracking_number' => 'KSM-TRK-261102',
                'shipping_fee' => 12000,
                'discount_amount' => 5000,
                'created_at' => now()->subDay(),
                'paid_at' => now()->subHours(22),
                'shipped_at' => null,
                'completed_at' => null,
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'note' => 'Saus sambalnya dipisah ya',
                'product_indexes' => [1, 2],
                'histories' => [
                    [
                        'status' => OrderStatus::PendingPayment->value,
                        'title' => 'Pesanan dibuat',
                        'description' => 'Pesanan diterima oleh sistem Kossuma.',
                        'location' => 'Sistem Kossuma Kota Bogor',
                        'occurred_at' => now()->subDay(),
                    ],
                    [
                        'status' => OrderStatus::Processing->value,
                        'title' => 'Pembayaran terverifikasi & pesanan disiapkan',
                        'description' => 'Mitra UMKM sedang menyiapkan dan mengemas pesanan Anda.',
                        'location' => 'Gerai UMKM Kossuma Kota Bogor',
                        'occurred_at' => now()->subHours(22),
                    ],
                ],
            ],
            [
                'order_number' => 'KSM-'.now()->subDays(2)->format('Ymd').'-1003',
                'status' => OrderStatus::Shipped,
                'payment_method' => 'qris',
                'payment_channel' => 'QRIS Instan',
                'payment_status' => 'paid',
                'payment_due_at' => null,
                'shipping_method' => 'Kirim Instan',
                'shipping_courier' => 'Kurir Instan Kossuma',
                'tracking_number' => 'KSM-TRK-261103',
                'shipping_fee' => 20000,
                'discount_amount' => 0,
                'created_at' => now()->subDays(2),
                'paid_at' => now()->subDays(2)->addMinutes(15),
                'shipped_at' => now()->subHours(3),
                'completed_at' => null,
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'note' => null,
                'product_indexes' => [0, 3],
                'histories' => [
                    [
                        'status' => OrderStatus::PendingPayment->value,
                        'title' => 'Pesanan dibuat',
                        'description' => 'Pesanan berhasil dibuat oleh pelanggan.',
                        'location' => 'Sistem Kossuma Kota Bogor',
                        'occurred_at' => now()->subDays(2),
                    ],
                    [
                        'status' => OrderStatus::Processing->value,
                        'title' => 'Pesanan dikemas oleh penjual',
                        'description' => 'Produk telah melewati pengecekan kesegaran dan dikemas rapi.',
                        'location' => 'Gerai Kossuma, Bogor Timur',
                        'occurred_at' => now()->subDays(2)->addHours(2),
                    ],
                    [
                        'status' => OrderStatus::Shipped->value,
                        'title' => 'Pesanan sedang diantar kurir ke alamat tujuan',
                        'description' => 'Kurir koperasi (Pak Ahmad) sedang menuju wilayah Tanah Sareal.',
                        'location' => 'Dalam Perjalanan — Kota Bogor',
                        'occurred_at' => now()->subHours(3),
                    ],
                ],
            ],
            [
                'order_number' => 'KSM-'.now()->subDays(7)->format('Ymd').'-1004',
                'status' => OrderStatus::Completed,
                'payment_method' => 'cod',
                'payment_channel' => 'Bayar di Tempat (COD)',
                'payment_status' => 'paid',
                'payment_due_at' => null,
                'shipping_method' => 'Kirim Hari yang Sama',
                'shipping_courier' => 'Kurir Koperasi Kossuma',
                'tracking_number' => 'KSM-TRK-261104',
                'shipping_fee' => 12000,
                'discount_amount' => 10000,
                'created_at' => now()->subDays(7),
                'paid_at' => now()->subDays(6),
                'shipped_at' => now()->subDays(6)->subHours(3),
                'completed_at' => now()->subDays(6),
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'note' => 'Terima kasih banyak!',
                'product_indexes' => [2, 4],
                'histories' => [
                    [
                        'status' => OrderStatus::Processing->value,
                        'title' => 'Pesanan disiapkan penjual',
                        'description' => 'Mitra UMKM menyiapkan paket pesanan Anda.',
                        'location' => 'Gerai UMKM Kossuma Kota Bogor',
                        'occurred_at' => now()->subDays(7)->addHours(1),
                    ],
                    [
                        'status' => OrderStatus::Shipped->value,
                        'title' => 'Pesanan diantar kurir',
                        'description' => 'Kurir berangkat dari gerai menuju alamat penerima.',
                        'location' => 'Bogor Tengah',
                        'occurred_at' => now()->subDays(6)->subHours(3),
                    ],
                    [
                        'status' => OrderStatus::Completed->value,
                        'title' => 'Pesanan diterima dan selesai',
                        'description' => 'Paket telah diterima langsung oleh penerima di lokasi tujuan.',
                        'location' => 'Tanah Sareal, Kota Bogor',
                        'occurred_at' => now()->subDays(6),
                    ],
                ],
            ],
            [
                'order_number' => 'KSM-'.now()->subDays(45)->format('Ymd').'-1005',
                'status' => OrderStatus::Cancelled,
                'payment_method' => 'bank',
                'payment_channel' => 'BCA Virtual Account',
                'payment_status' => 'cancelled',
                'payment_due_at' => null,
                'shipping_method' => 'Ambil Sendiri di Koperasi',
                'shipping_courier' => 'Ambil di Gerai Kossuma',
                'tracking_number' => null,
                'shipping_fee' => 0,
                'discount_amount' => 0,
                'created_at' => now()->subDays(45),
                'paid_at' => null,
                'shipped_at' => null,
                'completed_at' => null,
                'cancelled_at' => now()->subDays(45)->addHours(3),
                'cancellation_reason' => 'Ingin mengubah jumlah pembelian',
                'note' => null,
                'product_indexes' => [5],
                'histories' => [
                    [
                        'status' => OrderStatus::PendingPayment->value,
                        'title' => 'Pesanan dibuat',
                        'description' => 'Menunggu pembayaran melalui BCA Virtual Account.',
                        'location' => 'Sistem Kossuma Kota Bogor',
                        'occurred_at' => now()->subDays(45),
                    ],
                    [
                        'status' => OrderStatus::Cancelled->value,
                        'title' => 'Pesanan dibatalkan oleh pembeli',
                        'description' => 'Alasan: Ingin mengubah jumlah pembelian.',
                        'location' => 'Sistem Kossuma Kota Bogor',
                        'occurred_at' => now()->subDays(45)->addHours(3),
                    ],
                ],
            ],
        ];

        foreach ($scenarios as $scenario) {
            $chosenProducts = collect($scenario['product_indexes'])
                ->map(fn (int $idx): ?Product => $products->get($idx % $products->count()))
                ->filter(fn (?Product $p): bool => $p instanceof Product)
                ->values();

            /** @var Product|null $firstProduct */
            $firstProduct = $chosenProducts->first();

            if (! $firstProduct instanceof Product) {
                continue;
            }

            $subtotal = 0;
            $itemsPayload = [];

            foreach ($chosenProducts as $index => $product) {
                $qty = $index === 0 ? 2 : 1;
                $lineSubtotal = $product->price * $qty;
                $subtotal += $lineSubtotal;

                $itemsPayload[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'product_image_path' => $product->primaryImage?->image_path,
                    'unit_label' => $product->unit_label,
                    'price' => $product->price,
                    'original_price' => $product->original_price,
                    'quantity' => $qty,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $serviceFee = 1000;
            $totalAmount = max(
                0,
                $subtotal + $scenario['shipping_fee'] - $scenario['discount_amount'] + $serviceFee,
            );

            $order = Order::query()->create([
                'order_number' => $scenario['order_number'],
                'user_id' => $customer->id,
                'store_id' => $firstProduct->store_id,
                'status' => $scenario['status'],
                'payment_method' => $scenario['payment_method'],
                'payment_channel' => $scenario['payment_channel'],
                'payment_status' => $scenario['payment_status'],
                'payment_due_at' => $scenario['payment_due_at'],
                'shipping_method' => $scenario['shipping_method'],
                'shipping_courier' => $scenario['shipping_courier'],
                'tracking_number' => $scenario['tracking_number'],
                'shipping_address_snapshot' => $addressSnapshot,
                'subtotal' => $subtotal,
                'shipping_fee' => $scenario['shipping_fee'],
                'discount_amount' => $scenario['discount_amount'],
                'service_fee' => $serviceFee,
                'total_amount' => $totalAmount,
                'customer_note' => $scenario['note'],
                'cancellation_reason' => $scenario['cancellation_reason'],
                'paid_at' => $scenario['paid_at'],
                'shipped_at' => $scenario['shipped_at'],
                'completed_at' => $scenario['completed_at'],
                'cancelled_at' => $scenario['cancelled_at'],
                'created_at' => $scenario['created_at'],
                'updated_at' => $scenario['created_at'],
            ]);

            foreach ($itemsPayload as $itemPayload) {
                $order->items()->create($itemPayload);
            }

            foreach ($scenario['histories'] as $history) {
                $order->statusHistories()->create($history);
            }
        }
    }
}
