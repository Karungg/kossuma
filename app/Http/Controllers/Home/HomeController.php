<?php

namespace App\Http\Controllers\Home;

use App\Contracts\Product\ProductServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        public readonly ProductServiceInterface $productService,
    ) {}

    public function index(Request $request): Response
    {
        $category = trim((string) $request->query('category', 'all'));
        $search = trim((string) $request->query('search', ''));
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('home/index', [
            'categories' => $this->productService->getStorefrontCategories(),
            'catalog' => $this->productService->getStorefrontCatalog(
                filters: [
                    'category' => $category,
                    'search' => $search,
                ],
                page: $page,
                perPage: 18,
            ),
            'filters' => [
                'category' => $category !== '' ? $category : 'all',
                'search' => $search,
            ],
            'hasAnyProducts' => $this->productService->hasActiveStorefrontProducts(),
        ]);
    }
}
