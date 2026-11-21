<?php

namespace App\Services\Category;

use App\Concerns\AppliesTableQuery;
use App\Concerns\GeneratesUniqueSlug;
use App\Contracts\Category\CategoryServiceInterface;
use App\Models\Category\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CategoryService implements CategoryServiceInterface
{
    use AppliesTableQuery;
    use GeneratesUniqueSlug;

    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getForExport(array $filters = [], array $ids = []): Collection
    {
        return $this->applyExportIds($this->buildQuery($filters), $ids)->get();
    }

    public function getStats(): array
    {
        return [
            'total' => Category::query()->count(),
        ];
    }

    public function create(array $data): Category
    {
        return DB::transaction(function () use ($data): Category {
            $slug = $this->resolveUniqueSlug(
                modelClass: Category::class,
                slug: $data['slug'] ?? null,
                fallbackSource: $data['name'],
                defaultSlug: 'kategori',
            );

            return Category::query()->create([
                'name' => $data['name'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
            ]);
        });
    }

    public function update(Category $category, array $data): Category
    {
        return DB::transaction(function () use ($category, $data): Category {
            $slug = $this->resolveUniqueSlug(
                modelClass: Category::class,
                slug: $data['slug'] ?? null,
                fallbackSource: $data['name'],
                defaultSlug: 'kategori',
                ignoreId: $category->id,
            );

            $category->update([
                'name' => $data['name'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
            ]);

            return $category->refresh();
        });
    }

    public function delete(Category $category): bool
    {
        if ($category->products()->exists()) {
            return false;
        }

        return DB::transaction(fn (): bool => (bool) $category->delete());
    }

    public function bulkDelete(array $ids): array
    {
        return DB::transaction(function () use ($ids): array {
            $categories = Category::query()
                ->whereIn('id', $ids)
                ->withCount('products')
                ->get();

            $deletableIds = $categories
                ->filter(fn (Category $category): bool => (int) ($category->products_count ?? 0) === 0)
                ->pluck('id')
                ->all();

            $deleted = 0;

            if ($deletableIds !== []) {
                $deleted = (int) Category::query()->whereIn('id', $deletableIds)->delete();
            }

            $skipped = $categories->count() - $deleted;

            return [
                'deleted' => $deleted,
                'skipped' => $skipped > 0 ? $skipped : 0,
            ];
        });
    }

    private function buildQuery(array $filters = []): Builder
    {
        $query = Category::query()->withCount('products');

        $this->applySearch($query, $filters['search'] ?? null, ['name', 'slug', 'description']);

        $productStatus = $filters['product_status'] ?? null;

        if ($productStatus === 'with_products') {
            $query->has('products');
        } elseif ($productStatus === 'without_products') {
            $query->doesntHave('products');
        }

        $descriptionStatus = $filters['description_status'] ?? null;

        if ($descriptionStatus === 'filled') {
            $query->whereNotNull('description')->where('description', '!=', '');
        } elseif ($descriptionStatus === 'empty') {
            $query->where(function (Builder $builder): void {
                $builder->whereNull('description')->orWhere('description', '');
            });
        }

        return $this->applySort(
            query: $query,
            sort: $filters['sort'] ?? null,
            direction: $filters['direction'] ?? null,
            allowedSorts: ['name', 'slug', 'products_count', 'created_at', 'updated_at'],
            defaultSort: 'name',
            defaultDirection: 'asc',
        );
    }
}
