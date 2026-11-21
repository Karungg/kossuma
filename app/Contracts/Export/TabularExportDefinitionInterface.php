<?php

namespace App\Contracts\Export;

interface TabularExportDefinitionInterface
{
    public function filePrefix(): string;

    public function documentTitle(): string;

    public function itemLabel(): string;

    /**
     * Ordered map of column key => human-readable header label.
     *
     * @return array<string, string>
     */
    public function columnLabels(): array;

    /**
     * Default visible column keys when no explicit selection is provided.
     *
     * @return array<int, string>
     */
    public function defaultColumns(): array;

    public function resolveCellValue(mixed $record, string $column): int|string;
}
