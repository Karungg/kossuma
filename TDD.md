# Technical Design Document (TDD): Kossuma Marketplace Platform

- **Document Version:** 1.0.0
- **Status:** Active / Technical Specification
- **Architecture Pattern:** Native Laravel Directory Structure (Organized by Specific Feature Modules across Backend, Database, and Frontend)
- **Target Stack:** PHP 8.5 / Laravel 13 / MySQL 8.0+ (or PostgreSQL) / Inertia.js v3 (React 19 + TypeScript) / Tailwind CSS v4 / Laravel Fortify / Laravel Wayfinder / Pest v5
- **Accent Brand Color:** `#7D3394` (Kossuma Royal Purple)
- **Reference Guidelines:** [AGENTS.md](AGENTS.md) (Laravel Boost Rules) & [PRD.md](PRD.md)

---

## 1. Foundational Architecture & Coding Guidelines

Following the curated **Laravel Boost Guidelines** ([AGENTS.md](AGENTS.md)), all code generated for this codebase MUST adhere strictly to the following standards:

### 1.1. Application Structure (Modul Spesifik Per Fitur)
Aplikasi ini menggunakan struktur folder standar Laravel (`app/`, `database/`, `resources/js/`), namun diorganisir secara spesifik langsung berdasarkan **Nama Modul Fitur** pada domain Kossuma Marketplace (`User`, `Store`, `Category`, `Product`, `Promotion`, `Cart`, `Order`, `Payment`, `Shipping`, `ReturnOrder`, `Review`, `Chat`, `Finance`, `Dashboard`):

- **Backend (`app/`):** Controllers, Models, Enums, Contracts, Services, Policies, Observers, dan Requests dikelompokkan langsung dalam subfolder Modul Fitur (misal: `app/Models/Store/Store.php`, `app/Models/Product/Product.php`, `app/Contracts/Order/OrderServiceInterface.php`, `app/Services/Order/OrderService.php`, `app/Http/Controllers/Product/ProductController.php`, `app/Services/Payment/MidtransService.php`, `app/Services/Shipping/ShippingAggregatorService.php`, dll.).
- **Database (`database/`):** Factories dan Seeders dikelompokkan dalam subfolder Modul Fitur (`User/`, `Store/`, `Category/`, `Product/`, `Promotion/`, `Order/`, `ReturnOrder/`, `Review/`, `Chat/`, `Finance/`).
- **Frontend (`resources/js/`):** Halaman Inertia v3 (`resources/js/pages/`) dan komponen UI lokal dikelompokkan berdasarkan gerbang peran dan Modul Fitur (`resources/js/pages/storefront/`, `resources/js/pages/customer/`, `resources/js/pages/seller/`, `resources/js/pages/admin/`, `resources/js/pages/dashboard/`).

---

### 1.2. Model Attributes & PHP 8.5 Conventions
- Gunakan PHP 8 Class Attributes (`#[Fillable([...])]`, `#[Hidden([...])]`, `#[UsePolicy(...)]`, `#[ObservedBy([...])]`) pada Model Eloquent sesuai standar Laravel 13 pada `app/Models/User.php`.
- Gunakan **PHP 8.5 strict typing**, constructor property promotion (`public readonly`), explicit return types, TitleCase untuk Enum keys (`UserRole::HeadOffice`, `AvailabilityType::PreOrder`, `OrderStatus::ReadyToShip`), dan jalankan Pint formatter (`vendor/bin/pint --dirty --format agent`) merujuk ke [AGENTS.md](AGENTS.md).
- Seluruh nilai mata uang (harga produk, diskon, ongkos kirim, saldo toko, komisi, refund) **WAJIB** bertipe `BIGINT` (Rupiah penuh tanpa desimal mengambang) untuk menjamin akurasi mutlak pada perhitungan keuangan.

---

### 1.3. Multi-Gate Routing Scheme & Frontend Architecture (Inertia v3 + React 19 + Wayfinder)

#### A. Skema Rute Tiga Gerbang Utama (Multi-Gate Routing)
Sistem memisahkan seluruh alur navigasi dan hak akses menjadi tiga gerbang rute utama sesuai peran pengguna di [PRD.md](PRD.md):

1. **Gerbang Head of Office / Management Kossuma (`/admin/*`):**
   - Diperuntukkan bagi peran pengelola pusat: `HeadOffice`.
   - Rute terdaftar di `routes/admin.php`:
     - Dashboard Executive & KPI Toko: `admin/dashboard` (`admin.dashboard`).
     - Manajemen Toko UMKM Binaan: `admin/stores` (`admin.stores.*`).
     - Manajemen Kategori Global: `admin/categories` (`admin.categories.*`).
     - Moderasi Katalog Produk UMKM: `admin/products` (`admin.products.*`).
     - Manajemen Diskon Hari Tertentu: `admin/scheduled-discounts` (`admin.scheduled-discounts.*`).
     - Manajemen Voucher Global: `admin/vouchers` (`admin.vouchers.*`).
     - Monitoring Transaksi & Pengiriman: `admin/orders` (`admin.orders.*`).
     - Resolusi & Eskalasi Return Barang: `admin/returns` (`admin.returns.*`).
     - Laporan Keuangan Komprehensif & Payout: `admin/finance` (`admin.finance.*`), `admin/payouts` (`admin.payouts.*`).
     - Manajemen Pengguna: `admin/users` (`admin.users.*`).
     - Pusat Komunikasi UMKM: `admin/chat` (`admin.chat.*`).

2. **Gerbang Toko UMKM / Seller (`/store-panel/*`):**
   - Diperuntukkan bagi mitra penjual UMKM Kossuma: `Seller`.
   - Rute terdaftar di `routes/seller.php`:
     - Dashboard Operasional Toko: `store-panel/dashboard` (`seller.dashboard`).
     - Profil & Lokasi Toko UMKM: `store-panel/profile` (`seller.profile.*`).
     - Manajemen Produk, Stok, Ready/PO, Best Seller, Diskon: `store-panel/products` (`seller.products.*`).
     - Voucher & Partisipasi Promo Toko: `store-panel/promotions` (`seller.promotions.*`).
     - Pesanan Masuk & Request Pickup Ekspedisi: `store-panel/orders` (`seller.orders.*`).
     - Penanganan Return Barang: `store-panel/returns` (`seller.returns.*`).
     - Ulasan & Balasan Penilaian: `store-panel/reviews` (`seller.reviews.*`).
     - Laporan Keuangan Toko & Pencairan Dana: `store-panel/finance` (`seller.finance.*`).
     - Inbox Chat (Customer <-> Toko & Toko <-> Head of Office): `store-panel/chat` (`seller.chat.*`).

3. **Gerbang Publik Storefront & Customer (`/`, `/customer/*`):**
   - Diperuntukkan bagi pengunjung publik dan pembeli terdaftar: `Customer`.
   - Rute terdaftar di `routes/web.php` & `routes/customer.php`:
     - Beranda & Promo Hari Ini: `/` (`storefront.home`).
     - Katalog, Pencarian & Filter Lengkap: `/catalog` (`storefront.catalog`).
     - Detail Produk & Etalase Toko UMKM: `/products/{slug}` (`storefront.products.show`), `/stores/{slug}` (`storefront.stores.show`).
     - Keranjang Belanja Multi-Toko: `/cart` (`customer.cart.*`).
     - Checkout, Pilih Alamat, Ongkir Kurir, & Voucher: `/checkout` (`customer.checkout.*`).
     - Histori Pesanan & Live Tracking Ekspedisi: `/orders` (`customer.orders.*`).
     - Pengajuan Return Barang Bermasalah: `/orders/{storeOrder}/returns` (`customer.returns.*`).
     - Penilaian & Ulasan Pesanan Selesai: `/orders/{storeOrder}/reviews` (`customer.reviews.*`).
     - Chat dengan Toko UMKM: `/chat` (`customer.chat.*`).
     - Profil, Nomor Telepon, & Buku Alamat Berkoordinat: `/settings/profile`, `/settings/addresses` (`customer.addresses.*`).

