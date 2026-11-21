<?php

namespace App\Concerns;

trait ValidatesTabularExport
{
    protected function tabularExportRules(
        string $table,
        array $allowedColumns,
        array $allowedSorts,
        string $idRule = 'integer',
    ): array {
        $columnsIn = implode(',', $allowedColumns);
        $sortsIn = implode(',', $allowedSorts);

        return [
            'format' => ['required', 'string', 'in:csv,xlsx,pdf'],
            'ids' => ['nullable', 'array'],
            'ids.*' => [$idRule, "exists:{$table},id"],
            'columns' => ['nullable', 'array', 'min:1'],
            'columns.*' => ['required', 'string', 'distinct', "in:{$columnsIn}"],
            'search' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'string', "in:{$sortsIn}"],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }

    protected function tabularExportMessages(): array
    {
        return [
            'format.required' => 'Format ekspor wajib dipilih.',
            'format.in' => 'Format ekspor harus berupa CSV, XLSX, atau PDF.',
            'columns.min' => 'Pilih minimal satu kolom untuk diekspor.',
            'columns.*.in' => 'Kolom ekspor yang dipilih tidak valid.',
        ];
    }
}
