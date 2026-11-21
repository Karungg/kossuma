<?php

use App\Contracts\Cart\CartServiceInterface;
use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Store\Store;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated user can add products to database cart, accumulate quantity, and see synced global cart count', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $store = Store::factory()->create([
        'name' => 'Dapur Ummi Salma',
        'location' => 'Tanah Sareal, Kota Bogor',
    ]);
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'store_id' => $store->id,
        'name' => 'Risol Mayo Premium',
        'slug' => 'risol-mayo-premium',
        'price' => 35000,
        'original_price' => 40000,
        'stock' => 10,
        'is_active' => true,
    ]);

    $this->actingAs($user);

    $this->from(route('products.show', $product->slug))
        ->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ])
        ->assertRedirect(route('products.show', $product->slug));

    $cart = $user->cart()->with('items')->firstOrFail();
    expect($cart->user_id)->toBe($user->id);
    expect($cart->items)->toHaveCount(1);
    expect($cart->items->first()->quantity)->toBe(2);
    expect($cart->items->first()->unit_price_snapshot)->toBe(35000);

    $this->from(route('products.show', $product->slug))
        ->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 3,
        ])
        ->assertRedirect(route('products.show', $product->slug));

    expect($cart->items()->count())->toBe(1);
    expect($cart->items()->first()->quantity)->toBe(5);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('cart.count', 1));

    $this->get(route('cart'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/cart/index')
            ->where('cart.count', 1)
            ->has('stores', 1)
            ->where('stores.0.name', 'Dapur Ummi Salma')
            ->missing('stores.0.note')
            ->has('items', 1)
            ->where('items.0.quantity', 5)
            ->where('items.0.stock', 10)
            ->where('items.0.isAvailable', true)
            ->where('items.0.canCheckout', true)
            ->where('calculation.selectedCount', 1)
            ->where('calculation.selectedUnits', 5)
            ->where('calculation.subtotal', 175000)
            ->where('calculation.discountTotal', 25000)
            ->where('calculation.originalItemsTotal', 200000));
});

test('cannot add out-of-stock, inactive, or over-stock product quantities to cart', function () {
    $user = User::factory()->create();
    $outOfStock = Product::factory()->create(['stock' => 0, 'is_active' => true]);
    $inactive = Product::factory()->inactive()->create(['stock' => 10]);
    $limited = Product::factory()->create(['stock' => 3, 'is_active' => true]);

    $this->actingAs($user);

    $this->from(route('cart'))
        ->post(route('cart.items.store'), [
            'product_id' => $outOfStock->id,
            'quantity' => 1,
        ])
        ->assertSessionHasErrors('quantity');

    $this->from(route('cart'))
        ->post(route('cart.items.store'), [
            'product_id' => $inactive->id,
            'quantity' => 1,
        ])
        ->assertSessionHasErrors('product_id');

    $this->from(route('cart'))
        ->post(route('cart.items.store'), [
            'product_id' => $limited->id,
            'quantity' => 4,
        ])
        ->assertSessionHasErrors('quantity');

    $this->post(route('cart.items.store'), [
        'product_id' => $limited->id,
        'quantity' => 2,
    ])->assertSessionHasNoErrors();

    $this->post(route('cart.items.store'), [
        'product_id' => $limited->id,
        'quantity' => 2,
    ])->assertSessionHasErrors('quantity');
});

