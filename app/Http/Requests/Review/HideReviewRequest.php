<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class HideReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'reason.required' => 'Alasan moderasi wajib diisi sebelum menyembunyikan ulasan.',
            'reason.min' => 'Alasan moderasi minimal 5 karakter.',
        ];
    }
}
