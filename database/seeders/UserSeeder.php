<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => 'password123',
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles(['Admin']);

        $customer = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Customer',
                'password' => 'password123',
                'email_verified_at' => now(),
            ]
        );
        $customer->syncRoles(['Customer']);
    }
}