test('out-of-stock and inactive items in cart are flagged as uncheckoutable, excluded from subtotal, and removable in bulk', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create();
    $availableProduct = Product::factory()->create([
        'store_id' => $store->id,
        'price' => 30000,
        'stock' => 5,
        'is_active' => true,
    ]);
    $outOfStockProduct = Product::factory()->create([
        'store_id' => $store->id,
        'price' => 45000,
        'stock' => 0,
        'is_active' => true,
    ]);
    $inactiveProduct = Product::factory()->inactive()->create([
        'store_id' => $store->id,
        'price' => 50000,
        'stock' => 10,
    ]);

    $cart = Cart::factory()->create(['user_id' => $user->id]);
    $availableItem = CartItem::factory()->create([
        'cart_id' => $cart->id,
        'product_id' => $availableProduct->id,
        'quantity' => 2,
        'is_selected' => true,
        'unit_price_snapshot' => 28000,
    ]);
    $outOfStockItem = CartItem::factory()->create([
        'cart_id' => $cart->id,
        'product_id' => $outOfStockProduct->id,
        'quantity' => 1,
        'is_selected' => true,
        'unit_price_snapshot' => 45000,
    ]);
    $inactiveItem = CartItem::factory()->create([
        'cart_id' => $cart->id,
        'product_id' => $inactiveProduct->id,
        'quantity' => 1,
        'is_selected' => true,
        'unit_price_snapshot' => 50000,
    ]);

    $this->actingAs($user);

    $this->get(route('cart'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('calculation.selectedCount', 1)
            ->where('calculation.subtotal', 60000)
            ->where('calculation.unavailableCount', 2)
            ->where('items', function ($items) use ($availableItem, $outOfStockItem, $inactiveItem): bool {
                $byId = collect($items)->keyBy('id');

                return $byId[(string) $availableItem->id]['isAvailable'] === true
                    && $byId[(string) $availableItem->id]['priceChanged'] === true
                    && $byId[(string) $outOfStockItem->id]['isAvailable'] === false
                    && $byId[(string) $outOfStockItem->id]['unavailableReason'] === 'out_of_stock'
                    && $byId[(string) $outOfStockItem->id]['canCheckout'] === false
                    && $byId[(string) $outOfStockItem->id]['isSelected'] === false
                    && $byId[(string) $inactiveItem->id]['isAvailable'] === false
                    && $byId[(string) $inactiveItem->id]['unavailableReason'] === 'inactive'
                    && $byId[(string) $inactiveItem->id]['isSelected'] === false;
            }));

    $this->from(route('cart'))
        ->patch(route('cart.items.update', $outOfStockItem), [
            'is_selected' => true,
        ])
        ->assertSessionHasErrors('is_selected');

    $this->patch(route('cart.selection.update'), ['is_selected' => true])
        ->assertRedirect();

    expect($availableItem->fresh()->is_selected)->toBeTrue();
    expect($outOfStockItem->fresh()->is_selected)->toBeFalse();
    expect($inactiveItem->fresh()->is_selected)->toBeFalse();

    $this->delete(route('cart.items.destroy-unavailable'))
        ->assertRedirect();

    $this->assertDatabaseHas('cart_items', ['id' => $availableItem->id]);
    $this->assertDatabaseMissing('cart_items', ['id' => $outOfStockItem->id]);
    $this->assertDatabaseMissing('cart_items', ['id' => $inactiveItem->id]);
});

test('cart flags items exceeding live stock, blocks checkout until adjusted, and allows adjusting to available stock', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['price' => 25000, 'stock' => 2, 'is_active' => true]);
    $cart = Cart::factory()->create(['user_id' => $user->id]);
    $item = CartItem::factory()->create([
        'cart_id' => $cart->id,
        'product_id' => $product->id,
        'quantity' => 5,
        'is_selected' => true,
        'unit_price_snapshot' => 25000,
    ]);

    $this->actingAs($user);

    $this->get(route('cart'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('items.0.exceedsStock', true)
            ->where('items.0.canCheckout', false)
            ->where('calculation.hasBlockingSelectionIssue', true));

    $this->from(route('cart'))
        ->patch(route('cart.items.update', $item), ['quantity' => 3])
        ->assertSessionHasErrors('quantity');

    $this->from(route('cart'))
        ->patch(route('cart.items.update', $item), ['quantity' => 2])
        ->assertSessionHasNoErrors();

    $this->get(route('cart'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('items.0.quantity', 2)
            ->where('items.0.exceedsStock', false)
            ->where('items.0.canCheckout', true)
            ->where('calculation.hasBlockingSelectionIssue', false)
            ->where('calculation.subtotal', 50000));
});

