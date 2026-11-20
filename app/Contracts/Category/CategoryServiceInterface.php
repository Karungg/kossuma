<?php

namespace App\Contracts\Category;

use App\Models\Category\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CategoryServiceInterface
{
    /**
     * @param  array{search?: string|null, sort?: string|null, direction?: string|null}  $filters
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    /**
     * @return array{total: int}
     */
    public function getStats(): array;

    /**
     * @param  array{name: string, slug?: string|null, description?: string|null}  $data
     */
    public function create(array $data): Category;

    /**
     * @param  array{name: string, slug?: string|null, description?: string|null}  $data
     */
    public function update(Category $category, array $data): Category;

    public function delete(Category $category): bool;
}
