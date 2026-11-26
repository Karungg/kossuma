<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #1F2937;
            margin: 0;
            padding: 16px;
        }
        .header {
            border-bottom: 2px solid #7D3394;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .brand {
            font-size: 11px;
            font-weight: bold;
            color: #7D3394;
            margin: 0 0 3px 0;
        }
        .title {
            font-size: 16px;
            font-weight: bold;
            color: #1F2937;
            margin: 0 0 4px 0;
        }
        .meta {
            font-size: 9.5px;
            color: #6B7280;
            margin: 0;
            line-height: 1.5;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1F2937;
            margin: 16px 0 8px 0;
            padding-bottom: 4px;
            border-bottom: 1px solid #E5E7EB;
        }
        .kpi-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px 0;
            margin: 0 -6px 10px -6px;
        }
        .kpi-card {
            background-color: #F8F9FB;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 8px 10px;
            vertical-align: top;
        }
        .kpi-label {
            font-size: 8.5px;
            color: #6B7280;
            margin: 0 0 4px 0;
        }
        .kpi-value {
            font-size: 13px;
            font-weight: bold;
            color: #1F2937;
            margin: 0 0 2px 0;
        }
        .kpi-price {
            color: #DC2626;
        }
        .kpi-sub {
            font-size: 8px;
            color: #6B7280;
            margin: 0;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.data-table th {
            background-color: #F0E6F5;
            color: #7D3394;
            font-weight: bold;
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid #E2C9EB;
            font-size: 9px;
        }
        table.data-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #E5E7EB;
            vertical-align: top;
            font-size: 9px;
            line-height: 1.4;
        }
        table.data-table tr.total-row td {
            background-color: #F8F9FB;
            font-weight: bold;
            border-top: 1px solid #D1D5DB;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .price {
            color: #DC2626;
            font-weight: bold;
        }
        .empty {
            text-align: center;
            color: #6B7280;
            padding: 14px;
        }
    </style>
