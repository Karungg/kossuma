<?php

use App\Http\Controllers\Review\AdminReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:Admin')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::controller(AdminReviewController::class)
            ->prefix('reviews')
            ->name('reviews.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/export', 'export')->name('export');
                Route::post('/{review}/hide', 'hide')->name('hide');
                Route::post('/{review}/restore', 'restore')->name('restore');
                Route::post('/{review}/reply', 'reply')->name('reply');
            });
    });
