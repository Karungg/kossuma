<?php

namespace App\Http\Controllers\Category;

use App\Contracts\Category\CategoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\BulkDestroyCategoryRequest;
use App\Http\Requests\Category\ExportCategoryRequest;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Jobs\Export\GenerateTabularExportJob;
use App\Models\Category\Category;
use App\Models\User;
use App\Services\Category\CategoryExportService;
use App\Services\Category\CategoryQueuedExportProvider;
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

        $filters = $request->only([
            'search',
            'product_status',
            'description_status',
            'sort',
            'direction',
        ]);

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

    public function bulkDestroy(BulkDestroyCategoryRequest $request): RedirectResponse
    {
        Gate::authorize('deleteAny', Category::class);

        $ids = array_map('intval', $request->validated('ids'));

        $result = $this->categoryService->bulkDelete($ids);

        if ($result['deleted'] === 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Kategori yang dipilih tidak dapat dihapus karena masih digunakan oleh produk.',
            ]);

            return to_route('admin.categories.index');
        }

        $message = $result['skipped'] > 0
            ? "{$result['deleted']} kategori berhasil dihapus. {$result['skipped']} kategori dilewati karena masih memiliki produk."
            : "{$result['deleted']} kategori berhasil dihapus.";

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $message,
        ]);

        return to_route('admin.categories.index');
    }

    public function export(ExportCategoryRequest $request): RedirectResponse
    {
        Gate::authorize('viewAny', Category::class);

        $user = $request->user();

        if (! $user instanceof User) {
            abort(403);
        }

        $validated = $request->validated();
        $ids = array_map('intval', $validated['ids'] ?? []);
        $columns = $validated['columns'] ?? CategoryExportService::DEFAULT_COLUMNS;

        GenerateTabularExportJob::dispatch(
            userId: (string) $user->id,
            providerClass: CategoryQueuedExportProvider::class,
            format: (string) $validated['format'],
            filters: [
                'search' => $validated['search'] ?? null,
                'product_status' => $validated['product_status'] ?? null,
                'description_status' => $validated['description_status'] ?? null,
                'sort' => $validated['sort'] ?? null,
                'direction' => $validated['direction'] ?? null,
            ],
            ids: $ids,
            columns: $columns,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ekspor kategori sedang diproses di latar belakang. File akan muncul di notifikasi setelah siap diunduh.',
        ]);

        return back();
    }
}
