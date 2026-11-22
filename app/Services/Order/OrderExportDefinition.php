<?php

namespace App\Services\Order;

use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Store\Store;
use App\Models\User;

class OrderExportDefinition implements TabularExportDefinitionInterface
{
    public const ALL_COLUMNS = [
        'order_number',
        'customer',
        'store',
        'items',
        'total_amount',
        'payment_status',
        'status',
        'shipping_courier',
        'tracking_number',
        'created_at',
    ];

    public const DEFAULT_COLUMNS = [
        'order_number',
        'customer',
        'store',
        'items',
        'total_amount',
        'payment_status',
        'status',
        'created_at',
    ];

    public function filePrefix(): string
    {
        return 'transaksi-kossuma';
    }

    public function documentTitle(): string
    {
        return 'Daftar Transaksi — Kossuma Kota Bogor';
    }

    public function itemLabel(): string
    {
        return 'transaksi';
    }

    /**
     * @return array<string, string>
     */
    public function columnLabels(): array
    {
        return [
            'order_number' => 'Nomor Pesanan',
            'customer' => 'Pembeli',
            'store' => 'Toko UMKM',
            'items' => 'Produk',
            'total_amount' => 'Total Belanja',
            'payment_status' => 'Status Pembayaran',
            'status' => 'Status Pesanan',
            'shipping_courier' => 'Kurir',
            'tracking_number' => 'Nomor Resi',
            'created_at' => 'Tanggal Pesan',
        ];
    }

    /**
     * @return list<string>
     */
    public function defaultColumns(): array
    {
        return self::DEFAULT_COLUMNS;
    }

    public function resolveCellValue(mixed $record, string $column): int|string
    {
        if (! $record instanceof Order) {
            return '-';
        }

        $address = $record->shipping_address_snapshot;
        $recipient = (string) ($address['recipientName'] ?? '');
        $customerName = $recipient !== '' ? $recipient : ($record->user instanceof User ? $record->user->name : '-');

        return match ($column) {
            'order_number' => $record->order_number,
            'customer' => $customerName,
            'store' => $record->store instanceof Store ? $record->store->name : '-',
            'items' => $record->items
                ->map(fn (OrderItem $item): string => "{$item->product_name} ({$item->quantity}x)")
                ->implode(', ') ?: '-',
            'total_amount' => 'Rp'.number_format((int) $record->total_amount, 0, ',', '.'),
            'payment_status' => match ($record->payment_status) {
                'paid' => 'Lunas',
                'unpaid' => 'Belum Dibayar',
                'refunded' => 'Dikembalikan',
                'cancelled' => 'Dibatalkan',
                default => $record->payment_status,
            },
            'status' => $record->status->label(),
            'shipping_courier' => $record->shipping_courier ?? $record->shipping_method,
            'tracking_number' => $record->tracking_number ?? '-',
            'created_at' => $record->created_at?->format('d/m/Y H:i') ?? '-',
            default => '-',
        };
    }
}
