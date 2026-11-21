<?php

namespace Database\Factories\Cart;

use App\Models\Cart\Cart;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'guest_token' => null,
        ];
    }

    public function guest(?string $token = null): static
    {
        return $this->state(fn (): array => [
            'user_id' => null,
            'guest_token' => $token ?? Str::uuid()->toString(),
        ]);
    }
}
