<?php

namespace App\Http\Controllers\Report;

use App\Contracts\Report\AdminReportServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Report\ExportAdminReportRequest;
use App\Jobs\Report\GenerateOperationalReportExportJob;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportController extends Controller
{
    /**
     * @var list<string>
     */
    private const array FILTER_KEYS = [
        'tab',
        'period_type',
        'compare_mode',
        'date',
        'month',
        'quarter',
        'year',
        'date_from',
        'date_to',
        'store_id',
        'category_id',
        'payment_method',
        'status_scope',
    ];

    public function __construct(
        public readonly AdminReportServiceInterface $reportService,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render(
            'admin/reports/index',
            $this->reportService->getReportData($request->only(self::FILTER_KEYS)),
        );
    }

    public function export(ExportAdminReportRequest $request): RedirectResponse
    {
        $admin = $request->user();

        if (! $admin instanceof User) {
            abort(403);
        }

        $validated = $request->validated();

        $filters = [
            'period_type' => $validated['period_type'] ?? null,
            'compare_mode' => $validated['compare_mode'] ?? null,
            'date' => $validated['date'] ?? null,
            'month' => $validated['month'] ?? null,
            'quarter' => $validated['quarter'] ?? null,
            'year' => $validated['year'] ?? null,
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'store_id' => $validated['store_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'payment_method' => $validated['payment_method'] ?? null,
            'status_scope' => $validated['status_scope'] ?? null,
        ];

        GenerateOperationalReportExportJob::dispatch(
            userId: (string) $admin->id,
            format: (string) $validated['format'],
            scope: (string) ($validated['scope'] ?? 'all'),
            filters: $filters,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ekspor laporan sedang diproses di latar belakang. File akan muncul di notifikasi setelah siap diunduh.',
        ]);

        return back();
    }
}
