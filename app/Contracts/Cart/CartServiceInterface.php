<?php

namespace App\Contracts\Cart;

use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\User;

interface CartServiceInterface
{
    public const string GUEST_COOKIE_NAME = 'kossuma_cart_token';

    public function resolveCart(?User $user, ?string $guestToken, bool $createIfMissing = false): ?Cart;

    public function mergeGuestCartToUser(string $guestToken, User $user): void;

    public function getCartViewData(?User $user, ?string $guestToken): array;

    public function getCartCount(?User $user, ?string $guestToken): int;

    public function addItem(?User $user, ?string $guestToken, int $productId, int $quantity = 1, bool $buyNow = false): CartItem;

    public function updateItemQuantity(Cart $cart, CartItem $item, int $quantity): CartItem;

    public function toggleItemSelection(Cart $cart, CartItem $item, bool $isSelected): void;

    public function toggleStoreSelection(Cart $cart, int $storeId, bool $isSelected): void;

    public function toggleAllSelection(Cart $cart, bool $isSelected): void;

    public function removeItem(Cart $cart, CartItem $item): void;

    public function removeSelectedItems(Cart $cart): int;

    public function removeUnavailableItems(Cart $cart): int;
}
