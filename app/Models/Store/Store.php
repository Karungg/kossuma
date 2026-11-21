<?php

namespace App\Models\Store;

use App\Models\Order\Order;
use App\Models\Product\Product;
use App\Models\User;
use Database\Factories\Store\StoreFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'name', 'slug', 'description', 'location', 'whatsapp_number', 'is_verified'])]
class Store extends Model
{
    private const string FALLBACK_WHATSAPP_NUMBER = '6281289005544';

    /** @use HasFactory<StoreFactory> */
    use HasFactory;

    protected static function newFactory(): StoreFactory
    {
        return StoreFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
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
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function resolvedWhatsappNumber(): string
    {
        $raw = is_string($this->whatsapp_number) ? preg_replace('/\D+/', '', $this->whatsapp_number) : '';

        if (! is_string($raw) || $raw === '') {
            return self::FALLBACK_WHATSAPP_NUMBER;
        }

        if (str_starts_with($raw, '0')) {
            return '62'.substr($raw, 1);
        }

        return $raw;
    }
}