</head>
<body>
    @php
        $rp = static fn (int|float $val): string => 'Rp'.number_format((int) $val, 0, ',', '.');
        $meta = $report['periodMeta'];
        $kpis = $report['overview']['kpis'];
        $financial = $report['overview']['financial'];
    @endphp

    <div class="header">
        <p class="brand">Kossuma Kota Bogor — Koperasi Usaha Persaudaraan Muslimah</p>
        <p class="title">{{ $documentTitle }}</p>
        <p class="meta">
            Periode: {{ $meta['period_label'] }} ({{ $meta['comparison_label'] }})<br>
            Filter Aktif: {{ $meta['active_filter_summary'] }} • Dicetak pada {{ $printedAt }}
        </p>
    </div>

    <table class="kpi-grid">
        <tr>
            <td class="kpi-card" style="width: 25%;">
                <p class="kpi-label">Total Omzet</p>
                <p class="kpi-value kpi-price">{{ $rp($kpis['gross_sales']['current']) }}</p>
                <p class="kpi-sub">Pendapatan bersih: {{ $rp($kpis['net_revenue']['current']) }}</p>
            </td>
            <td class="kpi-card" style="width: 25%;">
                <p class="kpi-label">Pesanan Terhitung</p>
                <p class="kpi-value">{{ number_format($kpis['orders']['current'], 0, ',', '.') }}</p>
                <p class="kpi-sub">Selesai: {{ $kpis['orders']['completed_count'] }} • Batal: {{ $kpis['orders']['cancelled_count'] }}</p>
            </td>
            <td class="kpi-card" style="width: 25%;">
                <p class="kpi-label">Rata-rata Nilai Pesanan</p>
                <p class="kpi-value kpi-price">{{ $rp($kpis['average_order_value']['current']) }}</p>
                <p class="kpi-sub">Tingkat selesai: {{ $kpis['completion_rate']['current'] }}%</p>
            </td>
            <td class="kpi-card" style="width: 25%;">
                <p class="kpi-label">Pembeli Aktif &amp; Ulasan</p>
                <p class="kpi-value">{{ number_format($kpis['active_buyers']['current'], 0, ',', '.') }} Pembeli</p>
                <p class="kpi-sub">Rating rata-rata: {{ $report['operationsAndReviews']['reviews']['average_rating'] }} / 5.0</p>
            </td>
        </tr>
    </table>

    @if ($scope === 'all' || $scope === 'sales')
        <p class="section-title">Ringkasan Komponen Keuangan</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Subtotal Produk</th>
                    <th>Total Diskon</th>
                    <th>Total Ongkos Kirim</th>
                    <th>Biaya Layanan</th>
                    <th>Pendapatan Bersih</th>
                    <th>Total Omzet</th>
                    <th>Nilai Pesanan Batal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $rp($financial['subtotal']) }}</td>
                    <td>{{ $rp($financial['discount_amount']) }}</td>
                    <td>{{ $rp($financial['shipping_fee']) }}</td>
                    <td>{{ $rp($financial['service_fee']) }}</td>
                    <td class="price">{{ $rp($financial['net_revenue']) }}</td>
                    <td class="price">{{ $rp($financial['total_amount']) }}</td>
                    <td>{{ $rp($financial['cancelled_amount']) }} ({{ $financial['cancelled_orders_count'] }})</td>
                </tr>
            </tbody>
        </table>

        <p class="section-title">Rekap Penjualan per Periode</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Periode</th>
                    <th class="text-right">Pesanan</th>
                    <th class="text-right">Selesai</th>
                    <th class="text-right">Batal</th>
                    <th class="text-right">Subtotal</th>
                    <th class="text-right">Diskon</th>
                    <th class="text-right">Ongkir</th>
                    <th class="text-right">Total Omzet</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($report['salesTimeline']['rows'] as $row)
                    <tr>
                        <td>{{ $row['full_label'] }}</td>
                        <td class="text-right">{{ $row['orders_count'] }}</td>
                        <td class="text-right">{{ $row['completed_count'] }}</td>
                        <td class="text-right">{{ $row['cancelled_count'] }}</td>
                        <td class="text-right">{{ $rp($row['subtotal']) }}</td>
                        <td class="text-right">{{ $rp($row['discount_amount']) }}</td>
                        <td class="text-right">{{ $rp($row['shipping_fee']) }}</td>
                        <td class="text-right price">{{ $rp($row['total_amount']) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="empty">Tidak ada data penjualan pada periode ini.</td>
                    </tr>
                @endforelse
                @if (count($report['salesTimeline']['rows']) > 0)
                    @php $totals = $report['salesTimeline']['totals']; @endphp
                    <tr class="total-row">
                        <td>Total</td>
                        <td class="text-right">{{ $totals['orders_count'] }}</td>
                        <td class="text-right">{{ $totals['completed_count'] }}</td>
                        <td class="text-right">{{ $totals['cancelled_count'] }}</td>
                        <td class="text-right">{{ $rp($totals['subtotal']) }}</td>
                        <td class="text-right">{{ $rp($totals['discount_amount']) }}</td>
                        <td class="text-right">{{ $rp($totals['shipping_fee']) }}</td>
                        <td class="text-right price">{{ $rp($totals['total_amount']) }}</td>
                    </tr>
                @endif
            </tbody>
        </table>
    @endif

    @if ($scope === 'all' || $scope === 'products')
        <p class="section-title">Performa Produk Terlaris</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Toko UMKM</th>
                    <th class="text-right">Terjual</th>
                    <th class="text-right">Omzet</th>
                    <th class="text-right">Kontribusi</th>
                    <th class="text-right">Stok</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($report['products']['topProducts'] as $product)
                    <tr>
                        <td>{{ $product['name'] }}</td>
                        <td>{{ $product['category_name'] }}</td>
                        <td>{{ $product['store_name'] }}</td>
                        <td class="text-right">{{ $product['sold_qty'] }}</td>
                        <td class="text-right price">{{ $rp($product['revenue']) }}</td>
                        <td class="text-right">{{ $product['revenue_share'] }}%</td>
                        <td class="text-right">{{ $product['stock'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="empty">Belum ada produk terjual pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif

    @if ($scope === 'all' || $scope === 'stores')
        <p class="section-title">Performa Toko UMKM</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Toko UMKM</th>
                    <th>Lokasi</th>
                    <th class="text-right">Pesanan</th>
                    <th class="text-right">Tingkat Selesai</th>
                    <th class="text-right">Unit Terjual</th>
                    <th class="text-right">Rata-rata Pesanan</th>
                    <th class="text-right">Omzet</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($report['storesAndCategories']['stores'] as $store)
                    <tr>
                        <td>{{ $store['name'] }}</td>
                        <td>{{ $store['location'] }}</td>
                        <td class="text-right">{{ $store['orders_count'] }}</td>
                        <td class="text-right">{{ $store['completion_rate'] }}%</td>
                        <td class="text-right">{{ $store['items_sold'] }}</td>
                        <td class="text-right">{{ $rp($store['average_order_value']) }}</td>
                        <td class="text-right price">{{ $rp($store['revenue']) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="empty">Belum ada transaksi toko UMKM pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <p class="section-title">Kontribusi Penjualan per Kategori</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Kategori</th>
                    <th class="text-right">Jumlah Produk</th>
                    <th class="text-right">Pesanan</th>
                    <th class="text-right">Unit Terjual</th>
                    <th class="text-right">Omzet</th>
                    <th class="text-right">Kontribusi</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($report['storesAndCategories']['categories'] as $category)
                    <tr>
                        <td>{{ $category['name'] }}</td>
                        <td class="text-right">{{ $category['products_count'] }}</td>
                        <td class="text-right">{{ $category['orders_count'] }}</td>
                        <td class="text-right">{{ $category['items_sold'] }}</td>
                        <td class="text-right price">{{ $rp($category['revenue']) }}</td>
                        <td class="text-right">{{ $category['revenue_share'] }}%</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="empty">Tidak ada data kategori.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif

    @if ($scope === 'all' || $scope === 'operations')
        <p class="section-title">Operasional, Pelanggan Teratas &amp; Ulasan</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Pelanggan</th>
                    <th>Email</th>
                    <th>Tipe</th>
                    <th class="text-right">Pesanan</th>
                    <th class="text-right">Total Belanja</th>
                    <th>Pesanan Terakhir</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($report['operationsAndReviews']['customers']['top_buyers'] as $buyer)
                    <tr>
                        <td>{{ $buyer['name'] }}</td>
                        <td>{{ $buyer['email'] }}</td>
                        <td>{{ $buyer['is_returning'] ? 'Pelanggan Berulang' : 'Pelanggan Baru' }}</td>
                        <td class="text-right">{{ $buyer['orders_count'] }}</td>
                        <td class="text-right price">{{ $rp($buyer['total_spent']) }}</td>
                        <td>{{ $buyer['last_order_at_label'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="empty">Belum ada data pembeli pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif
</body>
</html>
