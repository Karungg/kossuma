<?php

namespace App\Http\Middleware;

use App\Contracts\Cart\CartServiceInterface;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
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
                'user' => $user,
                'roles' => $user?->getRoleNames()->all() ?? [],
            ],
            'cart' => [
                'count' => app(CartServiceInterface::class)->getCartCount(
                    $user instanceof User ? $user : null,
                    $guestToken,
                ),
            ],
            'notifications' => [
                'unread_count' => $user
                    ? $user->unreadNotifications()->count()
                    : 0,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
