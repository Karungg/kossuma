<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('cart', 'cart')->name('cart');
Route::get('products/{slug}', function (string $slug) {
    return Inertia::render('products/show', [
        'slug' => $slug,
    ]);
})->name('products.show');
Route::inertia('about', 'about')->name('about');
Route::inertia('blog', 'blog')->name('blog');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
