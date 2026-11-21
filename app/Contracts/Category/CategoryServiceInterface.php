<?php

namespace App\Contracts\Category;

use App\Models\Category\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CategoryServiceInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function getForExport(array $filters = [], array $ids = []): Collection;

    public function getStats(): array;

    public function create(array $data): Category;

    public function update(Category $category, array $data): Category;

    public function delete(Category $category): bool;

    public function bulkDelete(array $ids): array;
}
