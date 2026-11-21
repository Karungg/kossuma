<?php

namespace App\Services\Product;

use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Models\Product\Product;

class ProductExportDefinition implements TabularExportDefinitionInterface
{
    public const ALL_COLUMNS = [
        'name',
        'slug',
        'category',
        'store',
        'price',
        'stock',
        'status',
        'is_preorder',
        'sold_count',
        'created_at',
        'updated_at',
    ];

    public const DEFAULT_COLUMNS = [
        'name',
        'category',
        'store',
        'price',
        'stock',
        'status',
    ];

    public function filePrefix(): string
    {
        return 'produk-kossuma';
    }

    public function documentTitle(): string
    {
        return 'Daftar Produk UMKM — Kossuma Kota Bogor';
    }

    public function itemLabel(): string
    {
        return 'produk';
    }

    public function columnLabels(): array
    {
        return [
            'name' => 'Nama Produk',
            'slug' => 'Slug',
            'category' => 'Kategori',
            'store' => 'Toko UMKM',
            'price' => 'Harga',
            'stock' => 'Stok',
            'status' => 'Status',
            'is_preorder' => 'Pre-order',
            'sold_count' => 'Terjual',
            'created_at' => 'Dibuat',
            'updated_at' => 'Diperbarui',
        ];
    }

    public function defaultColumns(): array
    {
        return self::DEFAULT_COLUMNS;
    }

    public function resolveCellValue(mixed $record, string $column): int|string
    {
        if (! $record instanceof Product) {
            return '-';
        }

        return match ($column) {
            'name' => $record->name,
            'slug' => $record->slug,
            'category' => $record->category?->name ?? '-',
            'store' => $record->store?->name ?? '-',
            'price' => 'Rp'.number_format((int) $record->price, 0, ',', '.'),
            'stock' => (int) $record->stock,
            'status' => $record->is_active ? 'Aktif' : 'Nonaktif',
            'is_preorder' => $record->is_preorder
                ? ($record->preorder_days ? "Pre-order {$record->preorder_days} hari" : 'Pre-order')
                : 'Reguler',
            'sold_count' => (int) $record->sold_count,
            'created_at' => $record->created_at?->format('d/m/Y H:i') ?? '-',
            'updated_at' => $record->updated_at?->format('d/m/Y H:i') ?? '-',
            default => '-',
        };
    }
}
