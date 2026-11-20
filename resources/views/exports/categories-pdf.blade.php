<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Daftar Kategori Produk — Kossuma Kota Bogor</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1F2937;
            margin: 0;
            padding: 16px;
        }
        .header {
            margin-bottom: 16px;
            border-bottom: 2px solid #7D3394;
            padding-bottom: 10px;
        }
        .title {
            font-size: 16px;
            font-weight: bold;
            color: #1F2937;
            margin: 0 0 4px 0;
        }
        .subtitle {
            font-size: 10px;
            color: #6B7280;
            margin: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        th {
            background-color: #F0E6F5;
            color: #7D3394;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #E2C9EB;
            font-size: 10px;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #E5E7EB;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .col-no { width: 5%; }
        .col-name { font-weight: bold; }
        .col-slug { color: #6B7280; }
        .col-description { color: #4B5563; line-height: 1.45; }
        .col-products_count { width: 11%; text-align: center; }
        .col-created_at,
        .col-updated_at { width: 13%; color: #6B7280; }
        .empty {
            text-align: center;
            color: #6B7280;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <p class="title">Daftar Kategori Produk — Kossuma Kota Bogor</p>
        <p class="subtitle">Dicetak pada {{ $printedAt }} • Total {{ $total }} kategori</p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="col-no">No</th>
                @foreach ($columns as $column)
                    <th class="col-{{ $column }}">{{ $headers[$column] ?? $column }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $index => $row)
                <tr>
                    <td class="col-no">{{ $index + 1 }}</td>
                    @foreach ($columns as $column)
                        <td class="col-{{ $column }}">{{ $row[$column] ?? '-' }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($columns) + 1 }}" class="empty">Tidak ada data kategori untuk diekspor.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
