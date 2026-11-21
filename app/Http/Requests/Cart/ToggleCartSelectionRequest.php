<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class ToggleCartSelectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_selected' => ['required', 'boolean'],
            'store_id' => ['nullable', 'integer', 'exists:stores,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'is_selected.required' => 'Status pilihan wajib diisi.',
            'is_selected.boolean' => 'Status pilihan tidak valid.',
            'store_id.exists' => 'Toko UMKM tidak ditemukan.',
        ];
    }
}
