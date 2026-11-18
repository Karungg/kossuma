<?php

namespace App\Http\Controllers\Product;

use App\Contracts\Product\ProductServiceInterface;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        public readonly ProductServiceInterface $productService,
    ) {}

    public function show(string $slug): Response
    {
        return Inertia::render('products/show', [
            'product' => $this->productService->getProductDetailBySlug($slug),
        ]);
    }
}
