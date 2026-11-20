<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait GeneratesUniqueSlug
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    protected function resolveUniqueSlug(
        string $modelClass,
        ?string $slug,
        string $fallbackSource,
        string $defaultSlug = 'item',
        int|string|null $ignoreId = null,
        string $column = 'slug',
    ): string {
        $baseSlug = Str::slug($slug !== null && trim($slug) !== '' ? $slug : $fallbackSource);

        if ($baseSlug === '') {
            $baseSlug = $defaultSlug;
        }

        $candidate = $baseSlug;
        $counter = 2;

        while ($this->slugAlreadyExists($modelClass, $candidate, $ignoreId, $column)) {
            $candidate = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $candidate;
    }

    /**
     * @param  class-string<Model>  $modelClass
     */
    private function slugAlreadyExists(
        string $modelClass,
        string $slug,
        int|string|null $ignoreId = null,
        string $column = 'slug',
    ): bool {
        return $modelClass::query()
            ->where($column, $slug)
            ->when(
                $ignoreId !== null,
                static fn (Builder $query): Builder => $query->where('id', '!=', $ignoreId),
            )
            ->exists();
    }
}
