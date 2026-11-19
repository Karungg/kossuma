<?php

namespace App\Http\Controllers\Category;

use App\Contracts\Category\CategoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        public readonly CategoryServiceInterface $categoryService,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Category::class);

        $filters = $request->only(['search', 'sort', 'direction']);

        return Inertia::render('admin/categories/index', [
            'categories' => $this->categoryService->getPaginated($filters),
            'stats' => $this->categoryService->getStats(),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Category::class);

        return Inertia::render('admin/categories/create');
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Gate::authorize('create', Category::class);

        $this->categoryService->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Kategori berhasil ditambahkan.',
        ]);

        return to_route('admin.categories.index');
    }

    public function edit(Category $category): Response
    {
        Gate::authorize('update', $category);

        return Inertia::render('admin/categories/edit', [
            'category' => $category->loadCount('products'),
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        Gate::authorize('update', $category);

        $this->categoryService->update($category, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Kategori berhasil diperbarui.',
        ]);

        return to_route('admin.categories.index');
    }

    public function destroy(Category $category): RedirectResponse
    {
        Gate::authorize('delete', $category);

        if (! $this->categoryService->delete($category)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.',
            ]);

            return to_route('admin.categories.index');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Kategori berhasil dihapus.',
        ]);

        return to_route('admin.categories.index');
    }
}
