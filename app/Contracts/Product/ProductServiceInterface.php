<?php

namespace App\Contracts\Product;

interface ProductServiceInterface
{
    public function getProductDetailBySlug(string $slug): array;
}
