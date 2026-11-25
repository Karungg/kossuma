<?php

namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportAdminReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'format' => ['required', 'string', Rule::in(['pdf', 'csv', 'xlsx'])],
            'scope' => ['nullable', 'string', Rule::in(['all', 'sales', 'products', 'stores', 'operations'])],
            'period_type' => ['nullable', 'string', Rule::in(['day', 'month', 'quarter', 'year', 'range'])],
            'compare_mode' => ['nullable', 'string', Rule::in(['previous', 'yoy'])],
            'date' => ['nullable', 'date'],
            'month' => ['nullable', 'integer', 'between:1,12'],
            'quarter' => ['nullable', 'integer', 'between:1,4'],
            'year' => ['nullable', 'integer', 'between:2020,2100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'store_id' => ['nullable', 'integer', 'exists:stores,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'payment_method' => ['nullable', 'string', Rule::in(['qris', 'bank_transfer', 'cod'])],
            'status_scope' => ['nullable', 'string', Rule::in(['valid', 'completed', 'all'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'format.required' => 'Format file ekspor wajib dipilih.',
            'format.in' => 'Format ekspor harus berupa PDF, CSV, atau XLSX.',
            'date_to.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal awal.',
        ];
    }
}
