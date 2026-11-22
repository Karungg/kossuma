<?php

use App\Http\Controllers\Order\AdminOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:Admin')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::controller(AdminOrderController::class)
            ->prefix('orders')
            ->name('orders.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/export', 'export')->name('export');
                Route::get('/{order}', 'show')->name('show');
                Route::get('/{order}/invoice', 'invoice')->name('invoice');
                Route::post('/{order}/confirm-payment', 'confirmPayment')->name('confirm-payment');
                Route::post('/{order}/ship', 'ship')->name('ship');
                Route::post('/{order}/tracking', 'storeTracking')->name('tracking');
                Route::post('/{order}/complete', 'complete')->name('complete');
                Route::post('/{order}/cancel', 'cancel')->name('cancel');
                Route::post('/{order}/internal-notes', 'storeInternalNote')->name('internal-notes.store');
            });
    });
