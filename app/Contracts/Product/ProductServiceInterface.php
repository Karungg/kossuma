<?php

namespace App\Contracts\Product;

use App\Models\Product\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ProductServiceInterface
{
    public function getStorefrontCategories(): array;

    public function getStorefrontCatalog(array $filters = [], int $page = 1, int $perPage = 18): array;

    public function hasActiveStorefrontProducts(): bool;

    public function getProductDetailBySlug(string $slug): array;

    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function getForExport(array $filters = [], array $ids = []): Collection;

    public function getStats(): array;

    public function getFormOptions(): array;

    public function create(array $data, array $uploadedImages = []): Product;

    public function update(Product $product, array $data, array $uploadedImages = []): Product;

    public function delete(Product $product): bool;

    public function bulkDelete(array $ids): int;
}
