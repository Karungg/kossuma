<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_preorder' => $this->boolean('is_preorder'),
            'is_active' => $this->has('is_active') ? $this->boolean('is_active') : true,
            'original_price' => $this->input('original_price') === '' ? null : $this->input('original_price'),
            'weight_grams' => $this->input('weight_grams') === '' ? null : $this->input('weight_grams'),
            'preorder_days' => $this->input('preorder_days') === '' ? null : $this->input('preorder_days'),
            'slug' => is_string($this->input('slug')) && trim($this->input('slug')) !== '' ? trim($this->input('slug')) : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'store_id' => ['required', 'integer', 'exists:stores,id'],
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('products', 'slug')],
            'description' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'integer', 'min:100'],
            'original_price' => ['nullable', 'integer', 'gte:price'],
            'stock' => ['required', 'integer', 'min:0'],
            'unit_label' => ['nullable', 'string', 'max:100'],
            'weight_grams' => ['nullable', 'integer', 'min:1'],
            'is_preorder' => ['boolean'],
            'preorder_days' => ['nullable', 'required_if:is_preorder,true', 'integer', 'min:1', 'max:60'],
            'is_active' => ['boolean'],
            'composition' => ['nullable', 'string', 'max:3000'],
            'cooking_instructions' => ['nullable', 'array'],
            'cooking_instructions.*' => ['nullable', 'string', 'max:300'],
            'specifications' => ['nullable', 'array'],
            'specifications.*.title' => ['nullable', 'string', 'max:100'],
            'specifications.*.value' => ['nullable', 'string', 'max:120'],
            'specifications.*.description' => ['nullable', 'string', 'max:250'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'primary_image_key' => ['nullable', 'string', 'max:60'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori produk wajib dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'store_id.required' => 'Toko UMKM wajib dipilih.',
            'store_id.exists' => 'Toko UMKM yang dipilih tidak valid.',
            'name.required' => 'Nama produk wajib diisi.',
            'name.max' => 'Nama produk maksimal 200 karakter.',
            'slug.regex' => 'Format slug hanya boleh huruf kecil, angka, dan tanda hubung.',
            'slug.unique' => 'Slug produk sudah digunakan.',
            'description.required' => 'Deskripsi produk wajib diisi.',
            'price.required' => 'Harga jual wajib diisi.',
            'price.min' => 'Harga jual minimal Rp100.',
            'original_price.gte' => 'Harga coret harus lebih besar atau sama dengan harga jual.',
            'stock.required' => 'Stok produk wajib diisi.',
            'stock.min' => 'Stok tidak boleh kurang dari 0.',
            'preorder_days.required_if' => 'Estimasi hari pre-order wajib diisi.',
            'preorder_days.min' => 'Estimasi pre-order minimal 1 hari.',
            'preorder_days.max' => 'Estimasi pre-order maksimal 60 hari.',
            'images.max' => 'Maksimal 8 foto dapat diunggah per produk.',
            'images.*.image' => 'File yang diunggah harus berupa gambar.',
            'images.*.mimes' => 'Format gambar harus JPG, PNG, atau WebP.',
            'images.*.max' => 'Ukuran setiap foto maksimal 2 MB.',
        ];
    }
}
