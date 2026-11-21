<?php

namespace App\Contracts\Export;

interface TabularExportDefinitionInterface
{
    public function filePrefix(): string;

    public function documentTitle(): string;

    public function itemLabel(): string;

    public function columnLabels(): array;

    public function defaultColumns(): array;

    public function resolveCellValue(mixed $record, string $column): int|string;
}
