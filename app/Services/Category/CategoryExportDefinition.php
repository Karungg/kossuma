<?php

namespace App\Services\Category;

use App\Contracts\Export\TabularExportDefinitionInterface;
use App\Models\Category\Category;

class CategoryExportDefinition implements TabularExportDefinitionInterface
{
    public const ALL_COLUMNS = [
        'name',
        'slug',
        'description',
        'products_count',
        'created_at',
        'updated_at',
    ];

    public const DEFAULT_COLUMNS = [
        'name',
        'slug',
        'description',
        'products_count',
    ];

    public function filePrefix(): string
    {
        return 'kategori-kossuma';
    }

    public function documentTitle(): string
    {
        return 'Daftar Kategori Produk — Kossuma Kota Bogor';
    }

    public function itemLabel(): string
    {
        return 'kategori';
    }

    public function columnLabels(): array
    {
        return [
            'name' => 'Nama Kategori',
            'slug' => 'Slug',
            'description' => 'Deskripsi',
            'products_count' => 'Jumlah Produk',
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
        if (! $record instanceof Category) {
            return '-';
        }

        return match ($column) {
            'name' => $record->name,
            'slug' => $record->slug,
            'description' => $record->description !== null && trim($record->description) !== '' ? $record->description : '-',
            'products_count' => (int) ($record->products_count ?? 0),
            'created_at' => $record->created_at?->format('d/m/Y H:i') ?? '-',
            'updated_at' => $record->updated_at?->format('d/m/Y H:i') ?? '-',
            default => '-',
        };
    }
}
