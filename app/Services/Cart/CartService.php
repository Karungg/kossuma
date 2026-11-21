<?php

namespace App\Services\Cart;

use App\Contracts\Cart\CartServiceInterface;
use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\Product\Product;
use App\Models\Store\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService implements CartServiceInterface
{
    public function resolveCart(?User $user, ?string $guestToken, bool $createIfMissing = false): ?Cart
    {
        if ($user instanceof User) {
            if ($createIfMissing) {
                return Cart::query()->firstOrCreate(
                    ['user_id' => $user->id],
                    ['guest_token' => null],
                );
            }

            return Cart::query()->where('user_id', $user->id)->first();
        }

        if (is_string($guestToken) && Str::isUuid($guestToken)) {
            if ($createIfMissing) {
                return Cart::query()->firstOrCreate(
                    ['guest_token' => $guestToken],
                    ['user_id' => null],
                );
            }

            return Cart::query()
                ->whereNull('user_id')
                ->where('guest_token', $guestToken)
                ->first();
        }

        return null;
    }

    public function mergeGuestCartToUser(string $guestToken, User $user): void
    {
        if (! Str::isUuid($guestToken)) {
            return;
        }

        DB::transaction(function () use ($guestToken, $user): void {
            $guestCart = Cart::query()
                ->whereNull('user_id')
                ->where('guest_token', $guestToken)
                ->with('items.product')
                ->first();

            if (! $guestCart instanceof Cart) {
                return;
            }

            $userCart = Cart::query()->firstOrCreate(
                ['user_id' => $user->id],
                ['guest_token' => null],
            );

            $existingItems = $userCart->items()->get()->keyBy('product_id');

            foreach ($guestCart->items as $guestItem) {
                if (! $guestItem instanceof CartItem) {
                    continue;
                }

                $product = $guestItem->product;

                if (! $product instanceof Product) {
                    continue;
                }

                $existing = $existingItems->get($guestItem->product_id);
                $isAvailable = $product->is_active && $product->stock > 0;

                if ($existing instanceof CartItem) {
                    $combinedQty = $existing->quantity + $guestItem->quantity;
                    $resolvedQty = $product->stock > 0
                        ? min($combinedQty, $product->stock)
                        : $existing->quantity;

                    $existing->update([
                        'quantity' => max(1, $resolvedQty),
                        'is_selected' => $isAvailable && ($existing->is_selected || $guestItem->is_selected),
                        'unit_price_snapshot' => $product->price,
                    ]);
                } else {
                    $resolvedQty = $product->stock > 0
                        ? min($guestItem->quantity, $product->stock)
                        : $guestItem->quantity;

                    $userCart->items()->create([
                        'product_id' => $product->id,
                        'quantity' => max(1, $resolvedQty),
                        'is_selected' => $isAvailable && $guestItem->is_selected,
                        'unit_price_snapshot' => $guestItem->unit_price_snapshot ?? $product->price,
                    ]);
                }
            }

            $guestCart->delete();
        });
    }

    public function getCartViewData(?User $user, ?string $guestToken): array
    {
        $cart = $this->resolveCart($user, $guestToken, false);

        if ($cart instanceof Cart) {
            $cart->load([
                'items.product' => static function ($query): void {
                    $query->with([
                        'store:id,name,slug,location',
                        'primaryImage:id,product_id,image_path,alt,is_primary,sort_order',
                    ]);
                },
            ]);
        }

        $storesMap = [];
        $itemsPayload = [];
        $excludedProductIds = [];

        $selectedCount = 0;
        $selectedUnits = 0;
        $subtotal = 0;
        $discountTotal = 0;
        $unavailableCount = 0;
        $hasBlockingSelectionIssue = false;

        if ($cart instanceof Cart) {
            foreach ($cart->items as $cartItem) {
                if (! $cartItem instanceof CartItem) {
                    continue;
                }

                $product = $cartItem->product;

                if (! $product instanceof Product || ! $product->store instanceof Store) {
                    continue;
                }

                $excludedProductIds[] = $product->id;
                $store = $product->store;
                $storeKey = (string) $store->id;

                if (! isset($storesMap[$storeKey])) {
                    [$district, $city] = $this->parseStoreLocation($store->location);

                    $storesMap[$storeKey] = [
                        'id' => $storeKey,
                        'name' => $store->name,
                        'district' => $district,
                        'city' => $city,
                    ];
                }

                $isActive = $product->is_active;
                $stock = $product->stock;
                $isAvailable = $isActive && $stock > 0;
                $unavailableReason = ! $isActive
                    ? 'inactive'
                    : ($stock <= 0 ? 'out_of_stock' : null);

                $exceedsStock = $isAvailable && $cartItem->quantity > $stock;
                $canCheckout = $isAvailable && ! $exceedsStock;
                $effectiveSelected = $isAvailable && $cartItem->is_selected;

                if (! $isAvailable) {
                    $unavailableCount++;

                    if ($cartItem->is_selected) {
                        $cartItem->update(['is_selected' => false]);
                    }
                }

                $originalPrice = (int) ($product->original_price ?? 0);
                $hasDiscount = $originalPrice > $product->price;
                $discountPercent = $hasDiscount
                    ? (int) round((($originalPrice - $product->price) / $originalPrice) * 100)
                    : null;

                $priceSnapshot = $cartItem->unit_price_snapshot;
                $priceChanged = $priceSnapshot !== null && $priceSnapshot !== $product->price;

                if ($effectiveSelected) {
                    $selectedCount++;
                    $selectedUnits += $cartItem->quantity;
                    $subtotal += $product->price * $cartItem->quantity;

                    if ($hasDiscount) {
                        $discountTotal += ($originalPrice - $product->price) * $cartItem->quantity;
                    }

                    if ($exceedsStock) {
                        $hasBlockingSelectionIssue = true;
                    }
                }

                $itemsPayload[] = [
                    'id' => (string) $cartItem->id,
                    'productId' => $product->id,
                    'storeId' => $storeKey,
                    'slug' => $product->slug,
                    'name' => $product->name,
                    'variant' => $product->unit_label ?? '1 Pack',
                    'price' => $product->price,
                    'originalPrice' => $hasDiscount ? $originalPrice : null,
                    'discountPercent' => $discountPercent,
                    'imageUrl' => $product->getPrimaryImageUrl(true) ?? '',
                    'imageFullUrl' => $product->getPrimaryImageUrl(false) ?? '',
                    'imageAlt' => $product->primaryImage?->alt ?? $product->name,
                    'quantity' => $cartItem->quantity,
                    'stock' => $stock,
                    'isActive' => $isActive,
                    'isAvailable' => $isAvailable,
                    'unavailableReason' => $unavailableReason,
                    'exceedsStock' => $exceedsStock,
                    'canCheckout' => $canCheckout,
                    'isSelected' => $effectiveSelected,
                    'isPreorder' => $product->is_preorder,
                    'preorderDays' => $product->preorder_days,
                    'priceSnapshot' => $priceSnapshot,
                    'priceChanged' => $priceChanged,
                ];
            }
        }

        return [
            'stores' => array_values($storesMap),
            'items' => $itemsPayload,
            'calculation' => [
                'selectedCount' => $selectedCount,
                'selectedUnits' => $selectedUnits,
                'originalItemsTotal' => $subtotal + $discountTotal,
                'discountTotal' => $discountTotal,
                'subtotal' => $subtotal,
                'hasBlockingSelectionIssue' => $hasBlockingSelectionIssue,
                'unavailableCount' => $unavailableCount,
            ],
            'recommendations' => $this->getRecommendations($excludedProductIds),
        ];
    }

    public function getCartCount(?User $user, ?string $guestToken): int
    {
        $cart = $this->resolveCart($user, $guestToken, false);

        if (! $cart instanceof Cart) {
            return 0;
        }

        return (int) $cart->items()->count();
    }

    public function addItem(?User $user, ?string $guestToken, int $productId, int $quantity = 1, bool $buyNow = false): CartItem
    {
        $product = Product::query()->findOrFail($productId);

        if (! $product->is_active) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk ini sedang tidak tersedia.',
            ]);
        }

        if ($product->stock <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Maaf, stok produk ini sedang habis.',
            ]);
        }

        return DB::transaction(function () use ($user, $guestToken, $product, $quantity, $buyNow): CartItem {
            $cart = $this->resolveCart($user, $guestToken, true);

            if (! $cart instanceof Cart) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang tidak dapat dibuat. Silakan muat ulang halaman.',
                ]);
            }

            $existing = $cart->items()
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $currentQty = $existing instanceof CartItem ? $existing->quantity : 0;
            $nextQuantity = $currentQty + $quantity;

            if ($nextQuantity > $product->stock) {
                $remaining = max(0, $product->stock - $currentQty);

                $message = $remaining > 0
                    ? "Stok tersisa {$product->stock}. Kamu sudah memiliki {$currentQty} di keranjang, maksimal tambah {$remaining} lagi."
                    : "Jumlah di keranjang sudah mencapai batas stok tersedia ({$product->stock}).";

                throw ValidationException::withMessages([
                    'quantity' => $message,
                ]);
            }

            if ($buyNow) {
                $cart->items()->update(['is_selected' => false]);
            }

            if ($existing instanceof CartItem) {
                $existing->update([
                    'quantity' => $nextQuantity,
                    'is_selected' => true,
                    'unit_price_snapshot' => $product->price,
                ]);

                return $existing->refresh();
            }

            return $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $nextQuantity,
                'is_selected' => true,
                'unit_price_snapshot' => $product->price,
            ]);
        });
    }

    public function updateItemQuantity(Cart $cart, CartItem $item, int $quantity): CartItem
    {
        $this->assertOwnership($cart, $item);

        $product = $item->product()->first();

        if (! $product instanceof Product || ! $product->is_active) {
            $item->update(['is_selected' => false]);

            throw ValidationException::withMessages([
                'quantity' => 'Produk ini sedang tidak tersedia sehingga tidak dapat diubah.',
            ]);
        }

        if ($product->stock <= 0) {
            $item->update(['is_selected' => false]);

            throw ValidationException::withMessages([
                'quantity' => 'Stok produk ini sudah habis sehingga tidak dapat di-checkout.',
            ]);
        }

        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => "Jumlah melebihi stok tersedia (maksimal {$product->stock}).",
            ]);
        }

        $item->update([
            'quantity' => max(1, $quantity),
            'unit_price_snapshot' => $product->price,
        ]);

        return $item->refresh();
    }

    public function toggleItemSelection(Cart $cart, CartItem $item, bool $isSelected): void
    {
        $this->assertOwnership($cart, $item);

        if ($isSelected) {
            $product = $item->product()->first();

            if (! $product instanceof Product || ! $product->is_active || $product->stock <= 0) {
                $item->update(['is_selected' => false]);

                throw ValidationException::withMessages([
                    'is_selected' => 'Produk yang stoknya habis atau tidak aktif tidak dapat dipilih untuk checkout.',
                ]);
            }
        }

        $item->update(['is_selected' => $isSelected]);
    }

    public function toggleStoreSelection(Cart $cart, int $storeId, bool $isSelected): void
    {
        $query = $cart->items()->whereHas('product', static function (Builder $productQuery) use ($storeId, $isSelected): void {
            $productQuery->where('store_id', $storeId);

            if ($isSelected) {
                $productQuery->where('is_active', true)->where('stock', '>', 0);
            }
        });

        $query->update(['is_selected' => $isSelected]);
    }

    public function toggleAllSelection(Cart $cart, bool $isSelected): void
    {
        if (! $isSelected) {
            $cart->items()->update(['is_selected' => false]);

            return;
        }

        $cart->items()
            ->whereHas('product', static function (Builder $productQuery): void {
                $productQuery->where('is_active', true)->where('stock', '>', 0);
            })
            ->update(['is_selected' => true]);

        $cart->items()
            ->whereHas('product', static function (Builder $productQuery): void {
                $productQuery->where('is_active', false)->orWhere('stock', '<=', 0);
            })
            ->update(['is_selected' => false]);
    }

    public function removeItem(Cart $cart, CartItem $item): void
    {
        $this->assertOwnership($cart, $item);

        $item->delete();
    }

    public function removeSelectedItems(Cart $cart): int
    {
        return (int) $cart->items()->where('is_selected', true)->delete();
    }

    public function removeUnavailableItems(Cart $cart): int
    {
        return (int) $cart->items()
            ->whereHas('product', static function (Builder $productQuery): void {
                $productQuery->where('is_active', false)->orWhere('stock', '<=', 0);
            })
            ->delete();
    }

    private function assertOwnership(Cart $cart, CartItem $item): void
    {
        if ($item->cart_id !== $cart->id) {
            abort(403);
        }
    }

    private function getRecommendations(array $excludedProductIds): array
    {
        $query = Product::query()
            ->with([
                'store:id,name',
                'primaryImage:id,product_id,image_path,alt,is_primary,sort_order',
            ])
            ->where('is_active', true)
            ->where('stock', '>', 0);

        if ($excludedProductIds !== []) {
            $query->whereNotIn('id', $excludedProductIds);
        }

        return $query
            ->orderByDesc('sold_count')
            ->orderByDesc('id')
            ->limit(4)
            ->get()
            ->map(static fn (Product $product): array => [
                'id' => (string) $product->id,
                'productId' => $product->id,
                'slug' => $product->slug,
                'storeId' => (string) $product->store_id,
                'storeName' => $product->store instanceof Store ? $product->store->name : 'UMKM Kossuma',
                'name' => $product->name,
                'price' => $product->price,
                'stock' => $product->stock,
                'imageUrl' => $product->getPrimaryImageUrl(true) ?? '',
                'imageFullUrl' => $product->getPrimaryImageUrl(false) ?? '',
                'imageAlt' => $product->primaryImage?->alt ?? $product->name,
                'variant' => $product->unit_label ?? '1 Pack',
            ])
            ->values()
            ->all();
    }

    private function parseStoreLocation(string $location): array
    {
        $parts = array_map('trim', explode(',', $location, 2));

        return [
            $parts[0] ?: 'Kota Bogor',
            $parts[1] ?? 'Kota Bogor',
        ];
    }
}
