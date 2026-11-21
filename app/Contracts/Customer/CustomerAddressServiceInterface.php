<?php

namespace App\Contracts\Customer;

use App\Models\User;
use App\Models\UserAddress;

interface CustomerAddressServiceInterface
{
    /**
     * @return list<array<string, mixed>>
     */
    public function listFormattedForUser(User $user): array;

    /**
     * @param array{
     *     label: string,
     *     recipient_name: string,
     *     phone: string,
     *     full_address: string,
     *     district: string,
     *     city: string,
     *     postal_code?: string|null,
     *     courier_note?: string|null,
     *     is_primary?: bool
     * } $data
     */
    public function create(User $user, array $data): UserAddress;

    /**
     * @param array{
     *     label: string,
     *     recipient_name: string,
     *     phone: string,
     *     full_address: string,
     *     district: string,
     *     city: string,
     *     postal_code?: string|null,
     *     courier_note?: string|null,
     *     is_primary?: bool
     * } $data
     */
    public function update(User $user, UserAddress $address, array $data): UserAddress;

    public function setPrimary(User $user, UserAddress $address): UserAddress;

    public function delete(User $user, UserAddress $address): void;
}
