<?php

namespace App\Services\Customer;

use App\Contracts\Customer\CustomerAddressServiceInterface;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Support\Facades\DB;

class CustomerAddressService implements CustomerAddressServiceInterface
{
    public function listFormattedForUser(User $user): array
    {
        return array_values(
            $user->addresses()
                ->get()
                ->map(fn (UserAddress $address): array => [
                    'id' => (string) $address->id,
                    'label' => $address->label,
                    'recipientName' => $address->recipient_name,
                    'phone' => $address->phone,
                    'fullAddress' => $address->full_address,
                    'district' => $address->district,
                    'city' => $address->city,
                    'postalCode' => $address->postal_code ?? '',
                    'courierNote' => $address->courier_note ?? '',
                    'isPrimary' => $address->is_primary,
                ])
                ->all()
        );
    }

    public function create(User $user, array $data): UserAddress
    {
        return DB::transaction(function () use ($user, $data): UserAddress {
            $hasExisting = $user->addresses()->exists();
            $shouldBePrimary = ! $hasExisting || (bool) ($data['is_primary'] ?? false);

            if ($shouldBePrimary && $hasExisting) {
                $user->addresses()->update(['is_primary' => false]);
            }

            /** @var UserAddress $address */
            $address = $user->addresses()->create([
                'label' => trim($data['label']),
                'recipient_name' => trim($data['recipient_name']),
                'phone' => trim($data['phone']),
                'full_address' => trim($data['full_address']),
                'district' => trim($data['district']),
                'city' => trim($data['city']),
                'postal_code' => $this->nullableTrim($data['postal_code'] ?? null),
                'courier_note' => $this->nullableTrim($data['courier_note'] ?? null),
                'is_primary' => $shouldBePrimary,
            ]);

            return $address;
        });
    }

    public function update(User $user, UserAddress $address, array $data): UserAddress
    {
        return DB::transaction(function () use ($user, $address, $data): UserAddress {
            $wantsPrimary = (bool) ($data['is_primary'] ?? $address->is_primary);
            $otherCount = $user->addresses()->where('id', '!=', $address->id)->count();

            if ($otherCount === 0) {
                $wantsPrimary = true;
            }

            if ($wantsPrimary) {
                $user->addresses()->where('id', '!=', $address->id)->update(['is_primary' => false]);
            } elseif ($address->is_primary) {
                $replacement = $user->addresses()
                    ->where('id', '!=', $address->id)
                    ->orderByDesc('updated_at')
                    ->first();

                if ($replacement instanceof UserAddress) {
                    $replacement->forceFill(['is_primary' => true])->save();
                }
            }

            $address->fill([
                'label' => trim($data['label']),
                'recipient_name' => trim($data['recipient_name']),
                'phone' => trim($data['phone']),
                'full_address' => trim($data['full_address']),
                'district' => trim($data['district']),
                'city' => trim($data['city']),
                'postal_code' => $this->nullableTrim($data['postal_code'] ?? null),
                'courier_note' => $this->nullableTrim($data['courier_note'] ?? null),
                'is_primary' => $wantsPrimary,
            ]);
            $address->save();

            return $address->fresh() ?? $address;
        });
    }

    public function setPrimary(User $user, UserAddress $address): UserAddress
    {
        return DB::transaction(function () use ($user, $address): UserAddress {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_primary' => false]);
            $address->forceFill(['is_primary' => true])->save();

            return $address->fresh() ?? $address;
        });
    }

    public function delete(User $user, UserAddress $address): void
    {
        DB::transaction(function () use ($user, $address): void {
            $wasPrimary = $address->is_primary;
            $address->delete();

            if ($wasPrimary) {
                $nextPrimary = $user->addresses()->orderByDesc('updated_at')->first();

                if ($nextPrimary instanceof UserAddress) {
                    $nextPrimary->forceFill(['is_primary' => true])->save();
                }
            }
        });
    }

    private function nullableTrim(?string $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }
}
