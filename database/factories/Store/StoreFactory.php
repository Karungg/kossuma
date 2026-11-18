<?php

namespace Database\Factories\Store;

use App\Models\Store\Store;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    protected $model = Store::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'Dapur '.fake()->unique()->firstNameFemale();
        $districts = ['Tanah Sareal', 'Bogor Barat', 'Bogor Tengah', 'Bogor Timur', 'Bogor Selatan', 'Bogor Utara'];

        return [
            'user_id' => null,
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'location' => fake()->randomElement($districts).', Kota Bogor',
            'is_verified' => true,
        ];
    }
}
