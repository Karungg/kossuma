<?php

use App\Http\Controllers\Cart\CartController;
use Illuminate\Support\Facades\Route;

Route::get('cart', [CartController::class, 'index'])->name('cart');

Route::prefix('cart')->name('cart.')->group(function () {
    Route::post('items', [CartController::class, 'store'])->name('items.store');
    Route::delete('items/selected', [CartController::class, 'destroySelected'])->name('items.destroy-selected');
    Route::delete('items/unavailable', [CartController::class, 'destroyUnavailable'])->name('items.destroy-unavailable');
    Route::patch('items/{cartItem}', [CartController::class, 'update'])
        ->whereNumber('cartItem')
        ->name('items.update');
    Route::delete('items/{cartItem}', [CartController::class, 'destroy'])
        ->whereNumber('cartItem')
        ->name('items.destroy');
    Route::patch('selection', [CartController::class, 'updateSelection'])->name('selection.update');
});
