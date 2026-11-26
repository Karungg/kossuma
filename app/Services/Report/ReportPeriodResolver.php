<?php

namespace App\Services\Report;

use Carbon\CarbonImmutable;

class ReportPeriodResolver
{
    /**
     * @var array<int, string>
     */
    public const array FULL_MONTHS = [
        1 => 'Januari',
        2 => 'Februari',
        3 => 'Maret',
        4 => 'April',
        5 => 'Mei',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'Agustus',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Desember',
    ];

    /**
     * @var array<int, string>
     */
    public const array SHORT_MONTHS = [
        1 => 'Jan',
        2 => 'Feb',
        3 => 'Mar',
        4 => 'Apr',
        5 => 'Mei',
        6 => 'Jun',
        7 => 'Jul',
        8 => 'Agu',
        9 => 'Sep',
        10 => 'Okt',
        11 => 'Nov',
        12 => 'Des',
    ];

    /**
     * @var array<int, string>
     */
    public const array QUARTER_LABELS = [
        1 => 'Q1 (Jan – Mar)',
        2 => 'Q2 (Apr – Jun)',
        3 => 'Q3 (Jul – Sep)',
        4 => 'Q4 (Okt – Des)',
    ];

    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     period_type: 'day'|'month'|'quarter'|'year'|'range',
     *     compare_mode: 'previous'|'yoy',
     *     date: string,
     *     month: int,
     *     quarter: int,
     *     year: int,
     *     date_from: string,
     *     date_to: string,
     *     current_start: CarbonImmutable,
     *     current_end: CarbonImmutable,
     *     previous_start: CarbonImmutable,
     *     previous_end: CarbonImmutable,
     *     period_label: string,
     *     comparison_label: string,
     *     granularity: 'hour'|'day'|'month'
     * }
     */
    public function resolve(array $filters, ?CarbonImmutable $now = null): array
    {
        $reference = $now ?? CarbonImmutable::now();

        $periodType = $this->normalizePeriodType((string) ($filters['period_type'] ?? 'month'));
        $compareMode = $this->normalizeCompareMode((string) ($filters['compare_mode'] ?? 'previous'));

        $year = $this->normalizeYear($filters['year'] ?? null, $reference->year);
        $month = $this->normalizeMonth($filters['month'] ?? null, $reference->month);
        $quarter = $this->normalizeQuarter($filters['quarter'] ?? null, $reference->quarter);
        $date = $this->parseDate($filters['date'] ?? null) ?? $reference;

        $rangeFrom = $this->parseDate($filters['date_from'] ?? null) ?? $reference->subDays(29);
        $rangeTo = $this->parseDate($filters['date_to'] ?? null) ?? $reference;

        if ($rangeTo->lt($rangeFrom)) {
            [$rangeFrom, $rangeTo] = [$rangeTo, $rangeFrom];
        }

        if ($periodType === 'day') {
            $currentStart = $date->startOfDay();
            $currentEnd = $date->endOfDay();

            if ($compareMode === 'yoy') {
                $previousStart = $currentStart->subYear()->startOfDay();
                $previousEnd = $currentEnd->subYear()->endOfDay();
                $comparisonLabel = 'vs '.$this->formatFullDate($previousStart);
            } else {
                $previousStart = $currentStart->subDay()->startOfDay();
                $previousEnd = $currentEnd->subDay()->endOfDay();
                $comparisonLabel = 'vs '.$this->formatFullDate($previousStart);
            }

            return [
                'period_type' => 'day',
                'compare_mode' => $compareMode,
                'date' => $currentStart->format('Y-m-d'),
                'month' => $month,
                'quarter' => $quarter,
                'year' => $year,
                'date_from' => $currentStart->format('Y-m-d'),
                'date_to' => $currentEnd->format('Y-m-d'),
                'current_start' => $currentStart,
                'current_end' => $currentEnd,
                'previous_start' => $previousStart,
                'previous_end' => $previousEnd,
                'period_label' => 'Harian • '.$this->formatFullDate($currentStart),
                'comparison_label' => $comparisonLabel,
                'granularity' => 'hour',
            ];
        }

        if ($periodType === 'quarter') {
            $startMonth = (($quarter - 1) * 3) + 1;
            $currentStart = CarbonImmutable::create($year, $startMonth, 1)->startOfDay();
            $currentEnd = $currentStart->addMonths(2)->endOfMonth()->endOfDay();

            if ($compareMode === 'yoy') {
                $previousStart = $currentStart->subYear()->startOfDay();
                $previousEnd = $currentEnd->subYear()->endOfMonth()->endOfDay();
                $comparisonLabel = "vs Q{$quarter} ".($year - 1);
            } else {
                $previousStart = $currentStart->subMonths(3)->startOfDay();
                $previousEnd = $previousStart->addMonths(2)->endOfMonth()->endOfDay();
                $prevQuarter = $previousStart->quarter;
                $comparisonLabel = "vs Q{$prevQuarter} ".$previousStart->year;
            }

            return [
                'period_type' => 'quarter',
                'compare_mode' => $compareMode,
                'date' => $date->format('Y-m-d'),
                'month' => $month,
                'quarter' => $quarter,
                'year' => $year,
                'date_from' => $currentStart->format('Y-m-d'),
                'date_to' => $currentEnd->format('Y-m-d'),
                'current_start' => $currentStart,
                'current_end' => $currentEnd,
                'previous_start' => $previousStart,
                'previous_end' => $previousEnd,
                'period_label' => self::QUARTER_LABELS[$quarter].' '.$year,
                'comparison_label' => $comparisonLabel,
                'granularity' => 'month',
            ];
        }

        if ($periodType === 'year') {
            $currentStart = CarbonImmutable::create($year, 1, 1)->startOfDay();
            $currentEnd = CarbonImmutable::create($year, 12, 31)->endOfDay();
            $previousStart = CarbonImmutable::create($year - 1, 1, 1)->startOfDay();
            $previousEnd = CarbonImmutable::create($year - 1, 12, 31)->endOfDay();

            return [
                'period_type' => 'year',
                'compare_mode' => $compareMode,
                'date' => $date->format('Y-m-d'),
                'month' => $month,
                'quarter' => $quarter,
                'year' => $year,
                'date_from' => $currentStart->format('Y-m-d'),
                'date_to' => $currentEnd->format('Y-m-d'),
                'current_start' => $currentStart,
                'current_end' => $currentEnd,
                'previous_start' => $previousStart,
                'previous_end' => $previousEnd,
                'period_label' => "Tahun Fiskal {$year} (Jan – Des)",
                'comparison_label' => 'vs Tahun '.($year - 1),
                'granularity' => 'month',
            ];
        }

        if ($periodType === 'range') {
            $currentStart = $rangeFrom->startOfDay();
            $currentEnd = $rangeTo->endOfDay();
            $spanDays = (int) $currentStart->diffInDays($currentEnd) + 1;

            if ($compareMode === 'yoy') {
                $previousStart = $currentStart->subYear()->startOfDay();
                $previousEnd = $currentEnd->subYear()->endOfDay();
                $comparisonLabel = 'vs periode sama tahun lalu';
            } else {
                $previousEnd = $currentStart->subDay()->endOfDay();
                $previousStart = $previousEnd->subDays($spanDays - 1)->startOfDay();
                $comparisonLabel = "vs {$spanDays} hari sebelumnya";
            }

            $granularity = $spanDays === 1
                ? 'hour'
                : ($spanDays <= 62 ? 'day' : 'month');

            return [
                'period_type' => 'range',
                'compare_mode' => $compareMode,
                'date' => $date->format('Y-m-d'),
                'month' => $month,
                'quarter' => $quarter,
                'year' => $year,
                'date_from' => $currentStart->format('Y-m-d'),
                'date_to' => $currentEnd->format('Y-m-d'),
                'current_start' => $currentStart,
                'current_end' => $currentEnd,
                'previous_start' => $previousStart,
                'previous_end' => $previousEnd,
                'period_label' => $this->formatShortDate($currentStart).' – '.$this->formatShortDate($currentEnd),
                'comparison_label' => $comparisonLabel,
                'granularity' => $granularity,
            ];
        }

        $currentStart = CarbonImmutable::create($year, $month, 1)->startOfDay();
        $currentEnd = $currentStart->endOfMonth()->endOfDay();

        if ($compareMode === 'yoy') {
            $previousStart = $currentStart->subYear()->startOfDay();
            $previousEnd = $previousStart->endOfMonth()->endOfDay();
        } else {
            $previousStart = $currentStart->subMonth()->startOfDay();
            $previousEnd = $previousStart->endOfMonth()->endOfDay();
        }

        $previousMonthLabel = self::SHORT_MONTHS[$previousStart->month].' '.$previousStart->year;

        return [
            'period_type' => 'month',
            'compare_mode' => $compareMode,
            'date' => $date->format('Y-m-d'),
            'month' => $month,
            'quarter' => $quarter,
            'year' => $year,
            'date_from' => $currentStart->format('Y-m-d'),
            'date_to' => $currentEnd->format('Y-m-d'),
            'current_start' => $currentStart,
            'current_end' => $currentEnd,
            'previous_start' => $previousStart,
            'previous_end' => $previousEnd,
            'period_label' => self::FULL_MONTHS[$month].' '.$year,
            'comparison_label' => 'vs '.$previousMonthLabel,
            'granularity' => 'day',
        ];
    }

    /**
     * @return 'day'|'month'|'quarter'|'year'|'range'
     */
    private function normalizePeriodType(string $value): string
    {
        return match (trim($value)) {
            'day' => 'day',
            'quarter' => 'quarter',
            'year' => 'year',
            'range' => 'range',
            default => 'month',
        };
    }

    /**
     * @return 'previous'|'yoy'
     */
    private function normalizeCompareMode(string $value): string
    {
        return trim($value) === 'yoy' ? 'yoy' : 'previous';
    }

    private function normalizeYear(mixed $value, int $fallback): int
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        $year = (int) $value;

        return ($year >= 2020 && $year <= 2100) ? $year : $fallback;
    }

    private function normalizeMonth(mixed $value, int $fallback): int
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        $month = (int) $value;

        return ($month >= 1 && $month <= 12) ? $month : $fallback;
    }

    private function normalizeQuarter(mixed $value, int $fallback): int
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        $quarter = (int) $value;

        return ($quarter >= 1 && $quarter <= 4) ? $quarter : $fallback;
    }

    private function parseDate(mixed $value): ?CarbonImmutable
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function formatFullDate(CarbonImmutable $date): string
    {
        return $date->day.' '.self::FULL_MONTHS[$date->month].' '.$date->year;
    }

    private function formatShortDate(CarbonImmutable $date): string
    {
        return $date->day.' '.self::SHORT_MONTHS[$date->month].' '.$date->year;
    }
}
