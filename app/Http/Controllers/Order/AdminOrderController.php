<?php

namespace App\Http\Controllers\Order;

use App\Contracts\Order\AdminOrderServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CancelAdminOrderRequest;
use App\Http\Requests\Order\CompleteOrderRequest;
use App\Http\Requests\Order\ConfirmOrderPaymentRequest;
use App\Http\Requests\Order\ExportOrderRequest;
use App\Http\Requests\Order\ShipOrderRequest;
use App\Http\Requests\Order\StoreOrderInternalNoteRequest;
use App\Http\Requests\Order\StoreOrderTrackingRequest;
use App\Jobs\Export\GenerateTabularExportJob;
use App\Models\Order\Order;
use App\Models\User;
use App\Services\Order\OrderExportDefinition;
use App\Services\Order\OrderQueuedExportProvider;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    public function __construct(
        public readonly AdminOrderServiceInterface $orderService,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Order::class);

        $filters = $request->only([
            'search',
            'status',
            'payment_status',
            'payment_method',
            'store_id',
            'product_id',
            'shipping_courier',
            'review_status',
            'needs_attention',
            'date_from',
            'date_to',
            'sort',
            'direction',
        ]);

        return Inertia::render('admin/orders/index', [
            'orders' => $this->orderService->getPaginated($filters),
            'stats' => $this->orderService->getStats(),
            'statusCounts' => $this->orderService->getStatusCounts(),
            'options' => $this->orderService->getFilterOptions(),
            'filters' => $filters,
        ]);
    }

    public function show(Order $order): Response
    {
        Gate::authorize('viewAdmin', $order);

        return Inertia::render('admin/orders/show', [
            'order' => $this->orderService->getOrderDetail($order),
            'couriers' => $this->orderService->getFilterOptions()['couriers'],
        ]);
    }

    public function invoice(Order $order): HttpResponse
    {
        Gate::authorize('viewAdmin', $order);

        $detail = $this->orderService->getOrderDetail($order);
        $pdf = Pdf::loadView('exports.order-invoice', [
            'order' => $detail,
            'printedAt' => now()->format('d/m/Y H:i').' WIB',
        ])->setPaper('a4', 'portrait');

        $filename = 'invoice-'.preg_replace('/[^A-Za-z0-9\-]+/', '-', $order->order_number).'.pdf';

        return $pdf->download($filename);
    }

    public function confirmPayment(ConfirmOrderPaymentRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('manage', $order);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $this->orderService->confirmPayment(
            admin: $admin,
            order: $order,
            note: isset($validated['note']) ? (string) $validated['note'] : null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pembayaran pesanan {$order->order_number} berhasil dikonfirmasi.",
        ]);

        return back();
    }

    public function ship(ShipOrderRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('manage', $order);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $this->orderService->shipOrder(
            admin: $admin,
            order: $order,
            shippingCourier: (string) $validated['shipping_courier'],
            trackingNumber: (string) $validated['tracking_number'],
            note: isset($validated['note']) ? (string) $validated['note'] : null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Informasi pengiriman & nomor resi pesanan {$order->order_number} berhasil disimpan.",
        ]);

        return back();
    }

    public function storeTracking(StoreOrderTrackingRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('manage', $order);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $this->orderService->addTrackingUpdate(
            admin: $admin,
            order: $order,
            title: (string) $validated['title'],
            description: isset($validated['description']) ? (string) $validated['description'] : null,
            location: isset($validated['location']) ? (string) $validated['location'] : null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Pembaruan riwayat pengiriman berhasil ditambahkan.',
        ]);

        return back();
    }

    public function complete(CompleteOrderRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('manage', $order);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $this->orderService->completeOrder(
            admin: $admin,
            order: $order,
            note: isset($validated['note']) ? (string) $validated['note'] : null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pesanan {$order->order_number} berhasil ditandai selesai.",
        ]);

        return back();
    }

    public function cancel(CancelAdminOrderRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('manage', $order);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $this->orderService->cancelOrder(
            admin: $admin,
            order: $order,
            reason: (string) $validated['reason'],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pesanan {$order->order_number} dibatalkan dan stok produk telah dikembalikan.",
        ]);

        return back();
    }

    public function storeInternalNote(StoreOrderInternalNoteRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('manage', $order);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $this->orderService->addInternalNote(
            admin: $admin,
            order: $order,
            note: (string) $validated['note'],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Catatan tindak lanjut internal berhasil disimpan.',
        ]);

        return back();
    }

    public function export(ExportOrderRequest $request): RedirectResponse
    {
        Gate::authorize('viewAny', Order::class);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $ids = array_map('intval', $validated['ids'] ?? []);
        $columns = $validated['columns'] ?? OrderExportDefinition::DEFAULT_COLUMNS;

        GenerateTabularExportJob::dispatch(
            userId: (string) $admin->id,
            providerClass: OrderQueuedExportProvider::class,
            format: (string) $validated['format'],
            filters: [
                'search' => $validated['search'] ?? null,
                'status' => $validated['status'] ?? null,
                'payment_status' => $validated['payment_status'] ?? null,
                'payment_method' => $validated['payment_method'] ?? null,
                'store_id' => $validated['store_id'] ?? null,
                'product_id' => $validated['product_id'] ?? null,
                'shipping_courier' => $validated['shipping_courier'] ?? null,
                'review_status' => $validated['review_status'] ?? null,
                'needs_attention' => $validated['needs_attention'] ?? null,
                'date_from' => $validated['date_from'] ?? null,
                'date_to' => $validated['date_to'] ?? null,
                'sort' => $validated['sort'] ?? null,
                'direction' => $validated['direction'] ?? null,
            ],
            ids: $ids,
            columns: $columns,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ekspor transaksi sedang diproses di latar belakang. File akan muncul di notifikasi setelah siap diunduh.',
        ]);

        return back();
    }

    private function requireUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(403);
        }

        return $user;
    }
}
