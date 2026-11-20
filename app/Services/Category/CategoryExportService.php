<?php

namespace App\Services\Category;

use App\Models\Category\Category;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CategoryExportService
{
    /**
     * @var array<int, string>
     */
    public const ALL_COLUMNS = [
        'name',
        'slug',
        'description',
        'products_count',
        'created_at',
        'updated_at',
    ];

    /**
     * @var array<int, string>
     */
    public const DEFAULT_COLUMNS = [
        'name',
        'slug',
        'description',
        'products_count',
    ];

    /**
     * @var array<string, string>
     */
    private const COLUMN_LABELS = [
        'name' => 'Nama Kategori',
        'slug' => 'Slug',
        'description' => 'Deskripsi',
        'products_count' => 'Jumlah Produk',
        'created_at' => 'Dibuat',
        'updated_at' => 'Diperbarui',
    ];

    /**
     * @param  Collection<int, Category>  $categories
     * @param  array<int, string>  $columns
     */
    public function export(
        Collection $categories,
        string $format,
        array $columns = self::DEFAULT_COLUMNS,
    ): Response|StreamedResponse {
        $resolvedColumns = $this->resolveColumns($columns);
        $fileBase = 'kategori-kossuma-'.now()->format('Y-m-d');

        return match ($format) {
            'xlsx' => $this->exportXlsx($categories, $resolvedColumns, "{$fileBase}.xlsx"),
            'pdf' => $this->exportPdf($categories, $resolvedColumns, "{$fileBase}.pdf"),
            default => $this->exportCsv($categories, $resolvedColumns, "{$fileBase}.csv"),
        };
    }

    /**
     * @param  array<int, string>  $columns
     * @return array<int, string>
     */
    private function resolveColumns(array $columns): array
    {
        $filtered = array_values(array_filter(
            self::ALL_COLUMNS,
            fn (string $column): bool => in_array($column, $columns, true),
        ));

        return $filtered !== [] ? $filtered : self::DEFAULT_COLUMNS;
    }

    /**
     * @param  array<int, string>  $columns
     * @return array<int, string>
     */
    private function resolveHeaders(array $columns): array
    {
        return array_map(
            fn (string $column): string => self::COLUMN_LABELS[$column] ?? $column,
            $columns,
        );
    }

    /**
     * @param  array<int, string>  $columns
     * @return array<int, int|string>
     */
    private function mapRow(Category $category, array $columns): array
    {
        return array_map(
            fn (string $column): int|string => $this->resolveCellValue($category, $column),
            $columns,
        );
    }

    private function resolveCellValue(Category $category, string $column): int|string
    {
        return match ($column) {
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description !== null && trim($category->description) !== '' ? $category->description : '-',
            'products_count' => (int) ($category->products_count ?? 0),
            'created_at' => $category->created_at?->format('d/m/Y H:i') ?? '-',
            'updated_at' => $category->updated_at?->format('d/m/Y H:i') ?? '-',
            default => '-',
        };
    }

    /**
     * @param  Collection<int, Category>  $categories
     * @param  array<int, string>  $columns
     */
    private function exportCsv(Collection $categories, array $columns, string $filename): StreamedResponse
    {
        $headers = $this->resolveHeaders($columns);

        return response()->streamDownload(function () use ($categories, $columns, $headers): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            // UTF-8 BOM so Excel displays Indonesian characters cleanly.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, $headers);

            foreach ($categories as $category) {
                fputcsv($handle, $this->mapRow($category, $columns));
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  Collection<int, Category>  $categories
     * @param  array<int, string>  $columns
     */
    private function exportXlsx(Collection $categories, array $columns, string $filename): StreamedResponse
    {
        $headers = $this->resolveHeaders($columns);

        return response()->streamDownload(function () use ($categories, $columns, $headers): void {
            $tempPath = tempnam(sys_get_temp_dir(), 'kossuma_categories_');

            if ($tempPath === false) {
                return;
            }

            $xlsxPath = $tempPath.'.xlsx';
            @unlink($tempPath);

            try {
                $writer = new XlsxWriter;
                $writer->openToFile($xlsxPath);

                $headerStyle = new Style(
                    fontBold: true,
                    fontColor: '7D3394',
                    backgroundColor: 'F0E6F5',
                );

                $writer->addRow(Row::fromValuesWithStyle($headers, $headerStyle));

                foreach ($categories as $category) {
                    $writer->addRow(Row::fromValues($this->mapRow($category, $columns)));
                }

                $writer->close();

                readfile($xlsxPath);
            } finally {
                if (file_exists($xlsxPath)) {
                    @unlink($xlsxPath);
                }
            }
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * @param  Collection<int, Category>  $categories
     * @param  array<int, string>  $columns
     */
    private function exportPdf(Collection $categories, array $columns, string $filename): Response
    {
        $headers = array_combine($columns, $this->resolveHeaders($columns));
        $rows = $categories
            ->map(function (Category $category) use ($columns): array {
                $row = [];

                foreach ($columns as $column) {
                    $row[$column] = $this->resolveCellValue($category, $column);
                }

                return $row;
            })
            ->all();

        $pdf = Pdf::loadView('exports.categories-pdf', [
            'columns' => $columns,
            'headers' => $headers,
            'rows' => $rows,
            'total' => $categories->count(),
            'printedAt' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download($filename);
    }
}
