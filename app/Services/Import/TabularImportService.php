<?php

namespace App\Services\Import;

use App\Contracts\Import\TabularImportHandlerInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class TabularImportService
{
    public function downloadTemplate(TabularImportHandlerInterface $handler): StreamedResponse
    {
        $filename = $handler->templateFilePrefix().'-template.xlsx';

        return response()->streamDownload(function () use ($handler): void {
            echo $this->buildTemplateContent($handler);
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function processFile(
        string $disk,
        string $path,
        TabularImportHandlerInterface $handler,
        array $context = [],
    ): array {
        $absolutePath = Storage::disk($disk)->path($path);

        if (! file_exists($absolutePath)) {
            return [
                'created' => 0,
                'updated' => 0,
                'failed' => [
                    [
                        'row' => 0,
                        'reference' => '-',
                        'error' => 'File impor tidak ditemukan di penyimpanan.',
                    ],
                ],
            ];
        }

        $reader = new XlsxReader;
        $reader->open($absolutePath);

        $created = 0;
        $updated = 0;
        $failed = [];
        $headers = [];

        try {
            foreach ($reader->getSheetIterator() as $sheet) {
                $rowIndex = 0;

                foreach ($sheet->getRowIterator() as $row) {
                    $rowIndex++;
                    $values = $row->toArray();

                    if ($rowIndex === 1) {
                        $headers = array_map(
                            static fn (mixed $cell): string => Str::of((string) $cell)->trim()->lower()->replace(' ', '_')->toString(),
                            $values,
                        );

                        continue;
                    }

                    if ($this->isEmptyRow($values)) {
                        continue;
                    }

                    $mapped = [];

                    foreach ($headers as $colIndex => $headerKey) {
                        if ($headerKey === '') {
                            continue;
                        }

                        $rawValue = $values[$colIndex] ?? null;
                        $mapped[$headerKey] = is_string($rawValue) ? trim($rawValue) : $rawValue;
                    }

                    $reference = (string) ($mapped['name'] ?? $mapped['nama'] ?? $mapped['slug'] ?? "Baris {$rowIndex}");

                    try {
                        $outcome = DB::transaction(
                            static fn (): string => $handler->importRow($mapped, $rowIndex, $context),
                        );

                        if ($outcome === 'updated') {
                            $updated++;
                        } else {
                            $created++;
                        }
                    } catch (ValidationException $exception) {
                        $messages = [];

                        foreach ($exception->errors() as $fieldErrors) {
                            foreach ($fieldErrors as $message) {
                                $messages[] = $message;
                            }
                        }

                        $failed[] = [
                            'row' => $rowIndex,
                            'reference' => $reference,
                            'error' => implode('; ', $messages),
                        ];
                    } catch (Throwable $exception) {
                        $failed[] = [
                            'row' => $rowIndex,
                            'reference' => $reference,
                            'error' => $exception->getMessage(),
                        ];
                    }
                }

                break;
            }
        } finally {
            $reader->close();
        }

        return [
            'created' => $created,
            'updated' => $updated,
            'failed' => $failed,
        ];
    }

    public function storeErrorReport(
        array $failedRows,
        string $directory,
        string $prefix,
        string $disk = 'local',
    ): array {
        $filename = $prefix.'-error-'.now()->format('Y-m-d-His').'.xlsx';
        $storedName = Str::uuid()->toString().'.xlsx';
        $relativePath = trim($directory, '/').'/'.$storedName;

        $tempPath = tempnam(sys_get_temp_dir(), 'kossuma_import_errors_');

        if ($tempPath === false) {
            return [
                'disk' => $disk,
                'path' => '',
                'filename' => $filename,
            ];
        }

        $xlsxPath = $tempPath.'.xlsx';
        @unlink($tempPath);

        try {
            $writer = new XlsxWriter;
            $writer->openToFile($xlsxPath);
            $writer->getCurrentSheet()->setName('Laporan Error');

            $headerStyle = new Style(
                fontBold: true,
                fontColor: 'DC2626',
                backgroundColor: 'FEF2F2',
            );

            $writer->addRow(Row::fromValuesWithStyle([
                'Baris Excel',
                'Referensi Data',
                'Alasan Gagal',
            ], $headerStyle));

            foreach ($failedRows as $failedRow) {
                $writer->addRow(Row::fromValues([
                    (int) ($failedRow['row'] ?? 0),
                    (string) ($failedRow['reference'] ?? '-'),
                    (string) ($failedRow['error'] ?? 'Kesalahan tidak diketahui.'),
                ]));
            }

            $writer->close();

            $content = file_get_contents($xlsxPath);
            Storage::disk($disk)->put($relativePath, is_string($content) ? $content : '');
        } finally {
            if (file_exists($xlsxPath)) {
                @unlink($xlsxPath);
            }
        }

        return [
            'disk' => $disk,
            'path' => $relativePath,
            'filename' => $filename,
        ];
    }

    private function buildTemplateContent(TabularImportHandlerInterface $handler): string
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'kossuma_template_');

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

            $writer->getCurrentSheet()->setName($handler->templateSheetName());
            $writer->addRow(Row::fromValuesWithStyle($handler->templateHeaders(), $headerStyle));

            foreach ($handler->templateExampleRows() as $exampleRow) {
                $writer->addRow(Row::fromValues($exampleRow));
            }

            $guideSheet = $writer->addNewSheetAndMakeItCurrent();
            $guideSheet->setName($handler->guideSheetName());
            $writer->addRow(Row::fromValuesWithStyle([
                'Kolom',
                'Status',
                'Keterangan & Format',
                'Contoh',
            ], $headerStyle));

            foreach ($handler->templateGuideRows() as $guideRow) {
                $writer->addRow(Row::fromValues($guideRow));
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

    private function isEmptyRow(array $values): bool
    {
        foreach ($values as $value) {
            if ($value !== null && trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }
}
