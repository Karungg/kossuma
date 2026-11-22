<?php

namespace App\Http\Controllers\Dashboard;

use App\Contracts\Dashboard\AdminDashboardServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __construct(
        public readonly AdminDashboardServiceInterface $dashboardService,
    ) {}

    public function index(Request $request): Response
    {
        $period = is_string($request->query('period')) ? $request->query('period') : '30d';

        return Inertia::render(
            'admin/dashboard/index',
            $this->dashboardService->getDashboardData($period),
        );
    }
}
