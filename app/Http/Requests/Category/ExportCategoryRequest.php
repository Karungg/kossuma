<?php

namespace App\Http\Requests\Category;

use App\Concerns\ValidatesTabularExport;
use App\Services\Category\CategoryExportService;
use Illuminate\Foundation\Http\FormRequest;

class ExportCategoryRequest extends FormRequest
{
    use ValidatesTabularExport;

    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            ...$this->tabularExportRules(
                table: 'categories',
                allowedColumns: CategoryExportService::ALL_COLUMNS,
                allowedSorts: ['name', 'slug', 'products_count', 'created_at', 'updated_at'],
            ),
            'product_status' => ['nullable', 'string', 'in:with_products,without_products'],
            'description_status' => ['nullable', 'string', 'in:filled,empty'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->tabularExportMessages();
    }
}
