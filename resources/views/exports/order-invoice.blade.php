<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order['orderNumber'] }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1F2937;
            margin: 0;
            padding: 20px;
            line-height: 1.5;
        }
        .header {
            border-bottom: 2px solid #7D3394;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .brand {
            font-size: 18px;
            font-weight: bold;
            color: #7D3394;
            margin: 0;
        }
        .subtitle {
            font-size: 10px;
            color: #6B7280;
            margin: 2px 0 0 0;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }
        .meta-table td {
            vertical-align: top;
            padding: 4px 8px 4px 0;
        }
        .label {
            color: #6B7280;
            font-size: 10px;
        }
        .value {
            font-weight: bold;
            color: #1F2937;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1F2937;
            margin: 14px 0 8px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .items-table th {
            background-color: #F0E6F5;
            color: #7D3394;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #E2C9EB;
            font-size: 10px;
        }
        .items-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #E5E7EB;
            vertical-align: top;
        }
        .text-right {
            text-align: right;
        }
        .summary-table {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 4px 0;
        }
        .total-row td {
            border-top: 1px solid #E5E7EB;
            padding-top: 8px;
            font-weight: bold;
            font-size: 13px;
        }
        .price-red {
            color: #DC2626;
        }
        .footer {
            margin-top: 28px;
            padding-top: 10px;
            border-top: 1px solid #E5E7EB;
            font-size: 10px;
            color: #6B7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <p class="brand">Kossuma Kota Bogor</p>
        <p class="subtitle">Koperasi Usaha Persaudaraan Muslimah Kota Bogor • Invoice Transaksi</p>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 50%;">
                <div class="label">Nomor Pesanan</div>
                <div class="value">{{ $order['orderNumber'] }}</div>
                <div class="label" style="margin-top: 6px;">Tanggal Pesan</div>
                <div>{{ $order['createdAtLabel'] }}</div>
                <div class="label" style="margin-top: 6px;">Toko UMKM</div>
                <div class="value">{{ $order['store']['name'] }}</div>
                <div>{{ $order['store']['location'] }}</div>
            </td>
            <td style="width: 50%;">
                <div class="label">Status Pesanan &amp; Pembayaran</div>
                <div class="value">{{ $order['statusLabel'] }} • {{ $order['paymentStatusLabel'] }} ({{ $order['paymentChannel'] }})</div>
                <div class="label" style="margin-top: 6px;">Penerima &amp; Alamat Pengiriman</div>
                <div class="value">{{ $order['shippingAddress']['recipientName'] }} ({{ $order['shippingAddress']['phone'] }})</div>
                <div>
                    {{ $order['shippingAddress']['fullAddress'] }},
                    {{ $order['shippingAddress']['district'] }},
                    {{ $order['shippingAddress']['city'] }}
                    {{ $order['shippingAddress']['postalCode'] }}
                </div>
                <div class="label" style="margin-top: 6px;">Pengiriman</div>
                <div>
                    {{ $order['shippingMethod'] }} ({{ $order['shippingCourier'] }})
                    @if ($order['trackingNumber'])
                        • Resi: {{ $order['trackingNumber'] }}
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">Rincian Produk</div>
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 48%;">Produk</th>
                <th style="width: 14%;" class="text-right">Jumlah</th>
                <th style="width: 19%;" class="text-right">Harga Satuan</th>
                <th style="width: 19%;" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order['items'] as $item)
                <tr>
                    <td>
                        <div class="value">{{ $item['productName'] }}</div>
                        @if ($item['unitLabel'])
                            <div class="label">{{ $item['unitLabel'] }}</div>
                        @endif
                    </td>
                    <td class="text-right">{{ $item['quantity'] }}</td>
                    <td class="text-right">Rp{{ number_format($item['price'], 0, ',', '.') }}</td>
                    <td class="text-right">Rp{{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="summary-table">
        <tr>
            <td class="label">Total Harga Barang</td>
            <td class="text-right">Rp{{ number_format($order['subtotal'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Ongkos Kirim</td>
            <td class="text-right">
                {{ $order['shippingFee'] === 0 ? 'Gratis' : 'Rp'.number_format($order['shippingFee'], 0, ',', '.') }}
            </td>
        </tr>
        @if ($order['discountAmount'] > 0)
            <tr>
                <td class="label">Potongan Promo</td>
                <td class="text-right">-Rp{{ number_format($order['discountAmount'], 0, ',', '.') }}</td>
            </tr>
        @endif
        <tr>
            <td class="label">Biaya Layanan</td>
            <td class="text-right">Rp{{ number_format($order['serviceFee'], 0, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
            <td>Total Belanja</td>
            <td class="text-right price-red">Rp{{ number_format($order['totalAmount'], 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="footer">
        Dokumen ini dihasilkan secara otomatis oleh sistem Admin Kossuma Kota Bogor pada {{ $printedAt }}.
    </div>
</body>
</html>
