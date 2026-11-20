<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait AppliesTableQuery
{
    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  array<int, string>  $searchableColumns
     * @return Builder<TModel>
     */
    protected function applySearch(Builder $query, ?string $search, array $searchableColumns): Builder
    {
        $term = trim((string) $search);

        if ($term === '' || $searchableColumns === []) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term, $searchableColumns): void {
            foreach ($searchableColumns as $index => $column) {
                if ($index === 0) {
                    $builder->where($column, 'like', "%{$term}%");
                } else {
                    $builder->orWhere($column, 'like', "%{$term}%");
                }
            }
        });
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  array<int, string>  $allowedSorts
     * @param  'asc'|'desc'  $defaultDirection
     * @return Builder<TModel>
     */
    protected function applySort(
        Builder $query,
        ?string $sort,
        ?string $direction,
        array $allowedSorts,
        string $defaultSort = 'created_at',
        string $defaultDirection = 'desc',
    ): Builder {
        $resolvedSort = in_array($sort, $allowedSorts, true)
            ? (string) $sort
            : $defaultSort;

        $resolvedDirection = match ($direction) {
            'asc', 'desc' => $direction,
            default => $defaultDirection,
        };

        return $query->orderBy($resolvedSort, $resolvedDirection);
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  array<int, int|string>  $ids
     * @return Builder<TModel>
     */
    protected function applyExportIds(Builder $query, array $ids, string $column = 'id'): Builder
    {
        if ($ids === []) {
            return $query;
        }

        return $query->whereIn($column, $ids);
    }
}
