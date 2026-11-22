<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class ShipOrderRequest extends FormRequest
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
            'shipping_courier' => ['required', 'string', 'max:80'],
            'tracking_number' => ['required', 'string', 'max:80'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'shipping_courier.required' => 'Nama jasa ekspedisi atau kurir wajib diisi.',
            'tracking_number.required' => 'Nomor resi pengiriman wajib diisi.',
        ];
    }
}
