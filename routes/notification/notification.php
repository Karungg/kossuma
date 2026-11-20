<?php

use App\Http\Controllers\Notification\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')
    ->prefix('notifications')
    ->name('notifications.')
    ->controller(NotificationController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::patch('/read-all', 'markAllAsRead')->name('read-all');
        Route::delete('/read', 'destroyRead')->name('destroy-read');
        Route::patch('/{notification}/read', 'markAsRead')->name('read');
        Route::delete('/{notification}', 'destroy')->name('destroy');
    });
