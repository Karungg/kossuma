<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class ImportProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:xlsx', 'max:10240'],
            'images_archive' => ['nullable', 'file', 'mimes:zip', 'max:51200'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'File Excel (.xlsx) wajib dipilih.',
            'file.mimes' => 'File impor harus berformat .xlsx.',
            'file.max' => 'Ukuran file Excel maksimal 10 MB.',
            'images_archive.mimes' => 'Arsip foto opsional harus berformat .zip.',
            'images_archive.max' => 'Ukuran arsip foto maksimal 50 MB.',
        ];
    }
}
