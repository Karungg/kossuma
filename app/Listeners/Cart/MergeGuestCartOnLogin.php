<?php

namespace App\Listeners\Cart;

use App\Contracts\Cart\CartServiceInterface;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Cookie;

class MergeGuestCartOnLogin
{
    public function __construct(
        public readonly CartServiceInterface $cartService,
    ) {}

    public function handle(Login $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $guestToken = request()->cookie(CartServiceInterface::GUEST_COOKIE_NAME);

        if (! is_string($guestToken) || trim($guestToken) === '') {
            return;
        }

        $this->cartService->mergeGuestCartToUser(trim($guestToken), $event->user);
        Cookie::queue(Cookie::forget(CartServiceInterface::GUEST_COOKIE_NAME));
    }
}