4. **Gerbang Webhook Eksternal (`/api/webhooks/*`):**
   - Bebas dari proteksi CSRF session browser namun wajib divalidasi dengan *cryptographic signature*:
     - Midtrans Notification Webhook: `POST /api/webhooks/midtrans` (`webhooks.midtrans`).
     - Shipping Status Webhook: `POST /api/webhooks/shipping/{provider}` (`webhooks.shipping`, mendukung `paxel`, `lalamove`, `gosend`).

#### B. Pembagian Komponen Global vs Lokal Modul
- **Komponen Global Shared (`resources/js/components/` & `resources/js/hooks/`):** Digunakan murni untuk elemen UI universal lintas fitur:
  - UI Primitives (`resources/js/components/ui/`): Button (dengan warna utama `#7D3394`), Input, Select, Checkbox, Dialog, Label, Badge, Card, Tooltip, DropdownMenu, Tabs, Avatar, Separator.
  - App Layout Shell (`resources/js/layouts/` & `resources/js/components/`): `storefront-layout.tsx`, `seller-layout.tsx`, `admin-layout.tsx`, `app-header.tsx`, `app-sidebar.tsx`, `breadcrumbs.tsx`.
  - Generic Utility Components (`resources/js/components/`): `data-table/` (`DataTableHeader`, `DataTablePagination`, `ColumnVisibilityDropdown`), `delete-confirm-modal.tsx`, `price-display.tsx` (formatter Rupiah), `coordinate-picker.tsx`, `input-error.tsx`.
  - Custom Shared Hooks (`resources/js/hooks/`): `use-table-filters.ts`, `use-row-selection.ts`, `use-column-visibility.ts`, `use-delete-confirm.ts`, `use-mobile.ts`, `use-currency.ts`.
- **Komponen Lokal Modul (`resources/js/pages/{gate}/{module}/components/`):** Digunakan secara spesifik HANYA untuk modul fitur terkait:
  - Component khusus modul: `{module}-form.tsx`, `{module}-table.tsx`, `{module}-stat-cards.tsx`, `{module}-detail-modal.tsx`, `{module}-index-toolbar.tsx`.
  - Definisi tipe TypeScript khusus modul: `resources/js/pages/{gate}/{module}/types.ts`.
  - **DILARANG** menaruh komponen spesifik modul di folder `resources/js/components/` global untuk menjaga isolasi fitur dan modularitas.
- **Server Routing:** Gunakan `Inertia::render('{gate}/{module}/{page}', $props)` alih-alih Blade views.
- **Typed Routing (Wayfinder):** **DILARANG KERAS** melakukan hardcode string URL pada kode React frontend. Selalu impor fungsi rute yang ter-generate otomatis dari `@/actions/` (Controllers) atau `@/routes/` (Named Routes):
  ```tsx
  import { index as sellerProductsIndex } from '@/routes/seller/products';
  import { show as productDetail } from '@/routes/storefront/products';
  import { Link } from '@inertiajs/react';
  ```
- **Inertia v3 Features:** Manfaatkan `useHttp` hook untuk kalkulasi ongkir XHR mandiri, `Inertia::defer()` dengan animasi skeleton untuk analitik KPI dan laporan keuangan, `usePoll` pada ruang chat, instant visits, prefetching pada kartu produk katalog, dan `router.cancelAll()`.

---

### 1.4. Service Pattern Architecture (Interface & Implementation per Feature Module)
- **Alasan Penggunaan Service Pattern:** Digunakan secara ketat untuk **menjaga Controller tetap bersih (*skinny controllers*)**. Controller hanya bertugas menangani alur HTTP request/response, delegasi otorisasi (`Gate::authorize`), validasi awal (Form Request), dan merender tampilan Inertia atau stream download/redirect. Seluruh logika bisnis (*business logic*), kalkulasi harga diskon hari tertentu, pemecahan sub-order per toko, transaksi database (`DB::transaction`), serta integrasi Midtrans & Ekspedisi dienkapsulasi penuh di dalam Service layer.
- **Pemisahan Interface & Implementasi:**
  Setiap modul wajib memisahkan antarmuka (Contract) dan implementasi Service-nya dengan struktur folder yang konsisten sesuai Modul Fitur:
  - **Interface / Contract:** Diletakkan pada folder `app/Contracts/{ModuleName}/{ModuleName}ServiceInterface.php`
  - **Implementation:** Diletakkan pada folder `app/Services/{ModuleName}/{ModuleName}Service.php`
- **Service Binding & Injeksi Dependensi:**
  - Binding antarmuka ke kelas implementasinya terdaftar pada `AppServiceProvider`:
    ```php
    $this->app->bind(
        \App\Contracts\Product\ProductServiceInterface::class,
        \App\Services\Product\ProductService::class
    );
    ```
  - Controller **WAJIB** bergantung pada Interface (bukan kelas konkret) melalui PHP 8.5 Constructor Property Promotion:
    ```php
    public function __construct(
        public readonly ProductServiceInterface $productService,
    ) {}
    ```

---

## 2. Roles, Access Boundaries, & Database Schema

### 2.1. Roles & Access Boundaries (PRD Alignment)

Mengacu pada [PRD.md](PRD.md) Section 4 & Section 5:

| Role (`UserRole`) | Domain & Scope | Wewenang & Batas Akses Bisnis |
| :--- | :--- | :--- |
| **HeadOffice** (`HeadOffice`) | Tata Kelola Ekosistem Kossuma, Keuangan Terpusat, & KPI UMKM | Mengelola seluruh toko UMKM binaan (`admin/stores`), kategori global (`admin/categories`), moderasi seluruh produk, pembuatan program **Diskon Hari Tertentu** (`scheduled_discounts`) & voucher global, mediasi/keputusan final atas **Return Barang** yang dieskalasi, persetujuan pencairan dana (*payout*), **Laporan Keuangan Komprehensif** lintas toko, **Dashboard KPI Keramaian Toko** (toko paling ramai vs. sepi), serta chat langsung ke setiap toko UMKM. |
| **Seller / Toko UMKM** (`Seller`) | Operasional Toko UMKM Mandiri | Hanya dapat mengakses dan mengelola data milik tokonya sendiri (`stores.user_id = $user->id`). Menginput produk beserta foto, stok, harga, lokasi, serta menentukan status **Ready Stock**, **Pre-Order (PO)**, **Best Seller**, dan **Diskon**. Memproses pesanan masuk (`StoreOrder`), melakukan *Request Pickup* kurir (Paxel/Lalamove/GoSend), merespons komplain/retur pelanggan, membalas ulasan, melihat **Laporan Keuangan Khusus Tokonya**, serta berkomunikasi via chat dengan **Customer** maupun **Head of Office Kossuma**. |
| **Customer** (`Customer`) | Pembeli & Pelanggan Kossuma | Mengelola profil (nomor telepon & multi-alamat pengiriman berkoordinat), menjelajahi katalog produk UMKM berdasarkan kategori/pencarian/filter lengkap, menambahkan produk ke keranjang, menggunakan voucher & menikmati diskon hari tertentu, memilih kurir & melihat ongkir real-time, membayar aman via **Midtrans**, melacak status pesanan (*live tracking*), melihat histori pesanan, menghubungi toko via chat, mengajukan **Return Barang** ketika bermasalah, dan memberikan rating/ulasan saat pesanan selesai. |

---

### 2.2. Spesifikasi Tabel Per Modul (Detailed Field Specifications)

#### A. Core User & Store Modules

##### 1. `users` (Modul User)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key pengguna |
| `name` | `string(150)` | Not Null | Nama lengkap pengguna |
| `email` | `string(255)` | Unique, Not Null | Email resmi (login credential) |
| `phone` | `string(30)` | Unique, Nullable, Index | Nomor telepon / WhatsApp aktif |
| `role` | `enum` | `Customer`, `Seller`, `HeadOffice` | Peran pengguna (Default: `Customer`) |
| `avatar_path` | `string(255)` | Nullable | Foto profil pengguna |
| `is_active` | `boolean` | Default: `true` | Status akun aktif / ditangguhkan |
| `email_verified_at` | `timestamp` | Nullable | Waktu verifikasi email Fortify |
| `password` | `string(255)` | Not Null | Hash password argon2id/bcrypt |
| `two_factor_*` | `text/timestamp` | Nullable | Kolom autentikasi 2FA Fortify |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

