<?php

use App\Http\Controllers\Report\AdminReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:Admin')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::controller(AdminReportController::class)
            ->prefix('reports')
            ->name('reports.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/export', 'export')->name('export');
            });
    });
