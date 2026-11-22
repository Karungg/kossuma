<?php

namespace App\Http\Controllers\Review;

use App\Contracts\Review\AdminReviewServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\ExportReviewRequest;
use App\Http\Requests\Review\HideReviewRequest;
use App\Http\Requests\Review\ReplyReviewRequest;
use App\Jobs\Export\GenerateTabularExportJob;
use App\Models\Product\ProductReview;
use App\Models\User;
use App\Services\Review\ReviewExportDefinition;
use App\Services\Review\ReviewQueuedExportProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AdminReviewController extends Controller
{
    public function __construct(
        public readonly AdminReviewServiceInterface $reviewService,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', ProductReview::class);

        $filters = $request->only([
            'search',
            'product_id',
            'store_id',
            'rating',
            'visibility',
            'reply_status',
            'date_from',
            'date_to',
            'sort',
            'direction',
        ]);

        return Inertia::render('admin/reviews/index', [
            'reviews' => $this->reviewService->getPaginated($filters),
            'stats' => $this->reviewService->getStats(),
            'options' => $this->reviewService->getFilterOptions(),
            'filters' => $filters,
        ]);
    }

    public function hide(HideReviewRequest $request, ProductReview $review): RedirectResponse
    {
        Gate::authorize('moderate', $review);
        $admin = $this->requireUser($request);

        $this->reviewService->hideReview(
            admin: $admin,
            review: $review,
            reason: (string) $request->validated('reason'),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ulasan berhasil disembunyikan dari halaman produk dan rating telah dihitung ulang.',
        ]);

        return back();
    }

    public function restore(Request $request, ProductReview $review): RedirectResponse
    {
        Gate::authorize('moderate', $review);
        $admin = $this->requireUser($request);

        $this->reviewService->restoreReview(
            admin: $admin,
            review: $review,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ulasan berhasil dipulihkan dan tampil kembali di halaman produk.',
        ]);

        return back();
    }

    public function reply(ReplyReviewRequest $request, ProductReview $review): RedirectResponse
    {
        Gate::authorize('reply', $review);
        $admin = $this->requireUser($request);

        $reply = $request->validated('reply');
        $this->reviewService->saveReply(
            admin: $admin,
            review: $review,
            reply: is_string($reply) ? $reply : null,
        );

        $isCleared = ! is_string($reply) || trim($reply) === '';

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $isCleared
                ? 'Balasan resmi Kossuma telah dihapus.'
                : 'Balasan resmi Kossuma berhasil disimpan.',
        ]);

        return back();
    }

    public function export(ExportReviewRequest $request): RedirectResponse
    {
        Gate::authorize('viewAny', ProductReview::class);
        $admin = $this->requireUser($request);

        $validated = $request->validated();
        $ids = array_map('intval', $validated['ids'] ?? []);
        $columns = $validated['columns'] ?? ReviewExportDefinition::DEFAULT_COLUMNS;

        GenerateTabularExportJob::dispatch(
            userId: (string) $admin->id,
            providerClass: ReviewQueuedExportProvider::class,
            format: (string) $validated['format'],
            filters: [
                'search' => $validated['search'] ?? null,
                'product_id' => $validated['product_id'] ?? null,
                'store_id' => $validated['store_id'] ?? null,
                'rating' => $validated['rating'] ?? null,
                'visibility' => $validated['visibility'] ?? null,
                'reply_status' => $validated['reply_status'] ?? null,
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
            'message' => 'Ekspor ulasan sedang diproses di latar belakang. File akan muncul di notifikasi setelah siap diunduh.',
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
