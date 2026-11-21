<?php

namespace App\Http\Controllers\Customer;

use App\Contracts\Order\CustomerOrderServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CancelOrderRequest;
use App\Http\Requests\Customer\OrderIndexRequest;
use App\Http\Requests\Customer\StoreOrderReviewRequest;
use App\Models\Order\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CustomerOrderController extends Controller
{
    public function __construct(
        public readonly CustomerOrderServiceInterface $orderService,
    ) {}

    public function index(OrderIndexRequest $request): Response
    {
        $user = $this->requireUser($request);
        $validated = $request->validated();

        return Inertia::render(
            'customer/orders/index',
            $this->orderService->getOrdersPageData($user, $validated),
        );
    }

    public function buyAgain(Request $request, Order $order): RedirectResponse
    {
        $user = $this->requireUser($request);
        Gate::forUser($user)->authorize('buyAgain', $order);

        $result = $this->orderService->buyAgain($user, $order);

        if ($result['addedCount'] === 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Semua produk pada pesanan ini sedang habis atau tidak tersedia.',
            ]);

            return back();
        }

        $message = count($result['skippedNames']) > 0
            ? "{$result['addedCount']} produk dimasukkan ke keranjang. Sebagian produk sedang tidak tersedia."
            : "{$result['addedCount']} produk berhasil dimasukkan kembali ke keranjang.";

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);

        return to_route('cart');
    }

    public function cancel(CancelOrderRequest $request, Order $order): RedirectResponse
    {
        $user = $this->requireUser($request);
        Gate::forUser($user)->authorize('cancel', $order);

        $validated = $request->validated();
        $this->orderService->cancelOrder($user, $order, (string) $validated['reason']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pesanan {$order->order_number} berhasil dibatalkan.",
        ]);

        return back();
    }

    public function confirmReceived(Request $request, Order $order): RedirectResponse
    {
        $user = $this->requireUser($request);
        Gate::forUser($user)->authorize('confirmReceived', $order);

        $this->orderService->confirmReceived($user, $order);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Pesanan ditandai selesai. Anda kini dapat menulis ulasan produk.',
        ]);

        return back();
    }

    public function storeReview(StoreOrderReviewRequest $request, Order $order): RedirectResponse
    {
        $user = $this->requireUser($request);
        Gate::forUser($user)->authorize('review', $order);

        $validated = $request->validated();

        $this->orderService->submitItemReview(
            user: $user,
            order: $order,
            orderItemId: (int) $validated['order_item_id'],
            rating: (int) $validated['rating'],
            comment: (string) $validated['comment'],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Terima kasih! Ulasan Anda berhasil dikirim.',
        ]);

        return back();
    }

    private function requireUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        return $user;
    }
}
