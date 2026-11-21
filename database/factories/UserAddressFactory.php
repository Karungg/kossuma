<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAddress>
 */
class UserAddressFactory extends Factory
{
    protected $model = UserAddress::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => fake()->randomElement(['Rumah', 'Kantor', 'Rumah Orang Tua']),
            'recipient_name' => fake()->name(),
            'phone' => '0812'.fake()->numerify('########'),
            'full_address' => fake()->streetAddress(),
            'district' => fake()->randomElement([
                'Tanah Sareal',
                'Bogor Tengah',
                'Bogor Utara',
                'Bogor Timur',
                'Bogor Selatan',
                'Bogor Barat',
            ]),
            'city' => 'Kota Bogor, Jawa Barat',
            'postal_code' => '161'.fake()->numerify('##'),
            'courier_note' => 'Pagar warna putih dekat masjid',
            'is_primary' => false,
        ];
    }

    public function primary(): static
    {
        return $this->state(fn (): array => [
            'is_primary' => true,
        ]);
    }
}