##### 2. `user_addresses` (Modul User Address)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key alamat |
| `user_id` | `bigint unsigned` | FK (`users.id`), Cascade | Pemilik alamat |
| `label` | `string(50)` | Not Null | Label alamat (misal: Rumah, Kantor, Kos) |
| `recipient_name` | `string(150)` | Not Null | Nama penerima paket |
| `phone` | `string(30)` | Not Null | Nomor telepon penerima untuk kurir |
| `province_name` | `string(100)` | Not Null | Nama provinsi |
| `city_name` | `string(100)` | Not Null, Index | Nama kota / kabupaten |
| `district_name` | `string(100)` | Not Null | Nama kecamatan |
| `postal_code` | `string(10)` | Not Null, Index | Kode pos pengiriman (penting untuk Paxel) |
| `full_address` | `text` | Not Null | Detail jalan, nomor rumah, RT/RW |
| `courier_notes` | `string(255)` | Nullable | Patokan lokasi untuk kurir instan |
| `latitude` | `decimal(10,8)` | Not Null | Titik koordinat lintang (wajib untuk GoSend & Lalamove) |
| `longitude` | `decimal(11,8)` | Not Null | Titik koordinat bujur (wajib untuk GoSend & Lalamove) |
| `is_default` | `boolean` | Default: `false` | Penanda alamat utama customer |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

##### 3. `stores` (Modul Store / Toko UMKM Kossuma)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key toko UMKM |
| `user_id` | `bigint unsigned` | FK (`users.id`), Unique | Akun pemilik/pengelola toko UMKM |
| `name` | `string(150)` | Unique, Not Null | Nama resmi Toko UMKM |
| `slug` | `string(160)` | Unique, Not Null | URL slug toko |
| `description` | `text` | Nullable | Cerita singkat & deskripsi UMKM |
| `logo_path` | `string(255)` | Nullable | Foto logo toko |
| `banner_path` | `string(255)` | Nullable | Foto sampul etalase toko |
| `phone` | `string(30)` | Not Null | Nomor kontak penjemputan kurir |
| `province_name` | `string(100)` | Not Null | Provinsi lokasi toko |
| `city_name` | `string(100)` | Not Null, Index | Kota/Kabupaten lokasi toko (ditampilkan di katalog) |
| `district_name` | `string(100)` | Not Null | Kecamatan lokasi toko |
| `postal_code` | `string(10)` | Not Null | Kode pos lokasi penjemputan |
| `full_address` | `text` | Not Null | Alamat lengkap titik jemput (*pickup point*) |
| `latitude` | `decimal(10,8)` | Not Null | Koordinat lintang titik jemput kurir |
| `longitude` | `decimal(11,8)` | Not Null | Koordinat bujur titik jemput kurir |
| `commission_percent` | `decimal(5,2)` | Default: `0.00` | Persentase bagi hasil/biaya layanan ke Head of Office |
| `wallet_balance` | `bigint` | Default: `0` | Saldo bersih toko yang siap dicairkan (Rupiah) |
| `escrow_balance` | `bigint` | Default: `0` | Dana pesanan berjalan yang masih ditahan (Rupiah) |
| `rating_avg` | `decimal(3,2)` | Default: `0.00`, Index | Rata-rata penilaian toko (0.00 - 5.00) |
| `reviews_count` | `integer unsigned` | Default: `0` | Total ulasan yang diterima toko |
| `completed_orders_count`| `integer unsigned` | Default: `0`, Index | Total pesanan selesai (metrik KPI keramaian) |
| `is_active` | `boolean` | Default: `true`, Index | Status operasional toko UMKM |
| `timestamps` | `timestamp` | `created_at`, `updated_at`, `deleted_at` | Waktu audit & soft deletes |

---

#### B. Catalog, Product, & Promotion Modules

##### 1. `categories` (Modul Category)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key kategori |
| `parent_id` | `bigint unsigned` | FK (`categories.id`), Nullable | Kategori induk (opsional sub-kategori) |
| `name` | `string(120)` | Not Null | Nama kategori UMKM |
| `slug` | `string(140)` | Unique, Not Null | URL slug kategori |
| `icon` | `string(60)` | Nullable | Nama ikon Lucide / SVG |
| `image_path` | `string(255)` | Nullable | Thumbnail kategori |
| `sort_order` | `integer` | Default: `0`, Index | Urutan tampil kategori di katalog |
| `is_active` | `boolean` | Default: `true` | Status visibilitas kategori |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

##### 2. `products` & `product_images` (Modul Product)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key produk |
| `store_id` | `bigint unsigned` | FK (`stores.id`), Index | Toko UMKM pemilik produk |
| `category_id` | `bigint unsigned` | FK (`categories.id`), Index | Kategori produk |
| `name` | `string(200)` | Not Null, Fulltext | Nama produk UMKM |
| `slug` | `string(220)` | Unique, Not Null | URL slug produk |
| `sku` | `string(64)` | Nullable, Index | Kode SKU internal toko |
| `description` | `longText` | Not Null | Deskripsi lengkap, komposisi, ukuran, dll. |
| `base_price` | `bigint unsigned` | Not Null, Index | Harga normal satuan dalam Rupiah |
| `discount_price` | `bigint unsigned` | Nullable, Index | Harga setelah diskon langsung dari toko |
| `discount_starts_at` | `timestamp` | Nullable | Waktu mulai diskon produk toko |
| `discount_ends_at` | `timestamp` | Nullable | Waktu berakhir diskon produk toko |
| `stock` | `integer unsigned` | Default: `0`, Index | Jumlah stok tersedia (atau kuota PO) |
| `availability_type` | `enum` | `Ready`, `PreOrder` | Status ketersediaan barang (Default: `Ready`) |
| `preorder_duration_days`| `smallint unsigned`| Nullable | Estimasi hari pengerjaan jika `PreOrder` (misal: 3 hari) |
| `is_best_seller` | `boolean` | Default: `false`, Index | Penanda produk Best Seller pilihan toko |
| `location_city` | `string(100)` | Not Null, Index | Kota lokasi produk dikirim (sinkron/override dari toko) |
| `weight_grams` | `integer unsigned` | Not Null | Berat satuan (gram) untuk kalkulasi ekspedisi |
| `length_cm` | `smallint unsigned`| Default: `10` | Panjang paket (cm) untuk volumetrik Paxel/Lalamove |
| `width_cm` | `smallint unsigned`| Default: `10` | Lebar paket (cm) |
| `height_cm` | `smallint unsigned`| Default: `10` | Tinggi paket (cm) |
| `rating_avg` | `decimal(3,2)` | Default: `0.00`, Index | Rata-rata bintang ulasan produk |
| `reviews_count` | `integer unsigned` | Default: `0` | Jumlah ulasan produk |
| `sold_count` | `integer unsigned` | Default: `0`, Index | Jumlah unit terjual (untuk sorting terlaris & KPI) |
| `views_count` | `bigint unsigned` | Default: `0` | Jumlah kunjungan halaman produk (metrik konversi KPI) |
| `is_active` | `boolean` | Default: `true`, Index | Status produk aktif/diarsipkan |
| `timestamps` | `timestamp` | `created_at`, `updated_at`, `deleted_at` | Waktu audit & soft deletes |

*Tabel `product_images`:* `id`, `product_id` (FK), `image_path` (`string(255)`), `is_primary` (`boolean`), `sort_order` (`tinyint`), `timestamps`.

