<?php

namespace Database\Seeders;

use App\Models\Category\Category;
use App\Models\Product\Product;
use App\Models\Store\Store;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            [
                'name' => 'Frozen Food',
                'slug' => 'frozen-food',
                'description' => 'Olahan beku siap goreng dan kukus yang higienis dan praktis untuk keluarga.',
            ],
            [
                'name' => 'Lauk Siap Masak',
                'slug' => 'lauk-siap-masak',
                'description' => 'Aneka lauk berbumbu rempah khas Nusantara yang siap diolah di rumah.',
            ],
            [
                'name' => 'Kue & Camilan',
                'slug' => 'kue-camilan',
                'description' => 'Kue tradisional, jajanan pasar, dan camilan halal UMKM Kota Bogor.',
            ],
            [
                'name' => 'Sambal & Bumbu',
                'slug' => 'sambal-bumbu',
                'description' => 'Sambal rumahan dan bumbu racik alami tanpa pengawet buatan.',
            ],
        ])->mapWithKeys(fn (array $cat) => [
            $cat['slug'] => Category::query()->updateOrCreate(['slug' => $cat['slug']], $cat),
        ]);

        $stores = collect([
            [
                'name' => 'Dapur Ummi Salma',
                'slug' => 'dapur-ummi-salma',
                'description' => 'Produsen olahan ayam dan ikan beku higienis binaan Kossuma di Tanah Sareal.',
                'location' => 'Tanah Sareal, Kota Bogor',
                'is_verified' => true,
            ],
            [
                'name' => 'Pawon Ibu Fatimah',
                'slug' => 'pawon-ibu-fatimah',
                'description' => 'Spesialis lumpia, risoles, dan camilan gurih rumahan.',
                'location' => 'Bogor Barat, Kota Bogor',
                'is_verified' => true,
            ],
            [
                'name' => 'Dapur Berkah Aisyah',
                'slug' => 'dapur-berkah-aisyah',
                'description' => 'Lauk ungkep dan masakan tradisional bumbu rempah asli.',
                'location' => 'Bogor Tengah, Kota Bogor',
                'is_verified' => true,
            ],
            [
                'name' => 'Warung Teh Rina',
                'slug' => 'warung-teh-rina',
                'description' => 'Aneka masakan Minang, ikan bumbu kuning, dan sambal rumahan.',
                'location' => 'Bogor Timur, Kota Bogor',
                'is_verified' => true,
            ],
        ])->mapWithKeys(fn (array $store) => [
            $store['slug'] => Store::query()->updateOrCreate(['slug' => $store['slug']], $store),
        ]);

        $products = [
            [
                'category_slug' => 'frozen-food',
                'store_slug' => 'dapur-ummi-salma',
                'name' => 'Kaki Naga Ayam',
                'slug' => 'kaki-naga-ayam',
                'description' => 'Olahan daging ayam segar pilihan dengan bumbu rempah gurih berbalut tepung roti renyah dan stik kayu praktis. Higienis, bergizi, dan cocok untuk camilan atau lauk keluarga.',
                'stock' => 48,
                'price' => 28000,
                'original_price' => 32000,
                'unit_label' => '1 Pack (Isi 10 Pcs)',
                'weight_grams' => 250,
                'is_preorder' => false,
                'preorder_days' => null,
                'composition' => 'Daging ayam fillet segar cincang, tepung roti renyah, tepung tapioka, telur, bawang putih, bawang merah, lada bubuk, garam laut alami, serta kaldu rempah alami. Tanpa bahan pengawet buatan.',
                'cooking_instructions' => [
                    'Diamkan produk di suhu ruang selama 10-15 menit sebelum digoreng agar tidak terlalu beku.',
                    'Panaskan minyak goreng pada api sedang (±160-170°C). Masukkan kaki naga dan goreng selama 3-4 menit hingga warna kuning keemasan.',
                    'Angkat dan tiriskan dari minyak. Sajikan hangat dengan saus tomat atau saus sambal.',
                ],
                'specifications' => [
                    ['title' => 'Daya Simpan', 'value' => '3 Bulan Freezer', 'description' => 'Simpan pada suhu -18°C dalam kemasan tertutup rapat'],
                    ['title' => 'Isi Bersih', 'value' => '10 Pcs / Pack', 'description' => 'Berat bersih ±250 gram dengan stik kayu higienis'],
                    ['title' => 'Saran Porsi', 'value' => '3 - 5 Orang', 'description' => 'Cocok untuk lauk bekal anak sekolah & camilan keluarga'],
                ],
                'sold_count' => 1240,
                'rating_avg' => 4.9,
                'reviews_count' => 3,
                'images' => [
                    ['image_path' => '/assets/images/products/kaki-naga-ayam.jpg', 'alt' => 'Kaki Naga Ayam Olahan Beku', 'label' => 'Kaki Naga Ayam', 'is_primary' => true],
                    ['image_path' => '/assets/images/products/kaki-naga-ayam.jpg', 'alt' => 'Tekstur Olahan Daging Kaki Naga Ayam', 'label' => 'Tekstur Daging Olahan', 'is_primary' => false],
                ],
            ],
            [
                'category_slug' => 'frozen-food',
                'store_slug' => 'pawon-ibu-fatimah',
                'name' => 'Lumpia Ayam',
                'slug' => 'lumpia-ayam',
                'description' => 'Lumpia isi daging ayam cincang berbumbu gurih dengan sayuran segar, dibalut kulit lumpia tipis yang renyah saat digoreng.',
                'stock' => 35,
                'price' => 26000,
                'original_price' => 30000,
                'unit_label' => '1 Pack (Isi 10 Pcs)',
                'weight_grams' => 300,
                'is_preorder' => false,
                'preorder_days' => null,
                'composition' => 'Daging ayam cincang, wortel, bengkuang, daun bawang, kulit lumpia, bawang putih, lada, dan kaldu ayam alami.',
                'cooking_instructions' => [
                    'Diamkan di suhu ruang selama 10 menit sebelum digoreng.',
                    'Goreng dalam minyak panas api sedang hingga kulit berwarna cokelat keemasan.',
                ],
                'specifications' => [
                    ['title' => 'Daya Simpan', 'value' => '2 Bulan Freezer', 'description' => 'Simpan dalam wadah tertutup di suhu beku'],
                    ['title' => 'Isi Bersih', 'value' => '10 Pcs / Pack', 'description' => 'Dilengkapi sambal cocol kemasan'],
                ],
                'sold_count' => 890,
                'rating_avg' => 4.9,
                'reviews_count' => 2,
                'images' => [
                    ['image_path' => '/assets/images/products/lumpia-ayam.jpg', 'alt' => 'Lumpia Ayam Renyah', 'label' => 'Lumpia Ayam', 'is_primary' => true],
                ],
            ],
            [
                'category_slug' => 'frozen-food',
                'store_slug' => 'pawon-ibu-fatimah',
                'name' => 'Lumpia Udang',
                'slug' => 'lumpia-udang',
                'description' => 'Lumpia renyah dengan isian udang segar cincang dan daging ayam pilihan. Gurih alami tanpa pengawet.',
                'stock' => 28,
                'price' => 32000,
                'original_price' => null,
                'unit_label' => '1 Pack (Isi 10 Pcs)',
                'weight_grams' => 300,
                'is_preorder' => false,
                'preorder_days' => null,
                'composition' => 'Udang kupas segar, daging ayam fillet, bawang putih, minyak wijen, tepung tapioka, dan kulit lumpia.',
                'cooking_instructions' => [
                    'Diamkan di suhu ruang sebelum digoreng.',
                    'Goreng dengan api sedang selama 3-5 menit sampai matang merata.',
                ],
                'specifications' => [
                    ['title' => 'Daya Simpan', 'value' => '2 Bulan Freezer', 'description' => 'Simpan pada suhu -18°C'],
                ],
                'sold_count' => 640,
                'rating_avg' => 4.8,
                'reviews_count' => 2,
                'images' => [
                    ['image_path' => '/assets/images/products/lumpia-udang.jpg', 'alt' => 'Lumpia Udang Spesial', 'label' => 'Lumpia Udang', 'is_primary' => true],
                ],
            ],
            [
                'category_slug' => 'lauk-siap-masak',
                'store_slug' => 'dapur-berkah-aisyah',
                'name' => 'Ayam Ungkep Bumbu Kuning',
                'slug' => 'ayam-ungkep-bumbu-kuning',
                'description' => 'Ayam potong segar diungkep perlahan dengan kunyit, lengkuas, serai, dan daun salam hingga bumbu meresap sampai ke tulang.',
                'stock' => 20,
                'price' => 45000,
                'original_price' => 50000,
                'unit_label' => '1 Ekor Potong 8',
                'weight_grams' => 800,
                'is_preorder' => false,
                'preorder_days' => null,
                'composition' => 'Ayam segar, kunyit, ketumbar, kemiri, bawang merah, bawang putih, serai, lengkuas, daun salam, dan garam.',
                'cooking_instructions' => [
                    'Diamkan di suhu ruang sebelum digoreng atau dibakar.',
                    'Goreng sebentar hingga kuning kecokelatan, sajikan dengan sambal terasi.',
                ],
                'specifications' => [
                    ['title' => 'Isi Bersih', 'value' => '8 Potong Ayam', 'description' => 'Sudah termasuk sambal bawang kemasan'],
                ],
                'sold_count' => 450,
                'rating_avg' => 4.9,
                'reviews_count' => 2,
                'images' => [],
            ],
            [
                'category_slug' => 'lauk-siap-masak',
                'store_slug' => 'warung-teh-rina',
                'name' => 'Rendang Daging Sapi Padang',
                'slug' => 'rendang-daging-sapi-padang',
                'description' => 'Rendang daging sapi has dalam dimasak lama dengan santan murni dan rempah Minang autentik. Dibuat segar sesuai pesanan.',
                'stock' => 15,
                'price' => 85000,
                'original_price' => null,
                'unit_label' => '1 Pack (500 gr)',
                'weight_grams' => 500,
                'is_preorder' => true,
                'preorder_days' => 2,
                'composition' => 'Daging sapi pilihan, santan kelapa tua, cabai merah, lengkuas, jahe, serai, daun kunyit, daun jeruk, dan rempah Padang.',
                'cooking_instructions' => [
                    'Diamkan di suhu ruang, lalu hangatkan di wajan dengan api kecil atau kukus selama 5 menit.',
                ],
                'specifications' => [
                    ['title' => 'Ketahanan', 'value' => '1 Bulan Freezer / 5 Hari Suhu Ruang', 'description' => 'Dikemas vakum higienis'],
                ],
                'sold_count' => 310,
                'rating_avg' => 5.0,
                'reviews_count' => 2,
                'images' => [],
            ],
        ];

        $defaultReviews = [
            [
                'author_name' => 'Ibu Rahmawati',
                'author_location' => 'Bogor Barat',
                'rating' => 5,
                'variant' => '1 Pack',
                'comment' => 'Rasanya gurih dan anak-anak di rumah suka sekali. Pengemasan rapi, bersih, dan pengiriman cepat sampai sore harinya.',
            ],
            [
                'author_name' => 'Bapak Hendra',
                'author_location' => 'Tanah Sareal',
                'rating' => 5,
                'variant' => '1 Pack',
                'comment' => 'Praktis sekali untuk stok lauk di freezer. Digoreng sebentar langsung matang keemasan dan bumbunya terasa alami.',
            ],
            [
                'author_name' => 'Ibu Siti Aminah',
                'author_location' => 'Bogor Tengah',
                'rating' => 5,
                'variant' => '1 Pack',
                'comment' => 'Sudah langganan produk UMKM Kossuma. Kebersihan dan kehalalannya terjaga, cocok buat bekal sekolah maupun sarapan.',
            ],
        ];

        foreach ($products as $item) {
            $images = $item['images'];
            unset($item['images']);

            $category = $categories[$item['category_slug']];
            $store = $stores[$item['store_slug']];
            unset($item['category_slug'], $item['store_slug']);

            $product = Product::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    ...$item,
                    'category_id' => $category->id,
                    'store_id' => $store->id,
                    'is_active' => true,
                ],
            );

            $product->images()->delete();
            foreach ($images as $index => $image) {
                $product->images()->create([
                    'image_path' => $image['image_path'],
                    'alt' => $image['alt'],
                    'label' => $image['label'],
                    'is_primary' => $image['is_primary'],
                    'sort_order' => $index,
                ]);
            }

            if ($product->reviews()->count() === 0) {
                foreach (array_slice($defaultReviews, 0, $item['reviews_count']) as $review) {
                    $product->reviews()->create([
                        ...$review,
                        'variant' => $item['unit_label'],
                    ]);
                }
            }
        }
    }
}
