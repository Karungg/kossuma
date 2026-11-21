<?php

namespace App\Http\Controllers\Cart;

use App\Contracts\Cart\CartServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\StoreCartItemRequest;
use App\Http\Requests\Cart\ToggleCartSelectionRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\Product\Product;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    private const int GUEST_COOKIE_MINUTES = 43200;

    public function __construct(
        public readonly CartServiceInterface $cartService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $this->resolveUser($request);
        $guestToken = $this->resolveGuestToken($request, false);

        return Inertia::render(
            'customer/cart/index',
            $this->cartService->getCartViewData($user, $guestToken),
        );
    }

    public function store(StoreCartItemRequest $request): RedirectResponse
    {
        $user = $this->resolveUser($request);
        $guestToken = $this->resolveGuestToken($request, true);
        $validated = $request->validated();

        $quantity = (int) $validated['quantity'];
        $buyNow = (bool) ($validated['buy_now'] ?? false);

        $item = $this->cartService->addItem(
            user: $user,
            guestToken: $guestToken,
            productId: (int) $validated['product_id'],
            quantity: $quantity,
            buyNow: $buyNow,
        );

        $product = $item->product()->first(['id', 'name']);
        $productName = $product instanceof Product ? $product->name : 'Produk';

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$quantity}× {$productName} berhasil masuk ke keranjang.",
        ]);

        if ($buyNow) {
            return to_route('cart');
        }

        return back();
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        $cart = $this->requireCart($request);
        $validated = $request->validated();

        if (array_key_exists('quantity', $validated)) {
            $this->cartService->updateItemQuantity($cart, $cartItem, (int) $validated['quantity']);
        }

        if (array_key_exists('is_selected', $validated)) {
            $this->cartService->toggleItemSelection($cart, $cartItem, (bool) $validated['is_selected']);
        }

        return back();
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        $cart = $this->requireCart($request);
        $this->cartService->removeItem($cart, $cartItem);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produk dihapus dari keranjang.',
        ]);

        return back();
    }

    public function updateSelection(ToggleCartSelectionRequest $request): RedirectResponse
    {
        $cart = $this->requireCart($request);
        $validated = $request->validated();
        $isSelected = (bool) $validated['is_selected'];

        if (isset($validated['store_id']) && $validated['store_id'] !== null) {
            $this->cartService->toggleStoreSelection($cart, (int) $validated['store_id'], $isSelected);
        } else {
            $this->cartService->toggleAllSelection($cart, $isSelected);
        }

        return back();
    }

    public function destroySelected(Request $request): RedirectResponse
    {
        $cart = $this->requireCart($request);
        $deleted = $this->cartService->removeSelectedItems($cart);

        if ($deleted > 0) {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "{$deleted} produk dihapus dari keranjang.",
            ]);
        }

        return back();
    }

    public function destroyUnavailable(Request $request): RedirectResponse
    {
        $cart = $this->requireCart($request);
        $deleted = $this->cartService->removeUnavailableItems($cart);

        if ($deleted > 0) {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "{$deleted} produk yang tidak tersedia berhasil dihapus.",
            ]);
        }

        return back();
    }

    private function resolveUser(Request $request): ?User
    {
        $user = $request->user();

        return $user instanceof User ? $user : null;
    }

    private function resolveGuestToken(Request $request, bool $createIfMissing): ?string
    {
        if ($this->resolveUser($request) instanceof User) {
            return null;
        }

        $cookieValue = $request->cookie(CartServiceInterface::GUEST_COOKIE_NAME);

        if (is_string($cookieValue) && Str::isUuid($cookieValue)) {
            return $cookieValue;
        }

        if (! $createIfMissing) {
            return null;
        }

        $newToken = Str::uuid()->toString();

        Cookie::queue(cookie(
            name: CartServiceInterface::GUEST_COOKIE_NAME,
            value: $newToken,
            minutes: self::GUEST_COOKIE_MINUTES,
            path: '/',
            domain: null,
            secure: null,
            httpOnly: true,
            raw: false,
            sameSite: 'lax',
        ));

        return $newToken;
    }

    private function requireCart(Request $request): Cart
    {
        $cart = $this->cartService->resolveCart(
            $this->resolveUser($request),
            $this->resolveGuestToken($request, false),
            false,
        );

        if (! $cart instanceof Cart) {
            abort(403);
        }

        return $cart;
    }
}