##### 3. `scheduled_discounts` & `scheduled_discount_product` (Modul Diskon Hari Tertentu)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key program diskon hari tertentu |
| `store_id` | `bigint unsigned` | FK (`stores.id`), Nullable | `null` = kampanye global Kossuma, terisi = khusus 1 toko |
| `created_by` | `bigint unsigned` | FK (`users.id`) | Pembuat program diskon |
| `name` | `string(150)` | Not Null | Nama kampanye (misal: *Promo Jumat Berkah UMKM*) |
| `slug` | `string(170)` | Unique, Not Null | Slug kampanye |
| `discount_type` | `enum` | `Percentage`, `FixedAmount` | Jenis potongan harga |
| `discount_value` | `bigint unsigned` | Not Null | Nilai persen (1-99) atau nominal Rupiah |
| `max_discount_amount` | `bigint unsigned` | Nullable | Batas potongan maksimum jika `Percentage` |
| `applicable_days` | `json` | Not Null | Array hari aktif dalam seminggu (misal: `["Friday"]` atau `["Saturday","Sunday"]`) |
| `specific_dates` | `json` | Nullable | Opsional tanggal khusus (misal: `["2026-11-25"]`) |
| `start_time` | `time` | Default: `'00:00:00'` | Jam mulai aktif pada hari tersebut |
| `end_time` | `time` | Default: `'23:59:59'` | Jam selesai aktif pada hari tersebut |
| `starts_at` | `timestamp` | Not Null, Index | Tanggal mulai periode kampanye |
| `ends_at` | `timestamp` | Not Null, Index | Tanggal berakhir periode kampanye |
| `funded_by` | `enum` | `HeadOffice`, `Store` | Penanggung beban subsidi diskon pada laporan keuangan |
| `is_active` | `boolean` | Default: `true` | Status keaktifan kampanye |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

*Tabel Pivot `scheduled_discount_product`:* `id`, `scheduled_discount_id` (FK), `product_id` (FK), `quota_limit` (`int`, nullable), `sold_count` (`int`, default `0`).

##### 4. `vouchers` & `voucher_usages` (Modul Voucher)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key voucher |
| `store_id` | `bigint unsigned` | FK (`stores.id`), Nullable | `null` = berlaku seluruh UMKM Kossuma, terisi = khusus toko |
| `code` | `string(40)` | Unique, Not Null | Kode unik voucher (misal: `KOSSUMAHEMAT`) |
| `name` | `string(150)` | Not Null | Judul voucher |
| `target_type` | `enum` | `ProductPrice`, `ShippingCost` | Potongan harga barang atau potongan ongkir |
| `discount_type` | `enum` | `Percentage`, `FixedAmount` | Tipe kalkulasi potongan |
| `discount_value` | `bigint unsigned` | Not Null | Nilai potongan (% atau Rupiah) |
| `min_purchase_amount` | `bigint unsigned` | Default: `0` | Minimal belanja untuk memakai voucher |
| `max_discount_amount` | `bigint unsigned` | Nullable | Potongan maksimal dalam Rupiah |
| `applicable_days` | `json` | Nullable | Hari tertentu voucher bisa dipakai (null = setiap hari) |
| `usage_limit` | `integer unsigned` | Nullable | Kuota total pemakaian |
| `used_count` | `integer unsigned` | Default: `0` | Jumlah voucher yang telah terpakai |
| `per_user_limit` | `smallint unsigned`| Default: `1` | Batas pemakaian per akun customer |
| `funded_by` | `enum` | `HeadOffice`, `Store` | Penanggung subsidi voucher di laporan keuangan |
| `starts_at` | `timestamp` | Not Null | Waktu mulai berlaku |
| `expires_at` | `timestamp` | Not Null | Waktu kedaluwarsa |
| `is_active` | `boolean` | Default: `true` | Status aktif voucher |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

---

#### C. Cart, Order, Payment (Midtrans), & Shipping (Paxel/Lalamove/GoSend) Modules

##### 1. `carts` & `cart_items` (Modul Cart)
| Tabel | Kolom Kunci | Tipe Data & Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `carts` | `id`, `user_id`, `voucher_id`, `timestamps` | BigInt PK, FK Unique (`users.id`), FK Nullable (`vouchers.id`) | Keranjang aktif milik customer |
| `cart_items` | `id`, `cart_id`, `product_id`, `quantity`, `is_selected`, `timestamps` | BigInt PK, FK (`carts.id`), FK (`products.id`), Int, Boolean | Item produk di keranjang beserta centang checkout |

##### 2. `orders` (Modul Order - Invoice Pembayaran Induk Midtrans)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key order induk |
| `invoice_number` | `string(50)` | Unique, Not Null | Nomor invoice pembayaran (misal: `INV/20261112/KSM-00001`) |
| `user_id` | `bigint unsigned` | FK (`users.id`), Index | Customer pembeli |
| `shipping_address_snapshot`| `json` | Not Null | Snapshot lengkap alamat & koordinat penerima saat checkout |
| `subtotal_amount` | `bigint unsigned` | Not Null | Total harga barang sebelum diskon voucher |
| `scheduled_discount_amount`| `bigint unsigned` | Default: `0` | Total potongan dari Diskon Hari Tertentu |
| `voucher_discount_amount`| `bigint unsigned` | Default: `0` | Total potongan dari kode Voucher |
| `total_shipping_amount` | `bigint unsigned` | Not Null | Total ongkos kirim seluruh toko pada checkout ini |
| `grand_total_amount` | `bigint unsigned` | Not Null | Nominal akhir yang ditagihkan ke Midtrans (`gross_amount`) |
| `voucher_id` | `bigint unsigned` | FK (`vouchers.id`), Nullable | Referensi voucher yang digunakan |
| `voucher_code_snapshot` | `string(40)` | Nullable | Kode voucher saat transaksi |
| `payment_status` | `enum` | `Pending`, `Paid`, `Failed`, `Expired`, `Refunded` | Status pembayaran Midtrans |
| `payment_method` | `string(50)` | Nullable | Metode bayar (misal: `qris`, `bca_va`, `gopay`) |
| `midtrans_transaction_id`| `string(100)` | Nullable, Index | `transaction_id` dari payload Midtrans |
| `midtrans_snap_token` | `string(255)` | Nullable | Token untuk merender Midtrans Snap |
| `paid_at` | `timestamp` | Nullable, Index | Waktu pembayaran lunas (`settlement`) |
| `payment_expired_at` | `timestamp` | Not Null | Batas waktu pembayaran sebelum auto-cancel |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

##### 3. `store_orders` (Modul Fulfillment & Sub-Order per Toko UMKM)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key pesanan per toko |
| `order_id` | `bigint unsigned` | FK (`orders.id`), Index | Link ke Invoice Induk |
| `store_id` | `bigint unsigned` | FK (`stores.id`), Index | Toko UMKM yang memproses pesanan |
| `user_id` | `bigint unsigned` | FK (`users.id`), Index | Customer pemilik pesanan |
| `store_order_number` | `string(50)` | Unique, Not Null | Nomor pesanan toko (`SO/20261112/UMKM-00001`) |
| `status` | `enum` | `AwaitingPayment`, `Processing`, `ReadyToShip`, `Shipped`, `Delivered`, `Completed`, `ReturnRequested`, `Returned`, `Cancelled` | Siklus hidup pesanan per toko |
| `contains_preorder` | `boolean` | Default: `false` | Penanda apakah sub-order berisi item Pre-Order |
| `estimated_ship_date` | `date` | Nullable | Batas tanggal pengiriman (dihitung dari durasi PO) |
| `courier_provider` | `enum` | `Paxel`, `Lalamove`, `GoSend` | Mitra ekspedisi yang dipilih customer |
| `courier_service_code` | `string(60)` | Not Null | Jenis layanan (misal: `SAMEDAY`, `INSTANT`, `MOTORCYCLE`) |
| `courier_service_name` | `string(100)` | Not Null | Nama tampilan layanan kurir |
| `shipping_cost` | `bigint unsigned` | Not Null | Tarif ongkir untuk toko ini (Rupiah) |
| `shipping_booking_id` | `string(100)` | Nullable, Index | Order ID / Booking ID dari API Paxel/Lalamove/GoSend |
| `tracking_number` | `string(100)` | Nullable, Index | Nomor resi / AWB pengiriman |
| `tracking_url` | `string(500)` | Nullable | Live tracking URL kurir instan (Lalamove/GoSend) |
| `driver_info` | `json` | Nullable | Informasi nama, telepon, & plat nomor kurir |
| `subtotal_amount` | `bigint unsigned` | Not Null | Subtotal produk di toko ini |
| `store_discount_amount`| `bigint unsigned` | Default: `0` | Beban diskon yang ditanggung toko |
| `platform_subsidy_amount`| `bigint unsigned`| Default: `0` | Subsidi promo/voucher yang ditanggung Head of Office |
| `platform_fee_amount` | `bigint unsigned` | Default: `0` | Potongan komisi/biaya layanan untuk Head of Office |
| `net_seller_amount` | `bigint unsigned` | Not Null | Pendapatan bersih yang akan masuk ke saldo toko |
| `processing_at` | `timestamp` | Nullable | Waktu masuk proses toko (untuk KPI kecepatan proses) |
| `shipped_at` | `timestamp` | Nullable | Waktu barang diserahkan ke kurir |
| `delivered_at` | `timestamp` | Nullable | Waktu barang tiba di customer |
| `auto_complete_at` | `timestamp` | Nullable, Index | Waktu penyelesaian otomatis jika tanpa komplain (H+2 dari delivered) |
| `completed_at` | `timestamp` | Nullable, Index | Waktu pesanan selesai & dana cair ke saldo toko |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

