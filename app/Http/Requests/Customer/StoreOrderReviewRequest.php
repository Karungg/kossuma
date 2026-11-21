<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderReviewRequest extends FormRequest
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
            'order_item_id' => ['required', 'integer'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'order_item_id.required' => 'Mohon pilih produk yang ingin diulas.',
            'rating.required' => 'Mohon pilih penilaian bintang terlebih dahulu.',
            'rating.min' => 'Penilaian bintang minimal 1.',
            'rating.max' => 'Penilaian bintang maksimal 5.',
            'comment.required' => 'Mohon tulis ulasan Anda mengenai produk ini.',
            'comment.min' => 'Ulasan minimal 5 karakter agar membantu pembeli lain.',
            'comment.max' => 'Ulasan maksimal 1000 karakter.',
        ];
    }
}
