<?php

namespace App\Services\Category;

use App\Contracts\Category\CategoryServiceInterface;
use App\Models\Category\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryService implements CategoryServiceInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getForExport(array $filters = [], array $ids = []): Collection
    {
        return $this->buildQuery($filters)
            ->when($ids !== [], fn (Builder $query): Builder => $query->whereIn('id', $ids))
            ->get();
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
            $slug = $this->resolveUniqueSlug($data['slug'] ?? null, $data['name']);

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
            $slug = $this->resolveUniqueSlug($data['slug'] ?? null, $data['name'], $category->id);

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

    /**
     * @param  array{
     *     search?: string|null,
     *     product_status?: string|null,
     *     description_status?: string|null,
     *     sort?: string|null,
     *     direction?: string|null
     * }  $filters
     * @return Builder<Category>
     */
    private function buildQuery(array $filters = []): Builder
    {
        $query = Category::query()->withCount('products');

        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

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

        $allowedSorts = ['name', 'slug', 'products_count', 'created_at', 'updated_at'];
        $sort = in_array($filters['sort'] ?? null, $allowedSorts, true)
            ? (string) $filters['sort']
            : 'name';

        $direction = ($filters['direction'] ?? null) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction);
    }

    private function resolveUniqueSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($slug !== null && trim($slug) !== '' ? $slug : $name);

        if ($baseSlug === '') {
            $baseSlug = 'kategori';
        }

        $candidate = $baseSlug;
        $counter = 2;

        while ($this->slugExists($candidate, $ignoreId)) {
            $candidate = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $candidate;
    }

    private function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return Category::query()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn (Builder $query): Builder => $query->where('id', '!=', $ignoreId))
            ->exists();
    }
}
