<?php

use App\Http\Controllers\Product\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:Admin')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::controller(ProductController::class)
            ->prefix('products')
            ->name('products.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/export', 'export')->name('export');
                Route::get('/import/template', 'importTemplate')->name('import-template');
                Route::post('/import', 'import')->name('import');
                Route::delete('/bulk', 'bulkDestroy')->name('bulk-destroy');
                Route::get('/create', 'create')->name('create');
                Route::post('/', 'store')->name('store');
                Route::get('/{product}/edit', 'edit')->name('edit');
                Route::put('/{product}', 'update')->name('update');
                Route::delete('/{product}', 'destroy')->name('destroy');
            });
    });
