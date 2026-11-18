<?php

namespace Database\Factories\Product;

use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Store\Store;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(3, true));
        $price = fake()->numberBetween(15, 65) * 1000;

        return [
            'category_id' => Category::factory(),
            'store_id' => Store::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'stock' => fake()->numberBetween(5, 50),
            'price' => $price,
            'original_price' => $price + 5000,
            'unit_label' => '1 Pack (Isi 10)',
            'weight_grams' => 250,
            'is_preorder' => false,
            'preorder_days' => null,
            'composition' => 'Bahan pangan segar pilihan dengan bumbu rempah alami tanpa pengawet buatan.',
            'cooking_instructions' => [
                'Diamkan di suhu ruang selama 10-15 menit sebelum digoreng atau dimasak.',
                'Masak dengan api sedang hingga matang merata dan berwarna keemasan.',
            ],
            'specifications' => [
                [
                    'title' => 'Daya Simpan',
                    'value' => '3 Bulan Freezer',
                    'description' => 'Simpan pada suhu -18°C dalam kemasan tertutup rapat',
                ],
            ],
            'sold_count' => fake()->numberBetween(10, 500),
            'rating_avg' => 4.9,
            'reviews_count' => 3,
            'is_active' => true,
        ];
    }

    public function preorder(int $days = 3): static
    {
        return $this->state(fn (): array => [
            'is_preorder' => true,
            'preorder_days' => $days,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => [
            'is_active' => false,
        ]);
    }
}
