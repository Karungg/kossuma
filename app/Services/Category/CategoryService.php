<?php

namespace App\Services\Category;

use App\Contracts\Category\CategoryServiceInterface;
use App\Models\Category\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
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

    /**
     * @param  array{search?: string|null, sort?: string|null, direction?: string|null}  $filters
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

        $allowedSorts = ['name', 'products_count', 'created_at'];
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
