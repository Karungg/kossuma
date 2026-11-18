<?php

namespace App\Contracts\Product;

interface ProductServiceInterface
{
    /**
     * Retrieve a single active product detail payload by its slug.
     *
     * @return array<string, mixed>
     */
    public function getProductDetailBySlug(string $slug): array;
}
