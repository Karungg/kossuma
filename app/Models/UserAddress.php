<?php

namespace App\Models;

use App\Policies\UserAddressPolicy;
use Database\Factories\UserAddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $user_id
 * @property string $label
 * @property string $recipient_name
 * @property string $phone
 * @property string $full_address
 * @property string $district
 * @property string $city
 * @property string|null $postal_code
 * @property string|null $courier_note
 * @property bool $is_primary
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'label',
    'recipient_name',
    'phone',
    'full_address',
    'district',
    'city',
    'postal_code',
    'courier_note',
    'is_primary',
])]
#[UsePolicy(UserAddressPolicy::class)]
class UserAddress extends Model
{
    /** @use HasFactory<UserAddressFactory> */
    use HasFactory;

    protected static function newFactory(): UserAddressFactory
    {
        return UserAddressFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
