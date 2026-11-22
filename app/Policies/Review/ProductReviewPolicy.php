<?php

namespace App\Policies\Review;

use App\Models\Product\ProductReview;
use App\Models\User;

class ProductReviewPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('Admin');
    }

    public function moderate(User $user, ProductReview $review): bool
    {
        return $user->hasRole('Admin');
    }

    public function reply(User $user, ProductReview $review): bool
    {
        return $user->hasRole('Admin');
    }
}
