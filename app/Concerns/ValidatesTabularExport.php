<?php

namespace App\Concerns;

trait ValidatesTabularExport
{
    /**
     * @param  array<int, string>  $allowedColumns
     * @param  array<int, string>  $allowedSorts
     * @return array<string, array<int, string>>
     */
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

    /**
     * @return array<string, string>
     */
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
