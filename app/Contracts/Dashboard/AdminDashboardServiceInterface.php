<?php

namespace App\Contracts\Dashboard;

interface AdminDashboardServiceInterface
{
    /**
     * @return array{
     *     period: '7d'|'30d'|'12m',
     *     periodLabel: string,
     *     comparisonLabel: string,
     *     generatedAtLabel: string,
     *     kpis: array<string, mixed>,
     *     actionQueue: array<string, int>,
     *     salesChart: array<string, mixed>,
     *     orderPipeline: list<array<string, mixed>>,
     *     paymentMethods: list<array<string, mixed>>,
     *     recentActivities: list<array<string, mixed>>,
     *     highlights: array<string, list<array<string, mixed>>>
     * }
     */
    public function getDashboardData(string $period = '30d'): array;
}
