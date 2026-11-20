<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class BulkDestroyCategoryRequest extends FormRequest
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
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:categories,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Pilih minimal satu kategori untuk dihapus.',
            'ids.array' => 'Daftar kategori yang dipilih tidak valid.',
            'ids.min' => 'Pilih minimal satu kategori untuk dihapus.',
            'ids.*.integer' => 'ID kategori tidak valid.',
            'ids.*.exists' => 'Salah satu kategori yang dipilih tidak ditemukan.',
        ];
    }
}
