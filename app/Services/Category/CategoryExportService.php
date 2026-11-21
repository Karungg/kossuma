<?php

namespace App\Services\Category;

use App\Services\Export\TabularExportService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CategoryExportService
{
    public const ALL_COLUMNS = CategoryExportDefinition::ALL_COLUMNS;

    public const DEFAULT_COLUMNS = CategoryExportDefinition::DEFAULT_COLUMNS;

    public function __construct(
        public readonly TabularExportService $tabularExportService,
        public readonly CategoryExportDefinition $definition,
    ) {}

    public function export(
        Collection $categories,
        string $format,
        array $columns = self::DEFAULT_COLUMNS,
    ): Response|StreamedResponse {
        return $this->tabularExportService->export(
            records: $categories,
            format: $format,
            definition: $this->definition,
            columns: $columns,
        );
    }
}