##### 4. `order_items` & `order_tracking_logs`
| Tabel | Kolom Kunci | Tipe Data & Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `order_items` | `id`, `store_order_id`, `product_id`, `product_name_snapshot`, `product_image_snapshot`, `availability_type_snapshot`, `preorder_days_snapshot`, `base_unit_price`, `discount_per_unit`, `final_unit_price`, `quantity`, `row_total`, `weight_grams` | BigInt PK, FK, String, Enum (`Ready`, `PreOrder`), BigInt, Int | Detail baris produk yang dibeli dengan snapshot harga saat transaksi |
| `order_tracking_logs` | `id`, `store_order_id`, `status_code`, `title`, `description`, `courier_location`, `proof_image_url`, `logged_at`, `raw_payload` | BigInt PK, FK (`store_orders.id`), String, Text, Timestamp, JSON | Riwayat perjalanan paket dari webhook Paxel/Lalamove/GoSend |

---

#### D. Return, Review, Chat, & Financial Ledger Modules

##### 1. `return_requests` & `return_request_items` (Modul ReturnOrder)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key pengajuan retur |
| `return_number` | `string(50)` | Unique, Not Null | Nomor tiket retur (`RET/20261112/0001`) |
| `store_order_id` | `bigint unsigned` | FK (`store_orders.id`), Index | Pesanan toko yang diretur |
| `store_id` | `bigint unsigned` | FK (`stores.id`), Index | Toko UMKM terkait |
| `user_id` | `bigint unsigned` | FK (`users.id`), Index | Customer pengaju retur |
| `reason_category` | `enum` | `Damaged`, `WrongItem`, `Incomplete`, `ExpiredOrSpoiled`, `NotAsDescribed` | Kategori alasan barang bermasalah |
| `resolution_type` | `enum` | `Refund`, `Exchange` | Solusi yang diminta (Pengembalian Dana / Tukar Barang) |
| `status` | `enum` | `Requested`, `ApprovedBySeller`, `RejectedBySeller`, `EscalatedToAdmin`, `ReturnShipped`, `Refunded`, `Exchanged`, `Closed` | Status penyelesaian retur |
| `customer_description` | `text` | Not Null | Kronologi kendala dari customer |
| `evidence_files` | `json` | Not Null | Array path foto/video bukti unboxing barang bermasalah |
| `seller_response_notes`| `text` | Nullable | Tanggapan dari pihak toko UMKM |
| `admin_decision_notes` | `text` | Nullable | Keputusan final dari Head of Office Kossuma |
| `resolved_by` | `bigint unsigned` | FK (`users.id`), Nullable | User yang menyelesaikan sengketa |
| `refund_amount` | `bigint unsigned` | Default: `0` | Nominal dana yang dikembalikan ke customer |
| `return_courier_name` | `string(60)` | Nullable | Ekspedisi pengembalian barang |
| `return_tracking_number`| `string(100)` | Nullable | Nomor resi pengiriman balik |
| `resolved_at` | `timestamp` | Nullable | Waktu kasus retur ditutup/selesai |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

##### 2. `product_reviews` (Modul Review)
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `bigint unsigned` | PK, Auto Increment | Primary Key ulasan |
| `store_order_id` | `bigint unsigned` | FK (`store_orders.id`) | Pesanan sumber penilaian |
| `order_item_id` | `bigint unsigned` | FK (`order_items.id`), Unique | 1 baris item pesanan = 1 penilaian |
| `product_id` | `bigint unsigned` | FK (`products.id`), Index | Produk yang dinilai |
| `store_id` | `bigint unsigned` | FK (`stores.id`), Index | Toko UMKM yang dinilai |
| `user_id` | `bigint unsigned` | FK (`users.id`) | Customer pemberi nilai |
| `rating` | `tinyint unsigned`| Not Null (`1` s/d `5`) | Nilai bintang kepuasan pelanggan |
| `comment` | `text` | Nullable | Komentar ulasan kualitas produk & layanan |
| `photos` | `json` | Nullable | Foto produk yang diterima customer |
| `seller_reply` | `text` | Nullable | Balasan dari toko UMKM |
| `replied_at` | `timestamp` | Nullable | Waktu toko membalas ulasan |
| `timestamps` | `timestamp` | `created_at`, `updated_at` | Waktu audit |

##### 3. `conversations` & `messages` (Modul Chat)
| Tabel | Kolom Kunci | Tipe Data & Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `conversations` | `id`, `channel_type`, `customer_id`, `store_id`, `store_order_id`, `last_message_preview`, `last_message_at`, `customer_unread_count`, `store_unread_count`, `admin_unread_count` | BigInt PK, Enum (`CustomerToStore`, `StoreToHeadOffice`), FK Nullable (`users.id`), FK (`stores.id`), FK Nullable (`store_orders.id`), Int | Ruang percakapan dua arah (Customer <-> Toko atau Toko <-> Head of Office) |
| `messages` | `id`, `conversation_id`, `sender_id`, `sender_role`, `body`, `attachment_path`, `attached_product_id`, `read_at`, `timestamps` | BigInt PK, FK (`conversations.id`), FK (`users.id`), Enum, Text, String Nullable, Timestamp | Butir pesan teks, foto, maupun tautan produk/pesanan |

##### 4. `financial_ledgers` & `payouts` (Modul Finance)
| Tabel | Kolom Kunci | Tipe Data & Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `financial_ledgers` | `id`, `store_id`, `store_order_id`, `return_request_id`, `payout_id`, `entry_type`, `category`, `amount`, `balance_after`, `description`, `reference_number`, `recorded_at` | BigInt PK, FK Nullable (`stores.id`), Enum (`Credit`, `Debit`), Enum (`PaymentReceived`, `EscrowRelease`, `PlatformCommission`, `VoucherSubsidy`, `ShippingFee`, `RefundReversed`, `StorePayout`), BigInt | Buku besar akuntansi *double-track* untuk laporan keuangan toko & laporan komprehensif Head of Office |
| `payouts` | `id`, `payout_number`, `store_id`, `requested_by`, `processed_by`, `amount`, `bank_name`, `account_number`, `account_holder_name`, `status`, `transfer_proof_path`, `rejection_reason`, `processed_at`, `timestamps` | BigInt PK, Unique String, FK (`stores.id`), BigInt, Enum (`Pending`, `Approved`, `Transferred`, `Rejected`) | Pencairan saldo penghasilan toko UMKM ke rekening bank |

---

## 3. File Naming & Organization Convention

Setiap modul mengikuti pola penamaan konsisten di seluruh layer aplikasi:

