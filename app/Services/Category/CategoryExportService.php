<?php

namespace App\Services\Category;

use App\Models\Category\Category;
use App\Services\Export\TabularExportService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CategoryExportService
{
    /**
     * @var array<int, string>
     */
    public const ALL_COLUMNS = CategoryExportDefinition::ALL_COLUMNS;

    /**
     * @var array<int, string>
     */
    public const DEFAULT_COLUMNS = CategoryExportDefinition::DEFAULT_COLUMNS;

    public function __construct(
        public readonly TabularExportService $tabularExportService,
        public readonly CategoryExportDefinition $definition,
    ) {}

    /**
     * @param  Collection<int, Category>  $categories
     * @param  array<int, string>  $columns
     */
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
