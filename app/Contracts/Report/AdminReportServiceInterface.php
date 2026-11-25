<?php

namespace App\Contracts\Report;

interface AdminReportServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getReportData(array $filters = []): array;
}
