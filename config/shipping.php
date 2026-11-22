<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Direktori Kontak & Pelacakan Jasa Ekspedisi
    |--------------------------------------------------------------------------
    |
    | Digunakan oleh panel Follow-up Operasional Admin Transaksi untuk
    | menghubungi layanan pelanggan ekspedisi dan membuka halaman lacak resi.
    |
    */
    'couriers' => [
        'kurir koperasi kossuma' => [
            'name' => 'Kurir Koperasi Kossuma',
            'phone' => '0812-8900-5544',
            'whatsapp' => '6281289005544',
            'tracking_url' => null,
            'notes' => 'Koordinator pengiriman internal Koperasi Kossuma Kota Bogor.',
        ],
        'paxel' => [
            'name' => 'Paxel',
            'phone' => '021-5082-0800',
            'whatsapp' => '6285574670318',
            'tracking_url' => 'https://paxel.co/id/lacak-pengiriman?awb={tracking_number}',
            'notes' => 'Layanan pengiriman dingin dan same-day Paxel.',
        ],
        'gosend' => [
            'name' => 'GoSend',
            'phone' => '021-5084-9000',
            'whatsapp' => null,
            'tracking_url' => 'https://www.gojek.com/id-id/gosend',
            'notes' => 'Pengiriman instan dalam kota melalui GoSend.',
        ],
        'lalamove' => [
            'name' => 'Lalamove',
            'phone' => '021-5010-6688',
            'whatsapp' => null,
            'tracking_url' => 'https://www.lalamove.com/id',
            'notes' => 'Pengiriman instan Lalamove.',
        ],
        'jne' => [
            'name' => 'JNE',
            'phone' => '021-2927-8888',
            'whatsapp' => '6281119002020',
            'tracking_url' => 'https://www.jne.co.id/id/tracking/trace',
            'notes' => 'Layanan pelanggan dan pelacakan resi JNE.',
        ],
        'j&t' => [
            'name' => 'J&T Express',
            'phone' => '021-8066-1888',
            'whatsapp' => '628118466188',
            'tracking_url' => 'https://jet.co.id/track',
            'notes' => 'Layanan pelanggan dan pelacakan resi J&T Express.',
        ],
        'sicepat' => [
            'name' => 'SiCepat',
            'phone' => '021-5020-0050',
            'whatsapp' => '6281299666088',
            'tracking_url' => 'https://www.sicepat.com/checkAwb',
            'notes' => 'Layanan pelanggan dan pelacakan resi SiCepat.',
        ],
        'ambil di gerai' => [
            'name' => 'Ambil di Gerai Kossuma',
            'phone' => '0812-8900-5544',
            'whatsapp' => '6281289005544',
            'tracking_url' => null,
            'notes' => 'Pengambilan langsung di Gerai Koperasi Kossuma Kota Bogor.',
        ],
    ],

    'fallback' => [
        'phone' => '0812-8900-5544',
        'whatsapp' => '6281289005544',
        'tracking_url' => null,
        'notes' => 'Hubungi tim logistik Koperasi Kossuma untuk bantuan tindak lanjut kurir.',
    ],
];
