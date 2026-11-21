<?php

namespace App\Services\Export;

use App\Contracts\Export\TabularExportDefinitionInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TabularExportService
{
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

    public function storeToDisk(
        iterable $records,
        string $format,
        TabularExportDefinitionInterface $definition,
        string $directory,
        array $columns = [],
        string $disk = 'local',
    ): array {
        $resolvedColumns = $this->resolveColumns($definition, $columns);
        $extension = match ($format) {
            'xlsx' => 'xlsx',
            'pdf' => 'pdf',
            default => 'csv',
        };

        $filename = $definition->filePrefix().'-'.now()->format('Y-m-d-His').'.'.$extension;
        $storedName = Str::uuid()->toString().'.'.$extension;
        $relativePath = trim($directory, '/').'/'.$storedName;

        $content = match ($extension) {
            'xlsx' => $this->buildXlsxContent($records, $definition, $resolvedColumns),
            'pdf' => $this->buildPdfContent($records, $definition, $resolvedColumns),
            default => $this->buildCsvContent($records, $definition, $resolvedColumns),
        };

        Storage::disk($disk)->put($relativePath, $content);

        return [
            'disk' => $disk,
            'path' => $relativePath,
            'filename' => $filename,
        ];
    }

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

    private function buildCsvContent(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
    ): string {
        $headers = $this->resolveHeaders($definition, $columns);
        $handle = fopen('php://temp', 'w+');

        if ($handle === false) {
            return '';
        }

        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, $headers);

        foreach ($records as $record) {
            fputcsv($handle, $this->mapRow($record, $definition, $columns));
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return is_string($content) ? $content : '';
    }

    private function buildXlsxContent(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
    ): string {
        $headers = $this->resolveHeaders($definition, $columns);
        $tempPath = tempnam(sys_get_temp_dir(), 'kossuma_export_');

        if ($tempPath === false) {
            return '';
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

            $content = file_get_contents($xlsxPath);

            return is_string($content) ? $content : '';
        } finally {
            if (file_exists($xlsxPath)) {
                @unlink($xlsxPath);
            }
        }
    }

    private function buildPdfContent(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
    ): string {
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

        return $pdf->output();
    }

    private function exportCsv(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
        string $filename,
    ): StreamedResponse {
        return response()->streamDownload(function () use ($records, $definition, $columns): void {
            echo $this->buildCsvContent($records, $definition, $columns);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function exportXlsx(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
        string $filename,
    ): StreamedResponse {
        return response()->streamDownload(function () use ($records, $definition, $columns): void {
            echo $this->buildXlsxContent($records, $definition, $columns);
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function exportPdf(
        iterable $records,
        TabularExportDefinitionInterface $definition,
        array $columns,
        string $filename,
    ): Response {
        $content = $this->buildPdfContent($records, $definition, $columns);

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
