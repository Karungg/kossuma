<?php

namespace App\Providers;

use App\Contracts\Cart\CartServiceInterface;
use App\Contracts\Category\CategoryServiceInterface;
use App\Contracts\Customer\CustomerAddressServiceInterface;
use App\Contracts\Customer\CustomerProfileServiceInterface;
use App\Contracts\Notification\NotificationServiceInterface;
use App\Contracts\Order\AdminOrderServiceInterface;
use App\Contracts\Order\CustomerOrderServiceInterface;
use App\Contracts\Product\ProductServiceInterface;
use App\Contracts\Review\AdminReviewServiceInterface;
use App\Listeners\Cart\MergeGuestCartOnLogin;
use App\Services\Cart\CartService;
use App\Services\Category\CategoryService;
use App\Services\Customer\CustomerAddressService;
use App\Services\Customer\CustomerProfileService;
use App\Services\Notification\NotificationService;
use App\Services\Order\AdminOrderService;
use App\Services\Order\CustomerOrderService;
use App\Services\Product\ProductService;
use App\Services\Review\AdminReviewService;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AdminOrderServiceInterface::class, AdminOrderService::class);
        $this->app->bind(AdminReviewServiceInterface::class, AdminReviewService::class);
        $this->app->bind(CartServiceInterface::class, CartService::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(CustomerAddressServiceInterface::class, CustomerAddressService::class);
        $this->app->bind(CustomerOrderServiceInterface::class, CustomerOrderService::class);
        $this->app->bind(CustomerProfileServiceInterface::class, CustomerProfileService::class);
        $this->app->bind(NotificationServiceInterface::class, NotificationService::class);
        $this->app->bind(ProductServiceInterface::class, ProductService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        Event::listen(Login::class, MergeGuestCartOnLogin::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
