<?php

namespace App\Contracts\Customer;

use App\Models\User;
use Illuminate\Http\UploadedFile;

interface CustomerProfileServiceInterface
{
    /**
     * @param  array{name: string, email: string, phone?: string|null}  $data
     */
    public function updateProfile(User $user, array $data, ?UploadedFile $avatar = null): User;

    public function removeAvatar(User $user): User;
}
