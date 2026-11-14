<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('cart', 'cart')->name('cart');
Route::inertia('products/{slug}', 'products/show')->name('products.show');
Route::inertia('about', 'about')->name('about');
Route::inertia('blog', 'blog')->name('blog');
Route::inertia('docs', 'docs')->name('docs');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
