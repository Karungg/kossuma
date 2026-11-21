<?php

namespace App\Policies\Product;

use App\Models\Product\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('Admin');
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasRole('Admin');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Admin');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasRole('Admin');
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasRole('Admin');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasRole('Admin');
    }
}
