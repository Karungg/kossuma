<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait AppliesTableQuery
{
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

    protected function applyExportIds(Builder $query, array $ids, string $column = 'id'): Builder
    {
        if ($ids === []) {
            return $query;
        }

        return $query->whereIn($column, $ids);
    }
}
