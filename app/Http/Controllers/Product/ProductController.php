<?php

namespace App\Http\Controllers\Product;

use App\Contracts\Product\ProductServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\BulkDestroyProductRequest;
use App\Http\Requests\Product\ExportProductRequest;
use App\Http\Requests\Product\ImportProductRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Jobs\Export\GenerateTabularExportJob;
use App\Jobs\Import\ProcessTabularImportJob;
use App\Models\Product\Product;
use App\Models\User;
use App\Services\Import\TabularImportService;
use App\Services\Product\ProductExportDefinition;
use App\Services\Product\ProductImportHandler;
use App\Services\Product\ProductQueuedExportProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductController extends Controller
{
    public function __construct(
        public readonly ProductServiceInterface $productService,
        public readonly TabularImportService $tabularImportService,
        public readonly ProductImportHandler $productImportHandler,
    ) {}

    public function show(string $slug): Response
    {
        return Inertia::render('products/show', [
            'product' => $this->productService->getProductDetailBySlug($slug),
        ]);
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Product::class);

        $filters = $request->only([
            'search',
            'category_id',
            'store_id',
            'status',
            'stock_status',
            'preorder_status',
            'sort',
            'direction',
        ]);

        return Inertia::render('admin/products/index', [
            'products' => $this->productService->getPaginated($filters),
            'stats' => $this->productService->getStats(),
            'options' => $this->productService->getFormOptions(),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Product::class);

        return Inertia::render('admin/products/create', [
            'options' => $this->productService->getFormOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Gate::authorize('create', Product::class);

        $uploadedImages = $request->file('images', []);

        $this->productService->create(
            data: $request->validated(),
            uploadedImages: is_array($uploadedImages) ? $uploadedImages : [],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produk berhasil ditambahkan.',
        ]);

        return to_route('admin.products.index');
    }

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        return Inertia::render('admin/products/edit', [
            'product' => $product->load([
                'category:id,name,slug',
                'store:id,name,slug',
                'images',
            ]),
            'options' => $this->productService->getFormOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);

        $uploadedImages = $request->file('images', []);

        $this->productService->update(
            product: $product,
            data: $request->validated(),
            uploadedImages: is_array($uploadedImages) ? $uploadedImages : [],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produk berhasil diperbarui.',
        ]);

        return to_route('admin.products.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        Gate::authorize('delete', $product);

        $this->productService->delete($product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Produk berhasil dihapus.',
        ]);

        return to_route('admin.products.index');
    }

    public function bulkDestroy(BulkDestroyProductRequest $request): RedirectResponse
    {
        Gate::authorize('deleteAny', Product::class);

        $ids = array_map('intval', $request->validated('ids'));
        $deleted = $this->productService->bulkDelete($ids);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$deleted} produk berhasil dihapus.",
        ]);

        return to_route('admin.products.index');
    }

    public function export(ExportProductRequest $request): RedirectResponse
    {
        Gate::authorize('viewAny', Product::class);

        $user = $request->user();

        if (! $user instanceof User) {
            abort(403);
        }

        $validated = $request->validated();
        $ids = array_map('intval', $validated['ids'] ?? []);
        $columns = $validated['columns'] ?? ProductExportDefinition::DEFAULT_COLUMNS;

        GenerateTabularExportJob::dispatch(
            userId: (string) $user->id,
            providerClass: ProductQueuedExportProvider::class,
            format: (string) $validated['format'],
            filters: [
                'search' => $validated['search'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'store_id' => $validated['store_id'] ?? null,
                'status' => $validated['status'] ?? null,
                'stock_status' => $validated['stock_status'] ?? null,
                'preorder_status' => $validated['preorder_status'] ?? null,
                'sort' => $validated['sort'] ?? null,
                'direction' => $validated['direction'] ?? null,
            ],
            ids: $ids,
            columns: $columns,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ekspor produk sedang diproses di latar belakang. File akan muncul di notifikasi setelah siap diunduh.',
        ]);

        return back();
    }

    public function importTemplate(): StreamedResponse
    {
        Gate::authorize('create', Product::class);

        return $this->tabularImportService->downloadTemplate($this->productImportHandler);
    }

    public function import(ImportProductRequest $request): RedirectResponse
    {
        Gate::authorize('create', Product::class);

        $user = $request->user();

        if (! $user instanceof User) {
            abort(403);
        }

        $xlsxFile = $request->file('file');
        $storedXlsxPath = Storage::disk('local')->putFile('imports/'.$user->id, $xlsxFile);

        $archiveFile = $request->file('images_archive');
        $storedArchivePath = $archiveFile !== null
            ? Storage::disk('local')->putFile('imports/'.$user->id, $archiveFile)
            : null;

        ProcessTabularImportJob::dispatch(
            userId: (string) $user->id,
            handlerClass: ProductImportHandler::class,
            fileDisk: 'local',
            filePath: (string) $storedXlsxPath,
            archiveDisk: $storedArchivePath !== null ? 'local' : null,
            archivePath: is_string($storedArchivePath) ? $storedArchivePath : null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Impor produk sedang diproses di latar belakang. Hasil impor akan muncul di notifikasi setelah selesai.',
        ]);

        return back();
    }
}
