<?php

namespace App\Services\Export;

use App\Contracts\Export\TabularExportDefinitionInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TabularExportService
{
    /**
     * @param  iterable<int, mixed>  $records
     * @param  array<int, string>  $columns
     */
    public function export(
        iterable $records,
        string $format,
        TabularExportDefinitionInterface $definition,
        array $columns = [],
    ): Response|StreamedResponse {
        $resolvedColumns = $this->resolveColumns($definition, $columns);
        $fileBase = $definition->filePrefix().'-'.now()->format('Y-m-d');

        return match ($format) {
            'xlsx' => $this->exportXlsx($records, $definition, $resolvedColumns, "{$fileBase}.xlsx"),
            'pdf' => $this->exportPdf($records, $definition, $resolvedColumns, "{$fileBase}.pdf"),
            default => $this->exportCsv($records, $definition, $resolvedColumns, "{$fileBase}.csv"),
        };
    }

    /**
     * @param  array<int, string>  $requestedColumns
     * @return array<int, string>
     */
    private function resolveColumns(
        TabularExportDefinitionInterface $definition,
        array $requestedColumns,
    ): array {
        $allColumns = array_keys($definition->columnLabels());

        if ($requestedColumns === []) {
            return $definition->defaultColumns();
        }

        $filtered = array_values(array_filter(
            $allColumns,
            static fn (string $column): bool => in_array($column, $requestedColumns, true),
        ));

        return $filtered !== [] ? $filtered : $definition->defaultColumns();
    }

    /**
     * @param  array<int, string>  $columns
     * @return array<int, string>
     */
    private function resolveHeaders(
        TabularExportDefinitionInterface $definition,
        array $columns,
    ): array {
        $labels = $definition->columnLabels();

        return array_map(
            static fn (string $column): string => $labels[$column] ?? $column,
            $columns,
        );
    }

    /**
     * @param  array<int, string>  $columns
     * @return array<int, int|string>
     */
    private function mapRow(
        mixed $record,
        TabularExportDefinitionInterface $definition,
        array $columns,
    ): array {
        return array_map(
            static fn (string $column): int|string => $definition->resolveCellValue($record, $column),
            $columns,
        );
    }

    /**
     * @param  iterable<int, mixed>  $records
     * @param  array<int, string>  $columns
     */
    private function exportCsv(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
        string $filename,
    ): StreamedResponse {
        $headers = $this->resolveHeaders($definition, $columns);

        return response()->streamDownload(function () use ($records, $definition, $columns, $headers): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            // UTF-8 BOM so Excel displays Indonesian characters cleanly.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, $headers);

            foreach ($records as $record) {
                fputcsv($handle, $this->mapRow($record, $definition, $columns));
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  iterable<int, mixed>  $records
     * @param  array<int, string>  $columns
     */
    private function exportXlsx(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
        string $filename,
    ): StreamedResponse {
        $headers = $this->resolveHeaders($definition, $columns);

        return response()->streamDownload(function () use ($records, $definition, $columns, $headers): void {
            $tempPath = tempnam(sys_get_temp_dir(), 'kossuma_export_');

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

                foreach ($records as $record) {
                    $writer->addRow(Row::fromValues($this->mapRow($record, $definition, $columns)));
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
     * @param  iterable<int, mixed>  $records
     * @param  array<int, string>  $columns
     */
    private function exportPdf(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
        string $filename,
    ): Response {
        $headers = array_combine($columns, $this->resolveHeaders($definition, $columns));
        $rows = [];

        foreach ($records as $record) {
            $row = [];

            foreach ($columns as $column) {
                $row[$column] = $definition->resolveCellValue($record, $column);
            }

            $rows[] = $row;
        }

        $pdf = Pdf::loadView('exports.tabular-pdf', [
            'documentTitle' => $definition->documentTitle(),
            'itemLabel' => $definition->itemLabel(),
            'columns' => $columns,
            'headers' => $headers,
            'rows' => $rows,
            'total' => count($rows),
            'printedAt' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download($filename);
    }
}
