<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class BulkDestroyProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:products,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Pilih minimal satu produk untuk dihapus.',
            'ids.array' => 'Daftar produk yang dipilih tidak valid.',
            'ids.min' => 'Pilih minimal satu produk untuk dihapus.',
            'ids.*.integer' => 'ID produk tidak valid.',
            'ids.*.exists' => 'Salah satu produk yang dipilih tidak ditemukan.',
        ];
    }
}
