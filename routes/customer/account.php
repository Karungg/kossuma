<?php

use App\Http\Controllers\Customer\CustomerAddressController;
use App\Http\Controllers\Customer\CustomerOrderController;
use App\Http\Controllers\Customer\CustomerSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('orders', [CustomerOrderController::class, 'index'])->name('orders.index');
    Route::post('orders/{order}/buy-again', [CustomerOrderController::class, 'buyAgain'])
        ->whereNumber('order')
        ->name('orders.buy-again');
    Route::post('orders/{order}/cancel', [CustomerOrderController::class, 'cancel'])
        ->whereNumber('order')
        ->name('orders.cancel');
    Route::post('orders/{order}/confirm-received', [CustomerOrderController::class, 'confirmReceived'])
        ->whereNumber('order')
        ->name('orders.confirm-received');
    Route::post('orders/{order}/reviews', [CustomerOrderController::class, 'storeReview'])
        ->whereNumber('order')
        ->name('orders.reviews.store');

    Route::get('settings', [CustomerSettingsController::class, 'index'])->name('settings.index');
    Route::patch('settings/profile', [CustomerSettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::delete('settings/profile/avatar', [CustomerSettingsController::class, 'destroyAvatar'])->name('settings.profile.avatar.destroy');
    Route::put('settings/password', [CustomerSettingsController::class, 'updatePassword'])
        ->middleware('throttle:6,1')
        ->name('settings.password.update');

    Route::post('settings/addresses', [CustomerAddressController::class, 'store'])->name('settings.addresses.store');
    Route::patch('settings/addresses/{address}', [CustomerAddressController::class, 'update'])
        ->whereNumber('address')
        ->name('settings.addresses.update');
    Route::patch('settings/addresses/{address}/primary', [CustomerAddressController::class, 'setPrimary'])
        ->whereNumber('address')
        ->name('settings.addresses.primary');
    Route::delete('settings/addresses/{address}', [CustomerAddressController::class, 'destroy'])
        ->whereNumber('address')
        ->name('settings.addresses.destroy');
});
