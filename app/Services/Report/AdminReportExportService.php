<?php

namespace App\Services\Report;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;

class AdminReportExportService
{
    /**
     * @var array<string, string>
     */
    public const array SCOPE_LABELS = [
        'all' => 'Laporan Operasional Lengkap',
        'sales' => 'Laporan Penjualan dan Keuangan',
        'products' => 'Laporan Performa Produk dan Stok',
        'stores' => 'Laporan Toko UMKM dan Kategori',
        'operations' => 'Laporan Pelanggan, Pemenuhan, dan Ulasan',
    ];

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{disk: string, path: string, filename: string}
     */
    public function storeToDisk(
        array $reportData,
        string $format,
        string $scope,
        string $directory,
        string $disk = 'local',
    ): array {
        $normalizedScope = array_key_exists($scope, self::SCOPE_LABELS) ? $scope : 'all';
        $extension = match ($format) {
            'xlsx' => 'xlsx',
            'pdf' => 'pdf',
            default => 'csv',
        };

        $slugPrefix = match ($normalizedScope) {
            'sales' => 'laporan-penjualan',
            'products' => 'laporan-produk',
            'stores' => 'laporan-toko-kategori',
            'operations' => 'laporan-operasional-ulasan',
            default => 'laporan-operasional-lengkap',
        };

        $filename = $slugPrefix.'-'.now()->format('Y-m-d-His').'.'.$extension;
        $storedName = Str::uuid()->toString().'.'.$extension;
        $relativePath = trim($directory, '/').'/'.$storedName;

        $content = match ($extension) {
            'xlsx' => $this->buildXlsxContent($reportData, $normalizedScope),
            'pdf' => $this->buildPdfContent($reportData, $normalizedScope),
            default => $this->buildCsvContent($reportData, $normalizedScope),
        };

        Storage::disk($disk)->put($relativePath, $content);

        return [
            'disk' => $disk,
            'path' => $relativePath,
            'filename' => $filename,
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     */
    private function buildCsvContent(array $reportData, string $scope): string
    {
        $sheet = match ($scope) {
            'products' => $this->buildProductsSheet($reportData),
            'stores' => $this->buildStoresSheet($reportData),
            'operations' => $this->buildCustomersSheet($reportData),
            default => $this->buildSalesSheet($reportData),
        };

        $handle = fopen('php://temp', 'w+');

        if ($handle === false) {
            return '';
        }

        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, $sheet['headers']);

        foreach ($sheet['rows'] as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return is_string($content) ? $content : '';
    }

    /**
     * @param  array<string, mixed>  $reportData
     */
    private function buildXlsxContent(array $reportData, string $scope): string
    {
        $sheets = match ($scope) {
            'sales' => [$this->buildSalesSheet($reportData)],
            'products' => [
                $this->buildProductsSheet($reportData),
                $this->buildLowStockSheet($reportData),
            ],
            'stores' => [
                $this->buildStoresSheet($reportData),
                $this->buildCategoriesSheet($reportData),
            ],
            'operations' => [
                $this->buildCustomersSheet($reportData),
                $this->buildReviewsSheet($reportData),
            ],
            default => [
                $this->buildSummarySheet($reportData),
                $this->buildSalesSheet($reportData),
                $this->buildProductsSheet($reportData),
                $this->buildStoresSheet($reportData),
                $this->buildCategoriesSheet($reportData),
                $this->buildCustomersSheet($reportData),
                $this->buildReviewsSheet($reportData),
            ],
        };

        $tempPath = tempnam(sys_get_temp_dir(), 'kossuma_report_');

        if ($tempPath === false) {
            return '';
        }

        $xlsxPath = $tempPath.'.xlsx';
        @unlink($tempPath);

        try {
            $writer = new XlsxWriter;
            $writer->openToFile($xlsxPath);

            $headerStyle = new Style(
                fontBold: true,
                fontColor: '7D3394',
                backgroundColor: 'F0E6F5',
            );

            foreach ($sheets as $index => $sheet) {
                $worksheet = $index === 0
                    ? $writer->getCurrentSheet()
                    : $writer->addNewSheetAndMakeItCurrent();

                $worksheet->setName($sheet['name']);
                $writer->addRow(Row::fromValuesWithStyle($sheet['headers'], $headerStyle));

                foreach ($sheet['rows'] as $row) {
                    $writer->addRow(Row::fromValues($row));
                }
            }

            $writer->close();
            $content = file_get_contents($xlsxPath);

            return is_string($content) ? $content : '';
        } finally {
            if (file_exists($xlsxPath)) {
                @unlink($xlsxPath);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $reportData
     */
    private function buildPdfContent(array $reportData, string $scope): string
    {
        $pdf = Pdf::loadView('exports.operational-report-pdf', [
            'documentTitle' => self::SCOPE_LABELS[$scope] ?? self::SCOPE_LABELS['all'],
            'scope' => $scope,
            'report' => $reportData,
            'printedAt' => now()->format('d/m/Y H:i').' WIB',
        ])->setPaper('a4', 'landscape');

        return $pdf->output();
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildSummarySheet(array $reportData): array
    {
        $meta = $reportData['periodMeta'];
        $kpis = $reportData['overview']['kpis'];
        $financial = $reportData['overview']['financial'];

        return [
            'name' => 'Ringkasan',
            'headers' => ['Indikator Operasional', 'Nilai Periode Ini', 'Pembanding / Keterangan'],
            'rows' => [
                ['Periode Laporan', (string) $meta['period_label'], (string) $meta['comparison_label']],
                ['Filter Aktif', (string) $meta['active_filter_summary'], 'Dicetak '.$meta['generated_at_label'].' WIB'],
                ['Omzet Kotor (Total Transaksi)', $this->formatRupiah((int) $kpis['gross_sales']['current']), $this->formatGrowth($kpis['gross_sales']['growth_percent'])],
                ['Pendapatan Bersih', $this->formatRupiah((int) $kpis['net_revenue']['current']), $this->formatGrowth($kpis['net_revenue']['growth_percent'])],
                ['Subtotal Produk', $this->formatRupiah((int) $financial['subtotal']), 'Total nilai barang terjual'],
                ['Total Diskon', $this->formatRupiah((int) $financial['discount_amount']), 'Potongan promo/voucher'],
                ['Total Ongkos Kirim', $this->formatRupiah((int) $financial['shipping_fee']), 'Biaya kurir pengiriman'],
                ['Total Biaya Layanan', $this->formatRupiah((int) $financial['service_fee']), 'Biaya layanan platform'],
                ['Total Pesanan Terhitung', (int) $kpis['orders']['current'], 'Selesai: '.$kpis['orders']['completed_count'].' | Batal: '.$kpis['orders']['cancelled_count']],
                ['Rata-rata Nilai Pesanan', $this->formatRupiah((int) $kpis['average_order_value']['current']), $this->formatGrowth($kpis['average_order_value']['growth_percent'])],
                ['Tingkat Penyelesaian', $kpis['completion_rate']['current'].'%', 'Tingkat Pembatalan: '.$kpis['orders']['cancellation_rate'].'%'],
                ['Pembeli Aktif', (int) $kpis['active_buyers']['current'], 'Baru: '.$reportData['operationsAndReviews']['customers']['new_buyers'].' | Berulang: '.$reportData['operationsAndReviews']['customers']['returning_buyers']],
                ['Nilai Pesanan Dibatalkan', $this->formatRupiah((int) $financial['cancelled_amount']), $financial['cancelled_orders_count'].' pesanan dibatalkan'],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildSalesSheet(array $reportData): array
    {
        $rows = [];

        foreach ($reportData['salesTimeline']['rows'] as $row) {
            $rows[] = [
                (string) $row['full_label'],
                (int) $row['orders_count'],
                (int) $row['completed_count'],
                (int) $row['cancelled_count'],
                (int) $row['subtotal'],
                (int) $row['discount_amount'],
                (int) $row['shipping_fee'],
                (int) $row['service_fee'],
                (int) $row['net_revenue'],
                (int) $row['total_amount'],
            ];
        }

        $totals = $reportData['salesTimeline']['totals'];
        $rows[] = [
            'Total',
            (int) $totals['orders_count'],
            (int) $totals['completed_count'],
            (int) $totals['cancelled_count'],
            (int) $totals['subtotal'],
            (int) $totals['discount_amount'],
            (int) $totals['shipping_fee'],
            (int) $totals['service_fee'],
            (int) $totals['net_revenue'],
            (int) $totals['total_amount'],
        ];

        return [
            'name' => 'Penjualan',
            'headers' => [
                'Periode',
                'Pesanan Terhitung',
                'Pesanan Selesai',
                'Pesanan Batal',
                'Subtotal Produk (Rp)',
                'Diskon (Rp)',
                'Ongkos Kirim (Rp)',
                'Biaya Layanan (Rp)',
                'Pendapatan Bersih (Rp)',
                'Total Omzet (Rp)',
            ],
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildProductsSheet(array $reportData): array
    {
        $rows = [];

        foreach ($reportData['products']['topProducts'] as $product) {
            $rows[] = [
                (string) $product['name'],
                (string) $product['category_name'],
                (string) $product['store_name'],
                (int) $product['sold_qty'],
                (int) $product['orders_count'],
                (int) $product['revenue'],
                $product['revenue_share'].'%',
                (int) $product['stock'],
                $product['is_preorder']
                    ? ($product['preorder_days'] ? 'Pre-order '.$product['preorder_days'].' hari' : 'Pre-order')
                    : 'Stok Tersedia',
                (float) $product['rating_avg'],
            ];
        }

        return [
            'name' => 'Produk Terlaris',
            'headers' => [
                'Nama Produk',
                'Kategori',
                'Toko UMKM',
                'Unit Terjual',
                'Jumlah Pesanan',
                'Omzet Produk (Rp)',
                'Kontribusi',
                'Sisa Stok',
                'Ketersediaan',
                'Rating',
            ],
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildLowStockSheet(array $reportData): array
    {
        $rows = [];

        foreach ($reportData['products']['lowStockProducts'] as $product) {
            $rows[] = [
                (string) $product['name'],
                (string) $product['category_name'],
                (string) $product['store_name'],
                (int) $product['price'],
                (int) $product['stock'],
                $product['stock'] === 0 ? 'Stok Habis' : 'Stok Menipis',
            ];
        }

        return [
            'name' => 'Stok Menipis',
            'headers' => ['Nama Produk', 'Kategori', 'Toko UMKM', 'Harga (Rp)', 'Sisa Stok', 'Status Stok'],
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildStoresSheet(array $reportData): array
    {
        $rows = [];

        foreach ($reportData['storesAndCategories']['stores'] as $store) {
            $rows[] = [
                (string) $store['name'],
                (string) $store['location'],
                (int) $store['orders_count'],
                (int) $store['completed_count'],
                (int) $store['cancelled_count'],
                $store['completion_rate'].'%',
                (int) $store['items_sold'],
                (int) $store['revenue'],
                (int) $store['average_order_value'],
                (int) $store['active_products_count'],
            ];
        }

        return [
            'name' => 'Toko UMKM',
            'headers' => [
                'Nama Toko UMKM',
                'Lokasi',
                'Pesanan',
                'Selesai',
                'Batal',
                'Tingkat Selesai',
                'Unit Terjual',
                'Omzet (Rp)',
                'Rata-rata Pesanan (Rp)',
                'Produk Aktif',
            ],
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildCategoriesSheet(array $reportData): array
    {
        $rows = [];

        foreach ($reportData['storesAndCategories']['categories'] as $category) {
            $rows[] = [
                (string) $category['name'],
                (int) $category['products_count'],
                (int) $category['orders_count'],
                (int) $category['items_sold'],
                (int) $category['revenue'],
                $category['revenue_share'].'%',
            ];
        }

        return [
            'name' => 'Kategori',
            'headers' => ['Kategori', 'Jumlah Produk', 'Jumlah Pesanan', 'Unit Terjual', 'Omzet (Rp)', 'Kontribusi'],
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildCustomersSheet(array $reportData): array
    {
        $rows = [];

        foreach ($reportData['operationsAndReviews']['customers']['top_buyers'] as $buyer) {
            $rows[] = [
                (string) $buyer['name'],
                (string) $buyer['email'],
                $buyer['is_returning'] ? 'Pelanggan Berulang' : 'Pelanggan Baru',
                (int) $buyer['orders_count'],
                (int) $buyer['total_spent'],
                (string) $buyer['last_order_at_label'],
            ];
        }

        return [
            'name' => 'Pelanggan Teratas',
            'headers' => ['Nama Pelanggan', 'Email', 'Tipe Pelanggan', 'Jumlah Pesanan', 'Total Belanja (Rp)', 'Pesanan Terakhir'],
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $reportData
     * @return array{name: string, headers: list<string>, rows: list<list<int|float|string>>}
     */
    private function buildReviewsSheet(array $reportData): array
    {
        $reviews = $reportData['operationsAndReviews']['reviews'];
        $fulfillment = $reportData['operationsAndReviews']['fulfillment'];

        $rows = [
            ['Total Ulasan Masuk', (int) $reviews['total_reviews'], 'Rata-rata Rating: '.$reviews['average_rating'].' / 5.0'],
            ['Ulasan Tampil', (int) $reviews['visible_reviews'], 'Ulasan Disembunyikan: '.$reviews['hidden_reviews']],
            ['Ulasan Dibalas Admin', (int) $reviews['replied_reviews'], 'Rasio Balasan: '.$reviews['reply_rate'].'%'],
            ['Rata-rata Waktu Bayar ke Kirim', $fulfillment['avg_hours_to_ship'] !== null ? $fulfillment['avg_hours_to_ship'].' jam' : '-', $fulfillment['shipped_sample_count'].' pesanan dikirim'],
            ['Rata-rata Waktu Kirim ke Selesai', $fulfillment['avg_hours_to_complete'] !== null ? $fulfillment['avg_hours_to_complete'].' jam' : '-', $fulfillment['completed_sample_count'].' pesanan selesai'],
        ];

        foreach ($reviews['distribution'] as $bucket) {
            $rows[] = [
                'Rating Bintang '.$bucket['rating'],
                (int) $bucket['count'],
                $bucket['percentage'].'%',
            ];
        }

        return [
            'name' => 'Ulasan dan SLA',
            'headers' => ['Metrik Operasional & Ulasan', 'Nilai', 'Keterangan'],
            'rows' => $rows,
        ];
    }

    private function formatRupiah(int $value): string
    {
        return 'Rp'.number_format($value, 0, ',', '.');
    }

    private function formatGrowth(mixed $growth): string
    {
        if (! is_numeric($growth)) {
            return 'Belum ada data pembanding';
        }

        $num = (float) $growth;
        $prefix = $num > 0 ? '+' : '';

        return $prefix.number_format($num, 1, ',', '.').'%';
    }
}
