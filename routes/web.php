<?php

use App\Http\Controllers\Product\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'home/index')->name('home');
Route::inertia('cart', 'customer/cart/index')->name('cart');
Route::inertia('checkout', 'customer/checkout/index')->name('checkout');
Route::get('checkout/payment', function (Request $request) {
    return Inertia::render('customer/payment/index', [
        'method' => $request->query('method', 'qris'),
        'bank' => $request->query('bank', 'bsi'),
        'total' => (int) $request->query('total', 35000),
        'orderId' => $request->query('order_id', 'KSM-'.date('Ymd').'-0842'),
    ]);
})->name('checkout.payment');
Route::get('products/{slug}', [ProductController::class, 'show'])->name('products.show');
Route::inertia('about', 'home/about')->name('about');
Route::inertia('blog', 'home/blog')->name('blog');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')
        ->middleware('role:Admin')
        ->name('dashboard');

    require __DIR__.'/category/category.php';
    require __DIR__.'/product/product.php';
});

require __DIR__.'/notification/notification.php';
require __DIR__.'/settings.php';