| Layer | Path Pattern | Contoh (Modul Product / Order / Finance) |
| :--- | :--- | :--- |
| Controller | `app/Http/Controllers/{Module}/` | `ProductController.php`, `SellerOrderController.php`, `AdminFinanceController.php` |
| Model | `app/Models/{Module}/` | `Product.php`, `StoreOrder.php`, `FinancialLedger.php` |
| Enum | `app/Enums/{Module}/` | `AvailabilityType.php`, `StoreOrderStatus.php`, `CourierProvider.php` |
| Service Interface | `app/Contracts/{Module}/` | `ProductServiceInterface.php`, `CheckoutServiceInterface.php`, `ShippingProviderInterface.php` |
| Service | `app/Services/{Module}/` | `ProductService.php`, `CheckoutService.php`, `MidtransService.php`, `PaxelShippingDriver.php` |
| Policy | `app/Policies/{Module}/` | `ProductPolicy.php`, `StoreOrderPolicy.php`, `ReturnRequestPolicy.php` |
| Form Request | `app/Http/Requests/{Module}/` | `StoreProductRequest.php`, `CreateCheckoutRequest.php`, `SubmitReturnRequest.php` |
| Notification | `app/Notifications/{Module}/` | `OrderPaidNotification.php`, `ReturnEscalatedNotification.php` |
| Observer | `app/Observers/{Module}/` | `ProductReviewObserver.php`, `StoreOrderObserver.php` |
| Factory | `database/factories/{Module}/` | `ProductFactory.php`, `StoreFactory.php`, `StoreOrderFactory.php` |
| Seeder | `database/seeders/{Module}/` | `CategorySeeder.php`, `StoreSeeder.php`, `ProductSeeder.php` |
| Page | `resources/js/pages/{gate}/{module}/` | `resources/js/pages/seller/products/index.tsx`, `resources/js/pages/admin/finance/index.tsx` |
| Local Component | `resources/js/pages/{gate}/{module}/components/` | `product-form.tsx`, `store-kpi-ranking-table.tsx`, `order-tracking-timeline.tsx` |
| Types | `resources/js/pages/{gate}/{module}/` | `types.ts` |

---

## 4. Technical Business Logic Implementation

### 4.1. Pricing Priority & Scheduled Day Discount Engine (Modul Product & Promotion)
- **Rule:** Harga jual efektif produk (`effective_price`) dihitung secara deterministik pada `PricingEngineService` dengan urutan prioritas:
  1. **Diskon Hari Tertentu (`ScheduledDiscount`):** Mengecek apakah ada kampanye aktif di mana tanggal hari ini berada dalam rentang `starts_at` s/d `ends_at`, nama hari saat ini (`Carbon::now()->format('l')`) termasuk dalam `applicable_days` (atau `specific_dates`), jam saat ini berada di antara `start_time` dan `end_time`, serta kuota belum habis.
  2. **Diskon Langsung Toko (`products.discount_price`):** Jika tidak ada diskon hari tertentu yang lebih besar, gunakan `discount_price` produk apabila periode `discount_starts_at` dan `discount_ends_at` masih berlaku.
  3. **Harga Dasar (`products.base_price`):** Digunakan bila tidak ada promo aktif.
- **Pencatatan Subsidi:** Saat checkout terjadi, selisih harga dicatat apakah ditanggung oleh `HeadOffice` atau `Store` (`funded_by`) sehingga laporan keuangan Head of Office dan Toko tidak selisih.
- **Implementasi:** `app/Services/Promotion/PricingEngineService.php` & `app/Services/Promotion/VoucherValidatorService.php`.

### 4.2. Multi-Store Atomic Checkout, Stock Locking, & Midtrans Snap (Modul Order & Payment)
- **Pemecahan Sub-Order per Toko (`Order` -> `StoreOrder`):**
  - Saat Customer menekan tombol Checkout, `CheckoutService` mengelompokkan item keranjang berdasarkan `store_id`.
  - Di dalam `DB::transaction()`, seluruh baris produk yang dibeli di-lock menggunakan `Product::whereIn('id', $ids)->lockForUpdate()->get()` untuk memverifikasi kecukupan stok secara atomik.
  - Stok langsung dikurangi (`decrement('stock', $qty)`) untuk mengamankan barang selama masa tunggu bayar (`payment_expired_at` = 24 jam).
  - Jika suatu `StoreOrder` mengandung produk dengan `availability_type = PreOrder`, kolom `contains_preorder` diset `true` dan `estimated_ship_date` dihitung dari `max(preorder_duration_days)` produk di dalam toko tersebut.
- **Integrasi Pembayaran Midtrans & Idempotent Webhook:**
  - `MidtransService` memanggil Snap API dengan `order_id = $order->invoice_number` dan `gross_amount = $order->grand_total_amount`.
  - Saat Midtrans mengirim webhook ke `POST /api/webhooks/midtrans`:
    1. Verifikasi signature: `hash('sha512', $orderId . $statusCode . $grossAmount . config('services.midtrans.server_key')) === $signatureKey`.
    2. Lock baris `Order` (`lockForUpdate()`). Jika status sudah `Paid`, segera return `200 OK` (*idempotency guard*).
    3. Jika `transaction_status` adalah `settlement` atau `capture`: ubah `orders.payment_status = Paid`, ubah seluruh `store_orders.status = Processing`, tambahkan dana ke `stores.escrow_balance`, dan catat entri `PaymentReceived` pada `financial_ledgers`.
    4. Jika `expire`, `cancel`, atau `deny`: ubah status menjadi `Expired`/`Cancelled`, dan kembalikan stok produk (`increment('stock', $qty)`) serta kuota voucher secara atomik.
- **Implementasi:** `app/Services/Order/CheckoutService.php`, `app/Services/Payment/MidtransService.php`.

### 4.3. Multi-Courier Shipping Aggregator: Paxel, Lalamove, & GoSend (Modul Shipping)
- **Unified Adapter Pattern:**
  - `ShippingAggregatorService` mengelola 3 driver kurir yang mengimplementasikan `ShippingProviderInterface`:
    1. `PaxelShippingDriver`: Mengirim titik koordinat/kode pos asal toko (`stores.postal_code`, `latitude`, `longitude`), tujuan customer (`user_addresses`), serta berat (`weight_grams`) dan dimensi volumetrik (`length_cm`, `width_cm`, `height_cm`) untuk mendapatkan tarif *Sameday / Nextday / Frozen*.
    2. `LalamoveShippingDriver`: Menggunakan HMAC-SHA256 signature untuk meminta *Quotation* dari koordinat toko ke koordinat customer dengan armada `MOTORCYCLE`, `SEDAN`, atau `VAN`.
    3. `GoSendShippingDriver`: Menghitung jarak koordinat titik jemput toko ke alamat customer untuk layanan `Instant` dan `SameDay`.
- **Pickup Booking & Tracking Synchronization:**
  - Ketika Toko UMKM mengklik **"Request Pickup"** pada halaman `store-panel/orders`, `ShippingAggregatorService::bookPickup($storeOrder)` memanggil API ekspedisi terkait, menyimpan `tracking_number` dan `tracking_url`, serta mengubah status menjadi `ReadyToShip`.
  - Webhook ekspedisi (`POST /api/webhooks/shipping/{provider}`) memetakan status kurir ke `order_tracking_logs` dan mengupdate status `StoreOrder` otomatis (`Shipped` saat kurir mengambil barang, `Delivered` saat tiba di tujuan).
- **Implementasi:** `app/Services/Shipping/ShippingAggregatorService.php`, `app/Services/Shipping/Drivers/{PaxelDriver,LalamoveDriver,GoSendDriver}.php`.

### 4.4. Escrow Protection, Return Resolution, & Financial Settlement (Modul ReturnOrder & Finance)
- **Penahanan Dana Escrow:**
  - Selama pesanan berstatus `Processing`, `Shipped`, atau `Delivered`, dana bersih milik toko (`net_seller_amount`) berada di `stores.escrow_balance` dan belum bisa ditarik (*withdraw*).
- **Alur Return Barang Bermasalah:**
  - Ketika status `Delivered`, Customer memiliki jendela waktu sebelum `auto_complete_at` untuk mengajukan Return (`ReturnRequest`) beserta foto/video bukti (`evidence_files`).
  - Saat retur diajukan, status `StoreOrder` berubah menjadi `ReturnRequested`, membekukan timer penyelesaian otomatis.
  - Toko UMKM dapat menyetujui (`ApprovedBySeller`) atau menolak/mengajukan mediasi (`EscalatedToAdmin`).
  - **Head of Office** memiliki otoritas resolusi final:
    - Jika diputuskan **Refund ke Customer**, dana ditarik dari `stores.escrow_balance`, dicatat sebagai `RefundReversed` di `financial_ledgers`, dan dikembalikan ke Customer.
    - Jika klaim retur ditolak atau selesai ditukar (`Exchanged`/`Completed`), dana dilepas dari `escrow_balance` ke `wallet_balance` toko (`EscrowRelease`).
