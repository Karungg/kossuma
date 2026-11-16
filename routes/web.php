<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('cart', 'cart')->name('cart');
Route::inertia('checkout', 'checkout')->name('checkout');
Route::get('checkout/payment', function (Request $request) {
    return Inertia::render('checkout/payment', [
        'method' => $request->query('method', 'qris'),
        'bank' => $request->query('bank', 'bsi'),
        'total' => (int) $request->query('total', 35000),
        'orderId' => $request->query('order_id', 'KSM-'.date('Ymd').'-0842'),
    ]);
})->name('checkout.payment');
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