test('users cannot modify or delete another users cart items and can toggle store selection or delete selected items', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $storeA = Store::factory()->create();
    $storeB = Store::factory()->create();
    $prodA = Product::factory()->create(['store_id' => $storeA->id, 'stock' => 10, 'is_active' => true]);
    $prodB = Product::factory()->create(['store_id' => $storeB->id, 'stock' => 10, 'is_active' => true]);

    $ownerCart = Cart::factory()->create(['user_id' => $owner->id]);
    $itemA = CartItem::factory()->create([
        'cart_id' => $ownerCart->id,
        'product_id' => $prodA->id,
        'quantity' => 1,
        'is_selected' => true,
    ]);
    $itemB = CartItem::factory()->create([
        'cart_id' => $ownerCart->id,
        'product_id' => $prodB->id,
        'quantity' => 1,
        'is_selected' => true,
    ]);

    Cart::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($otherUser)
        ->patch(route('cart.items.update', $itemA), ['quantity' => 2])
        ->assertForbidden();

    $this->actingAs($otherUser)
        ->delete(route('cart.items.destroy', $itemA))
        ->assertForbidden();

    $this->actingAs($owner)
        ->patch(route('cart.selection.update'), [
            'store_id' => $storeA->id,
            'is_selected' => false,
        ])
        ->assertRedirect();

    expect($itemA->fresh()->is_selected)->toBeFalse();
    expect($itemB->fresh()->is_selected)->toBeTrue();

    $this->actingAs($owner)
        ->delete(route('cart.items.destroy-selected'))
        ->assertRedirect();

    $this->assertDatabaseHas('cart_items', ['id' => $itemA->id]);
    $this->assertDatabaseMissing('cart_items', ['id' => $itemB->id]);
});

test('buy now selects only the purchased product and redirects to cart', function () {
    $user = User::factory()->create();
    $firstProduct = Product::factory()->create(['stock' => 10, 'is_active' => true]);
    $secondProduct = Product::factory()->create(['stock' => 10, 'is_active' => true]);

    $this->actingAs($user);

    $this->post(route('cart.items.store'), [
        'product_id' => $firstProduct->id,
        'quantity' => 1,
    ]);

    $this->post(route('cart.items.store'), [
        'product_id' => $secondProduct->id,
        'quantity' => 2,
        'buy_now' => true,
    ])->assertRedirect(route('cart'));

    $cart = $user->cart()->with('items')->firstOrFail();
    $byProduct = $cart->items->keyBy('product_id');

    expect($byProduct[$firstProduct->id]->is_selected)->toBeFalse();
    expect($byProduct[$secondProduct->id]->is_selected)->toBeTrue();
    expect($byProduct[$secondProduct->id]->quantity)->toBe(2);
});

test('guest can store cart items via cookie token and items merge into user cart on login within stock limits', function () {
    $guestToken = Str::uuid()->toString();
    $productA = Product::factory()->create(['stock' => 5, 'price' => 20000, 'is_active' => true]);
    $productB = Product::factory()->create(['stock' => 8, 'price' => 30000, 'is_active' => true]);

    $this->withCookie(CartServiceInterface::GUEST_COOKIE_NAME, $guestToken)
        ->post(route('cart.items.store'), [
            'product_id' => $productA->id,
            'quantity' => 4,
        ])
        ->assertRedirect();

    $this->withCookie(CartServiceInterface::GUEST_COOKIE_NAME, $guestToken)
        ->post(route('cart.items.store'), [
            'product_id' => $productB->id,
            'quantity' => 2,
        ])
        ->assertRedirect();

    $guestCart = Cart::query()->where('guest_token', $guestToken)->firstOrFail();
    expect($guestCart->items()->count())->toBe(2);

    $user = User::factory()->create([
        'password' => 'password',
    ]);
    $userCart = Cart::factory()->create(['user_id' => $user->id]);
    CartItem::factory()->create([
        'cart_id' => $userCart->id,
        'product_id' => $productA->id,
        'quantity' => 3,
        'is_selected' => true,
    ]);

    $this->withCookie(CartServiceInterface::GUEST_COOKIE_NAME, $guestToken)
        ->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('carts', ['id' => $guestCart->id]);

    $mergedItems = $user->cart()->firstOrFail()->items()->get()->keyBy('product_id');
    expect($mergedItems)->toHaveCount(2);
    expect($mergedItems[$productA->id]->quantity)->toBe(5);
    expect($mergedItems[$productB->id]->quantity)->toBe(2);
});
