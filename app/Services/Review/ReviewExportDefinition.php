<?php

namespace App\Services\Review;

use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Product\ProductReview;
use App\Models\Store\Store;

class ReviewExportDefinition implements TabularExportDefinitionInterface
{
    public const ALL_COLUMNS = [
        'product',
        'store',
        'author_name',
        'order_number',
        'rating',
        'comment',
        'visibility',
        'admin_reply',
        'created_at',
    ];

    public const DEFAULT_COLUMNS = [
        'product',
        'store',
        'author_name',
        'rating',
        'comment',
        'visibility',
        'created_at',
    ];

    public function filePrefix(): string
    {
        return 'ulasan-produk-kossuma';
    }

    public function documentTitle(): string
    {
        return 'Daftar Ulasan Produk — Kossuma Kota Bogor';
    }

    public function itemLabel(): string
    {
        return 'ulasan';
    }

    /**
     * @return array<string, string>
     */
    public function columnLabels(): array
    {
        return [
            'product' => 'Produk',
            'store' => 'Toko UMKM',
            'author_name' => 'Pembeli',
            'order_number' => 'Nomor Pesanan',
            'rating' => 'Rating',
            'comment' => 'Komentar',
            'visibility' => 'Status Moderasi',
            'admin_reply' => 'Balasan Kossuma',
            'created_at' => 'Tanggal Ulasan',
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
        if (! $record instanceof ProductReview) {
            return '-';
        }

        $product = $record->product;
        $store = $product instanceof Product ? $product->store : null;
        $orderItem = $record->orderItem;
        $order = $orderItem instanceof OrderItem ? $orderItem->order : null;

        return match ($column) {
            'product' => $product instanceof Product ? $product->name : '-',
            'store' => $store instanceof Store ? $store->name : '-',
            'author_name' => $record->author_name,
            'order_number' => $order instanceof Order ? $order->order_number : '-',
            'rating' => $record->rating.' / 5',
            'comment' => $record->comment,
            'visibility' => $record->is_hidden
                ? 'Disembunyikan'.($record->hidden_reason ? " ({$record->hidden_reason})" : '')
                : 'Tampil',
            'admin_reply' => $record->admin_reply ?? '-',
            'created_at' => $record->created_at?->format('d/m/Y H:i') ?? '-',
            default => '-',
        };
    }
}
