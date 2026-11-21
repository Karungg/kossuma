<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CancelOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:3', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'reason.required' => 'Mohon pilih atau tulis alasan pembatalan pesanan.',
            'reason.min' => 'Alasan pembatalan minimal 3 karakter.',
            'reason.max' => 'Alasan pembatalan maksimal 255 karakter.',
        ];
    }
}
