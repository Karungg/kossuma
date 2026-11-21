<?php

namespace App\Enums\Notification;

enum NotificationCategory: string
{
    case System = 'system';
    case Order = 'order';
    case Product = 'product';
    case Category = 'category';
    case Account = 'account';

    public function label(): string
    {
        return match ($this) {
            self::System => 'Sistem',
            self::Order => 'Pesanan',
            self::Product => 'Produk',
            self::Category => 'Kategori',
            self::Account => 'Akun',
        };
    }

    public static function values(): array
    {
        return array_map(
            static fn (self $case): string => $case->value,
            self::cases(),
        );
    }
}
