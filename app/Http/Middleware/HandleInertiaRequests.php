<?php

namespace App\Http\Middleware;

use App\Contracts\Cart\CartServiceInterface;
use App\Contracts\Order\CustomerOrderServiceInterface;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $rawGuestToken = $request->cookie(CartServiceInterface::GUEST_COOKIE_NAME);
        $guestToken = is_string($rawGuestToken) ? $rawGuestToken : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user instanceof User ? [
                    ...$user->toArray(),
                    'avatar_url' => $user->getAvatarUrl(),
                ] : null,
                'roles' => $user instanceof User ? $user->getRoleNames()->all() : [],
            ],
            'cart' => [
                'count' => app(CartServiceInterface::class)->getCartCount(
                    $user instanceof User ? $user : null,
                    $guestToken,
                ),
            ],
            'orderSummary' => [
                'active_count' => $user instanceof User
                    ? app(CustomerOrderServiceInterface::class)->getActiveOrderCount($user)
                    : 0,
            ],
            'notifications' => [
                'unread_count' => $user instanceof User
                    ? $user->unreadNotifications()->count()
                    : 0,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
