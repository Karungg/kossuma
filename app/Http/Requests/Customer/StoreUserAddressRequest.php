<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserAddressRequest extends FormRequest
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
            'label' => ['required', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{8,25}$/'],
            'full_address' => ['required', 'string', 'min:8', 'max:500'],
            'district' => ['required', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:10', 'regex:/^[0-9]{4,10}$/'],
            'courier_note' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'label.required' => 'Label alamat wajib diisi (misal: Rumah atau Kantor).',
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'phone.required' => 'Nomor HP penerima wajib diisi.',
            'phone.regex' => 'Format nomor HP penerima tidak valid.',
            'full_address.required' => 'Alamat lengkap wajib diisi.',
            'full_address.min' => 'Mohon tulis alamat lengkap minimal 8 karakter.',
            'district.required' => 'Kecamatan wajib diisi.',
            'city.required' => 'Kota atau Kabupaten wajib diisi.',
            'postal_code.regex' => 'Kode pos hanya boleh berisi angka.',
        ];
    }
}
