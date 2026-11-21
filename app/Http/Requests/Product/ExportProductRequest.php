<?php

namespace App\Http\Requests\Product;

use App\Concerns\ValidatesTabularExport;
use App\Services\Product\ProductExportDefinition;
use Illuminate\Foundation\Http\FormRequest;

class ExportProductRequest extends FormRequest
{
    use ValidatesTabularExport;

    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    public function rules(): array
    {
        return [
            ...$this->tabularExportRules(
                table: 'products',
                allowedColumns: ProductExportDefinition::ALL_COLUMNS,
                allowedSorts: ['name', 'price', 'stock', 'sold_count', 'created_at', 'updated_at'],
            ),
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'store_id' => ['nullable', 'integer', 'exists:stores,id'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
            'stock_status' => ['nullable', 'string', 'in:in_stock,out_of_stock'],
            'preorder_status' => ['nullable', 'string', 'in:preorder,regular'],
        ];
    }

    public function messages(): array
    {
        return $this->tabularExportMessages();
    }
}
