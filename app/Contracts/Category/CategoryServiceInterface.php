<?php

namespace App\Contracts\Category;

use App\Models\Category\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CategoryServiceInterface
{
    /**
     * @param  array{
     *     search?: string|null,
     *     product_status?: string|null,
     *     description_status?: string|null,
     *     sort?: string|null,
     *     direction?: string|null
     * }  $filters
     * @return LengthAwarePaginator<int, Category>
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    /**
     * @param  array{
     *     search?: string|null,
     *     product_status?: string|null,
     *     description_status?: string|null,
     *     sort?: string|null,
     *     direction?: string|null
     * }  $filters
     * @param  array<int, int>  $ids
     * @return Collection<int, Category>
     */
    public function getForExport(array $filters = [], array $ids = []): Collection;

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

    /**
     * @param  array<int, int>  $ids
     * @return array{deleted: int, skipped: int}
     */
    public function bulkDelete(array $ids): array;
}
