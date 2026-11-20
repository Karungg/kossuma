<?php

namespace App\Http\Requests\Category;

use App\Services\Category\CategoryExportService;
use Illuminate\Foundation\Http\FormRequest;

class ExportCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        $allowedColumns = implode(',', CategoryExportService::ALL_COLUMNS);

        return [
            'format' => ['required', 'string', 'in:csv,xlsx,pdf'],
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer', 'exists:categories,id'],
            'columns' => ['nullable', 'array', 'min:1'],
            'columns.*' => ['required', 'string', 'distinct', "in:{$allowedColumns}"],
            'search' => ['nullable', 'string', 'max:120'],
            'product_status' => ['nullable', 'string', 'in:with_products,without_products'],
            'description_status' => ['nullable', 'string', 'in:filled,empty'],
            'sort' => ['nullable', 'string', 'in:name,slug,products_count,created_at,updated_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'format.required' => 'Format ekspor wajib dipilih.',
            'format.in' => 'Format ekspor harus berupa CSV, XLSX, atau PDF.',
            'columns.min' => 'Pilih minimal satu kolom untuk diekspor.',
            'columns.*.in' => 'Kolom ekspor yang dipilih tidak valid.',
        ];
    }
}
