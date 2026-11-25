<?php

use App\Contracts\Customer\CustomerAddressServiceInterface;
use App\Http\Controllers\Home\HomeController;
use App\Http\Controllers\Product\ProductController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
require __DIR__.'/cart/cart.php';
require __DIR__.'/customer/account.php';

Route::get('checkout', function (Request $request, CustomerAddressServiceInterface $addressService) {
    $user = $request->user();

    return Inertia::render('customer/checkout/index', [
        'addresses' => $user instanceof User
            ? $addressService->listFormattedForUser($user)
            : [],
    ]);
})->name('checkout');

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
    require __DIR__.'/dashboard/dashboard.php';
    require __DIR__.'/report/report.php';
    require __DIR__.'/category/category.php';
    require __DIR__.'/product/product.php';
    require __DIR__.'/order/order.php';
    require __DIR__.'/review/review.php';
});

require __DIR__.'/notification/notification.php';
require __DIR__.'/settings.php';