- **Implementasi:** `app/Services/ReturnOrder/ReturnResolutionService.php`, `app/Services/Finance/LedgerService.php`.

### 4.5. Store KPI Scoring & Crowd Analytics (Modul Dashboard Head of Office)
- **Rule:** Head of Office membutuhkan visibilitas objektif mengenai toko UMKM mana yang **paling ramai** (*Top Performing*) dan mana yang **sepi / tidak aktif** (*Underperforming / Needs Coaching*).
- **Rumus & Agregasi KPI (`StoreKpiAnalyticsService`):**
  - Mengagregasi performa setiap toko dalam rentang waktu terpilih (`7d`, `30d`, `90d`, `custom`):
    1. **GMV & Order Volume:** Total nilai penjualan kotor dan jumlah `StoreOrder` selesai.
    2. **Conversion Rate (%):** `(Total Sold Items / max(Total Product Views, 1)) * 100`.
    3. **Fulfillment SLA (Jam):** Rata-rata selisih waktu antara `processing_at` hingga `shipped_at`.
    4. **Issue / Return Rate (%):** `(Jumlah ReturnRequested / Total Pesanan) * 100`.
    5. **Customer Rating:** Rata-rata nilai ulasan bintang (`rating_avg`).
  - Mengklasifikasikan toko ke dalam 4 tier status KPI:
    - `TopPerformer` (Ramai & Rating >= 4.5)
    - `Growing` (Stabil / Bertumbuh)
    - `Underperforming` (Sepi pesanan / 0 transaksi dalam 14 hari terakhir)
    - `AtRisk` (Tingkat retur > 5% atau keterlambatan pengiriman tinggi)
- **Implementasi:** `app/Services/Dashboard/StoreKpiAnalyticsService.php`.

---

## 5. Security & Defense-in-Depth

### 5.1. Store Ownership Isolation & IDOR Prevention via Form Requests & Policies
Seorang `Seller` (Toko UMKM) **dilarang keras** melihat, mengedit, atau memproses produk, pesanan, chat, maupun laporan keuangan milik toko UMKM lain. Setiap Form Request dan Policy wajib memverifikasi kepemilikan `store_id`:

```php
namespace App\Http\Requests\Product;

use App\Enums\User\UserRole;
use App\Models\Product\Product;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Product $product */
        $product = $this->route('product');
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        if ($user->role === UserRole::HeadOffice) {
            return true;
        }

        return $user->role === UserRole::Seller
            && $user->store?->id === $product->store_id;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:200'],
            'base_price' => ['required', 'integer', 'min:100'],
            'discount_price' => ['nullable', 'integer', 'lt:base_price'],
            'stock' => ['required', 'integer', 'min:0'],
            'availability_type' => ['required', 'string', 'in:Ready,PreOrder'],
            'preorder_duration_days' => ['nullable', 'required_if:availability_type,PreOrder', 'integer', 'min:1', 'max:90'],
            'is_best_seller' => ['required', 'boolean'],
            'location_city' => ['required', 'string', 'max:100'],
            'weight_grams' => ['required', 'integer', 'min:1'],
        ];
    }
}
```

### 5.2. Webhook Signature Verification & Price Tampering Prevention
- **Zero Trust Client Pricing:** Request Checkout dari frontend **hanya** boleh mengirimkan `cart_item_ids`, `address_id`, `voucher_code`, dan pilihan `courier_Selection` per `store_id`. Seluruh harga produk, diskon hari tertentu, potongan voucher, dan tarif ongkos kirim **wajib dihitung ulang di sisi server** sebelum dikirim ke Midtrans.
- **Midtrans & Courier Webhook Verification:** Setiap request ke `/api/webhooks/midtrans` dan `/api/webhooks/shipping/{provider}` wajib divalidasi melalui middleware khusus (`VerifyMidtransSignature`, `VerifyCourierWebhookSignature`) yang menolak request palsu dengan HTTP `403 Forbidden`.

---

## 6. Verification & Automated Test Specifications

Strategi pengujian mengikuti panduan **Pest v5** di [AGENTS.md](AGENTS.md):
- Buat pengujian fitur menggunakan Pest: `php artisan make:test --pest {Name}Test` (tanpa menyertakan prefix `Feature/`).
- Gunakan `Http::fake()` untuk mensimulasikan respons API Midtrans, Paxel, Lalamove, dan GoSend pada saat pengujian otomatis.
- Uji skenario bisnis utama (*happy paths*), batas otorisasi antar-toko (*IDOR failure paths*), dan *edge cases* (stok habis saat checkout bersamaan, webhook duplikat, diskon hari tertentu di luar jam aktif).
- Jalankan test terfokus: `php artisan test --compact --filter={Name}Test`.
- Jalankan Pint formatter setiap selesai memodifikasi file PHP: `vendor/bin/pint --dirty --format agent`.

---

## 7. Frontend Conventions, Theme Tokens (`#7D3394`), & Component File Naming

1. **Brand Color `#7D3394` & Theme Tokens (`resources/css/app.css`):**
   - Konfigurasikan variabel CSS utama Tailwind v4 agar warna aksen `#7D3394` digunakan secara konsisten pada komponen utama (`bg-primary`, `text-primary`, `border-primary`, `ring-primary`):
     - Primary Base: `#7D3394`
     - Primary Hover: `#632676`
     - Primary Soft Surface: `#F9F5FB`
     - Primary Border Accent: `#E5CEF0`
2. **Lowercase / Kebab-case Filenames for Components, Pages, & Hooks:**
   - Seluruh berkas komponen pembantu (`resources/js/components/**/*.tsx` dan `resources/js/pages/**/components/*.tsx`), halaman Inertia (`resources/js/pages/**/*.tsx`), dan custom hooks (`resources/js/hooks/*.ts`) **WAJIB menggunakan format lowercase / kebab-case**.
   - Contoh: `product-card.tsx`, `scheduled-discount-banner.tsx`, `store-kpi-leaderboard.tsx`, `order-tracking-stepper.tsx`, `use-shipping-rates.ts`.
3. **UI Component Variants:**
   - Komponen `Badge` mendukung varian status semantik marketplace: `default` (ungu `#7D3394`), `secondary`, `destructive`, `outline`, `success` (Ready Stock / Lunas), dan `warning` (Pre-Order / Menunggu Bayar / Retur).
4. **Inertia Empty Array Serialization (SSR Bug Prevention):**
   - Di PHP/Laravel, array asosiatif kosong (`[]`) di-serialize menjadi JSON array (`[]`), bukan JSON object (`{}`).
   - Selalu normalisasi prop filter pada halaman katalog, pesanan, dan laporan keuangan:
     ```tsx
     const safeFilters = Array.isArray(filters) ? {} : filters;
     ```

---

## 8. Standar Arsitektur Modul Emas (Gold Standard Architecture)

Seluruh modul fitur pada **Kossuma Marketplace** (`Store`, `Product`, `Promotion`, `Order`, `ReturnOrder`, `Finance`, `Dashboard`) **WAJIB** mematuhi pola arsitektur *Gold Standard* di bawah ini:

### 8.1. Standar Backend (Skinny Controller & Rich Encapsulated Service)

```
┌────────────────────────────────────────────────────────┐
│                   Skinny Controller                    │
│  - Gate::authorize()                                   │
│  - Form Request Validation ($request->validated())     │
│  - Filter Forwarding ($request->only([...]))           │
│  - Delegasi 100% ke Service Layer                      │
│  - Response Delivery (Inertia::render / Download / to_route)
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                Rich Encapsulated Service               │
│  - app/Contracts/[Module]/[Module]ServiceInterface     │
│  - CRUD & Checkout Transactional (DB::transaction)     │
│  - Private DRY Query Builder (buildQuery)              │
│  - Agregasi Efisien: loadCount / withSum               │
│  - Column-Scoped Eager Loading: with(['store:id,name'])│
│  - Statistik & Option Select: getStats(), getOptions() │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Dedicated Financial & KPI Export Service     │
│  - Sync Stream: streamDownload() untuk CSV instan      │
│  - Async Queue: ExportJob + Notification (XLSX/PDF)    │
│  - DRY Helper: prepareExportData()                     │
│  - N+1 Prevention: mapping via withSum / withCount     │
└────────────────────────────────────────────────────────┘
```

1. **Skinny Controller Pattern:**
   - Controller dilarang keras memanggil query langsung ke model Eloquent (seperti `Product::where()`, `StoreOrder::count()`, atau `FinancialLedger::sum()`) maupun manipulasi kalkulasi di dalam method controller.
   - Seluruh filtering request diambil via `$request->only(['search', 'category_id', 'store_id', 'availability_type', 'is_best_seller', 'on_discount', 'min_price', 'max_price', 'city', 'sort', 'direction'])` dan diteruskan langsung ke Service.

2. **Rich & Encapsulated Service Layer:**
   - Setiap modul wajib memiliki kontrak Interface di `app/Contracts/[Module]/` dan kelas implementasi di `app/Services/[Module]/`.
   - **Private Query Builder (DRY):** Wajib mengekstrak helper privat `buildQuery(array $filters = []): Builder` untuk digunakan bersama oleh pagination (`getPaginated()`), ringkasan metrik (`getStats()`), dan ekspor laporan (`getForExport()`).
   - **Optimasi Query Agregasi:** Gunakan `withCount()` dan `withSum()` (misal: `$store->loadCount(['products', 'storeOrders'])->loadSum('storeOrders as total_gmv', 'subtotal_amount')`) untuk mengeksekusi agregasi dalam satu query efisien.
   - **Column-Scoped Eager Loading:** Batasi transfer kolom dengan scoping relasi: `with(['store:id,name,slug,city_name', 'category:id,name,slug', 'primaryImage:id,product_id,image_path'])`.
   - **Strict Return Types:** Wajib mendeklarasikan return type eksplisit pada setiap method (`LengthAwarePaginator`, `Collection`, `array`, `bool`, `Model`).

---

### 8.2. Standar Frontend (Modular React 19 / Inertia v3 / Kossuma Brand UI)

1. **Wayfinder Typed Routing:**
   - Seluruh navigasi `<Link>`, pemanggilan aksi form, dan redirect wajib mengimpor fungsi route/action dari `@/actions/...` atau `@/routes/...`. Dilarang keras menggunakan string URL hardcoded.
2. **Modular Component Architecture:**
   Setiap modul halaman pengelolaan (`seller/*` dan `admin/*`) maupun katalog (`storefront/*`) dipecah menjadi sub-komponen terisolasi di dalam folder `components/` modul terkait:
   - `[module]-index-toolbar.tsx`: Toolbar pencarian, filter kategori/status/tanggal, dan tombol ekspor laporan.
   - `[module]-stat-cards.tsx`: Kartu ringkasan metrik dengan aksen `#7D3394`.
   - `[module]-table.tsx`: Tabel data interaktif dengan sorting kolom, badge status (`Ready`, `Pre-Order`, `Best Seller`, `Diskon`), dan menu aksi.
   - `[module]-form.tsx`: Form input modular untuk mode create dan edit.
   - `[module]-detail-view.tsx`: Tampilan detail lengkap (misal: rincian sub-order, bukti retur, dan log tracking kurir).

---

### 8.3. Standar Arsitektur Dashboard & Portal: Pemisahan 3 Peran Utama

Berdasarkan batasan hak akses resmi pada [PRD.md](PRD.md), arsitektur pusat kendali dipisahkan menjadi 3 portal tersendiri:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                     PUSAT KOMANDO KOSSUMA MARKETPLACE BERBASIS PERAN                     │
├────────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ 1. HEAD OF OFFICE (ADMIN)  │ 2. TOKO UMKM (SELLER)       │ 3. CUSTOMER (BUYER)           │
│    (Ecosystem & KPI Hub)   │    (Store Operations)       │    (Storefront & Order Hub)   │
├────────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ • Total GMV & Net Komisi   │ • Pesanan Baru & Pre-Order  │ • Katalog Kategori & Filter   │
│ • KPI Toko Paling Ramai    │ • Manajemen Produk & Stok   │ • Promo Diskon Hari Tertentu  │
│ • Deteksi Toko Sepi/Pasif  │ • Toggle Ready/PO/BestSeller│ • Keranjang & Multi-Alamat    │
│ • Laporan Keuangan Lengkap │ • Request Pickup Ekspedisi  │ • Ongkir Paxel/Lalamove/GoSend│
│ • Eskalasi Return & Payout │ • Laporan Keuangan Toko     │ • Pembayaran Aman Midtrans    │
│ • Chat ke Seluruh UMKM     │ • Chat Customer & HeadOffice│ • Live Tracking, Retur, Ulasan│
└────────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

#### 1. Dashboard Head of Office (`admin/dashboard` -> `HeadOfficeDashboardService`)
Head of Office Kossuma bertindak sebagai pengelola utama ekosistem UMKM:
- **`HeadOfficeDashboardService`:**
  - `calculateExecutiveSummary(array $dateRange)`: Kartu metrik utama:
    1. **Total GMV Ekosistem Kossuma** (`admin.finance.index`)
    2. **Pendapatan Komisi / Net Revenue Kossuma** (`admin.finance.index`)
    3. **Total Toko UMKM Aktif vs. Toko Pasif** (`admin.stores.index`)
    4. **Komplain / Return Menunggu Mediasi & Payout Pending** (`admin.returns.index`, `admin.payouts.index`)
  - `getStoreKpiLeaderboard(array $filters)`: Daftar peringkat **Toko Paling Ramai (*Top Performing*)** dan **Toko Paling Sepi (*Underperforming*)** lengkap dengan metrik jumlah pesanan, omzet, tingkat konversi, kecepatan pengiriman, dan rasio retur.
  - `getComprehensiveFinancialChart(array $dateRange)`: Grafik arus kas harian/bulanan (GMV, Ongkir, Subsidi Diskon Hari Tertentu, Subsidi Voucher, dan Refund).
- **Frontend Components (`resources/js/pages/admin/dashboard/components/`):**
  - `executive-kpi-stat-cards.tsx`: Kartu metrik utama dengan aksen `#7D3394`.
  - `store-crowd-leaderboard.tsx`: Tabel & visualisasi perbandingan toko UMKM teramai vs. toko sepi.
  - `financial-overview-chart.tsx`: Grafik keuangan komprehensif manajemen Kossuma.
  - `pending-escalations-widget.tsx`: Daftar pengajuan retur bermasalah dan permintaan pencairan dana toko yang memerlukan tindakan segera.

#### 2. Dashboard Toko UMKM (`store-panel/dashboard` -> `SellerDashboardService`)
Mitra Toko UMKM fokus pada kecepatan pelayanan pesanan, keakuratan stok, dan pertumbuhan penjualan tokonya:
- **`SellerDashboardService`:**
  - **Metrik Operasional Harian:** Pesanan Perlu Dikemas (`Processing`), Pesanan Pre-Order Berjalan, Pengajuan Retur Pelanggan, serta Saldo Siap Cair (`wallet_balance`) & Dana Ditahan (`escrow_balance`).
  - **Katalog Cepat:** Pintasan untuk mengubah stok, menandai produk **Best Seller**, mengubah status **Ready / Pre-Order**, dan mengatur harga diskon.
  - **Komunikasi Terpadu:** Notifikasi pesan belum dibaca dari **Customer** (terkait pesanan/produk) dan instruksi langsung dari **Head of Office Kossuma**.

#### 3. Storefront & Area Customer (`/` & `/orders` -> `StorefrontCatalogService` & `CustomerOrderService`)
Customer mendapatkan pengalaman belanja produk UMKM Kossuma yang cepat dan terpercaya:
- **Eksplorasi & Promo Otomatis:** Banner **Diskon Hari Tertentu** yang sedang berlangsung, navigasi kategori terurut, serta filter instan berdasarkan status *Ready Stock*, *Pre-Order*, *Best Seller*, rentang harga, dan lokasi toko.
- **Transparansi Logistik & Pembayaran:** Kalkulasi ongkir akurat dari lokasi toko UMKM ke koordinat alamat customer menggunakan **Paxel, Lalamove, dan GoSend**, pembayaran instan via **Midtrans**, timeline pelacakan kurir, kemudahan pengajuan retur jika barang bermasalah, dan pemberian ulasan saat pesanan selesai.
