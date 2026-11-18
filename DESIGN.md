# Design System — Kossuma Kota Bogor (`DESIGN.md`)

Dokumen ini merupakan *single source of truth* untuk sistem desain antarmuka pada aplikasi **Kossuma Kota Bogor** (Koperasi Usaha Persaudaraan Muslimah Kota Bogor — Belanja Kuliner Halal & Produk UMKM Lokal), disusun berdasarkan implementasi aktual di kode saat ini — mencakup area **Storefront/Katalog** (`/`, `/products/*`, `/about`, `/blog`), **Transaksi Pelanggan** (`/cart`, `/checkout`, `/checkout/payment`), dan **Autentikasi** (`/login`, `/register`, `/forgot-password`, dll.).

> **Aturan Eksekusi untuk AI Agent**: Saat merancang, membuat, mengaudit, atau merefaktor halaman/komponen UI, AI **wajib** membaca dokumen ini secara menyeluruh, mematuhi protokol di `.agents/rules/design-system.md`, serta memeriksa minimal satu file komponen acuan pada **Bab 7** sebelum menulis kode.

---

## 1. Filosofi Desain & Identitas Visual

Aplikasi ini menggunakan gaya **Clean & Seamless Community Marketplace** yang menggabungkan kanvas halaman terang yang tenang (`#F8F9FB`), kartu katalog produk *seamless* (tanpa bingkai/bayangan di sekeliling kartu sehingga foto dan teks langsung menyatu dengan latar belakang), serta kontainer transaksi putih bersih (`#FFFFFF`) yang mudah dipahami sekali lihat oleh semua kalangan pengguna, termasuk ibu rumah tangga dan pelaku UMKM.

- **Light-Mode First Clarity**: Seluruh halaman depan, transaksi, dan autentikasi mengutamakan permukaan terang (*light surface*) dengan kontras teks tinggi agar foto kuliner dan informasi harga tampil jernih serta menggugah selera.
- **Dual-Accent Visual Hierarchy**:
  - **Ungu Kossuma (`#7D3394` / `brand-600`) — Identitas Utama**: Digunakan untuk tombol aksi utama (CTA), tab kategori aktif, tautan interaktif, fokus input, kotak centang (*checkbox*), serta aksen lembut (`#F0E6F5` / `#E2C9EB`) pada penanda *pre-order* dan informasi toko UMKM.
  - **Merah Harga (`#DC2626`) — Fokus Transaksi**: Digunakan secara khusus untuk menampilkan nominal harga produk dan total tagihan belanja agar mata pengguna langsung menangkap informasi harga tanpa distraksi.

---

## 2. Prinsip UX, Copywriting & Simplicity (Aturan Wajib)

Seluruh halaman dan komponen wajib mematuhi 7 prinsip terukur berikut tanpa terkecuali:

1. **Copywriting Bahasa Indonesia Sehari-hari & Konsistensi Terminologi Baku**: Jangan gunakan istilah teknis, bahasa kaku, atau kata serapan asing yang jarang dipakai sehari-hari. Gunakan bahasa yang ramah, sopan, dan langsung dimengerti, serta **wajib** mematuhi glosarium istilah baku berikut:
   - **Pilihan Kami** (jangan gunakan *Kurasi Eksklusif* atau *Exclusive Curation*)
   - **Kirim Hari yang Sama** (jangan gunakan *Sameday Delivery*)
   - **Diamkan di suhu ruang sebelum digoreng/dimasak** (jangan gunakan *Proses Thawing* atau *Defrosting*)
   - **Pre-order [X] hari** (untuk barang pesanan khusus; jangan gunakan singkatan *PO* atau *Indent*)
   - **Panduan** (jangan gunakan *Dokumentasi & Regulasi*)
   - **Kabar & Tips** (untuk halaman artikel/blog; jangan gunakan *News & Insights*)
   - **Ringkasan Belanja** & **Lanjut ke Checkout** (untuk alur dari keranjang menuju halaman pengiriman & pembayaran)
   - **Kembali ke Beranda** (untuk tautan keluar pada navbar fokus autentikasi dan halaman status pembayaran)
2. **Anti-Redundansi & Anti-TMI (*Too Much Information*)**: Jangan menambahkan *badge*, *card* kecil, *section* tambahan, atau *icon* dekoratif di tempat yang tidak perlu. Setiap halaman hanya menampilkan informasi yang relevan dengan tahapannya (contoh: halaman `/cart` hanya menampilkan daftar barang, diskon produk, dan subtotal; pemilihan alamat, kurir, voucher, dan metode bayar hanya ditampilkan di `/checkout`).
3. **Dilarang Huruf Kapital Semua (`uppercase`) & Readability First (`font-normal` untuk Data)**: Dilarang menggunakan class Tailwind `uppercase` atau menulis huruf kapital semua pada judul, sub-judul, tabel, badge, maupun label. Gunakan *Title Case* atau *Sentence case*, serta batasi penggunaan huruf tebal (`font-bold` / `font-extrabold`) hanya untuk judul bagian, nominal harga, dan tombol utama.
4. **Proporsi Spacing & Anti-Box-in-Box**: Pastikan `margin`, `padding`, dan `gap` selalu proporsional. Dilarang membungkus kotak di dalam kotak berbingkai ganda (*box-in-box*) atau memberi kartu berlapis pada elemen yang sudah berada di dalam kontainer kartu putih.
5. **Skeleton untuk Gambar Dummy (Tanpa Gambar AI)**: Jika foto produk, banner, atau artikel asli belum tersedia, **dilarang** menggunakan gambar hasil generate AI atau ilustrasi palsu. Gunakan blok placeholder/skeleton bersih (`bg-gray-100` atau `bg-gray-200 animate-pulse`).
6. **Interaksi *Pointer-Only* (Tanpa Efek Hover Berlebihan)**: Jangan menggunakan efek hover mencolok seperti membesar (`hover:scale-*`), garis bawah otomatis (`hover:underline`), atau perubahan warna latar yang drastis. Cukup gunakan `cursor-pointer` pada seluruh elemen interaktif.
7. **Responsif di Semua Ukuran Layar & Prinsip Reusable Component (DRY UI)**: Pastikan tata letak rapi dari ponsel (`360px+`), tablet (`768px+`), hingga desktop (`1280px+`), serta gunakan kembali komponen layout dan bagian standar yang sudah ada (`HomeLayout`, `CartFooter`, `CartBreadcrumbBar`, `ProductCard`).

---

## 3. Sistem Warna & Token Semantik

Token warna merek didefinisikan pada blok `@theme` di `resources/css/app.css` (`--color-brand-50` hingga `--color-brand-900`) dan dipadukan dengan palet utilitas semantik Tailwind CSS.

### 3.1. Hierarki Permukaan (*Surface Tokens*)

| Peran Permukaan | Nilai Hex / CSS Variable | Class Tailwind | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Page / Canvas** | `#F8F9FB` | `bg-[#F8F9FB]` | Latar belakang dasar seluruh halaman storefront, transaksi, dan autentikasi |
| **Container / Card Surface** | `#FFFFFF` | `bg-white` | Kartu kontainer keranjang, checkout, form autentikasi, navbar, dan footer |
| **Seamless Card Surface** | `transparent` | `bg-transparent` | Kartu produk pada katalog beranda & produk serupa (menyatu dengan kanvas `#F8F9FB`) |
| **Soft Brand Surface** | `#F0E6F5` (`--color-brand-100`) | `bg-[#F0E6F5]` | Latar tab kategori aktif, badge *pre-order*, dan sorotan informasi koperasi |
| **Skeleton / Muted Well** | `#F3F4F6` / `#F9FAFB` | `bg-gray-100` / `bg-gray-50` | Placeholder gambar produk/artikel dan latar kolom pencarian navbar |
| **Neutral Border** | `#F3F4F6` / `#E5E7EB` | `border-gray-100` / `border-gray-200` | Garis tepi halus pada kartu kontainer putih, input field, dan pemisah baris |
| **Brand Accent Border** | `#E2C9EB` (`--color-brand-200`) | `border-[#E2C9EB]` | Garis tepi pada penanda *pre-order*, kartu toko UMKM, dan tombol profil |

### 3.2. Token Semantik & Status

| Status / Peran | Nilai Hex | Class Tailwind | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | `#7D3394` (`--color-brand-600`) | `bg-[#7D3394]` / `text-[#7D3394]` | Tombol CTA utama, status aktif, fokus input, dan identitas merek |
| **Price Highlight** | `#DC2626` | `text-[#DC2626]` / `bg-[#DC2626]` | Nominal harga produk, total pembayaran, dan badge jumlah isi keranjang |
| **Success / Halal & Stok** | `#059669` | `text-emerald-600` / `bg-emerald-50` | Informasi halal, stok tersedia, diskon hemat, dan pesan berhasil |
| **Rating / Warning** | `#F59E0B` | `text-amber-500` / `fill-amber-400` | Ikon bintang ulasan produk dan pemberitahuan batas waktu pembayaran |
| **Danger / Error** | `#DC2626` | `text-red-600` | Pesan validasi form gagal (`InputError`) dan aksi hapus barang |
| **Text Primary** | `#1F2937` | `text-[#1F2937]` / `text-gray-900` | Judul halaman, nama produk, dan informasi utama |
| **Text Secondary** | `#6B7280` | `text-gray-500` / `text-gray-600` | Deskripsi pendukung, label metadata, nama toko, dan kecamatan |
| **Text Muted** | `#9CA3AF` | `text-gray-400` | Harga coret sebelum diskon, placeholder input, dan pemisah (`•`) |

---

## 4. Elevasi, Sudut Lengkungan & Resep Permukaan (*Surface Recipes*)

Gunakan kombinasi class permukaan standar berikut agar tampilan antarmuka konsisten di seluruh modul dan tidak menciptakan gaya kartu baru secara sembarangan:

| Kategori Komponen | Resep Class Standar | Radius & Karakteristik Visual |
| :--- | :--- | :--- |
| **Kartu Produk Katalog (*Seamless*)** | `flex flex-col h-full bg-transparent border-0 shadow-none` | Tanpa border dan tanpa shadow; foto produk menggunakan `aspect-square bg-gray-100/80 rounded-md sm:rounded-lg overflow-hidden` dan teks langsung menyatu dengan latar `#F8F9FB` |
| **Kartu Kontainer Utama** | `bg-white rounded-2xl border border-gray-100 shadow-xs` | `rounded-2xl` (16px); digunakan untuk grup toko di keranjang, panel checkout, kartu ringkasan belanja, dan kartu autentikasi |
| **Sub-Header / Breadcrumb Bar** | `bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-2xs` | `rounded-xl` (12px); bilah penunjuk halaman dengan tombol kembali berbentuk pill (`rounded-full bg-gray-100`) |
| **Input Field Form** | `h-11 rounded-xl border-gray-200 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20` | `rounded-xl` (12px); tinggi nyaman disentuh (`44px`) dengan cincin fokus ungu lembut |
| **Search Bar Navbar** | `w-full h-11 pl-11 pr-4 rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#7D3394]` | `rounded-full`; kolom pencarian utama pada header |
| **Button Primary (CTA)** | `rounded-xl bg-[#7D3394] text-white font-bold cursor-pointer` | `rounded-xl` (12px); tombol aksi utama (Beli, Lanjut ke Checkout, Masuk/Daftar) |
| **Button Secondary / Ghost** | `rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer` | `rounded-xl` (12px); tombol aksi pendamping atau batal |
| **Badge Pre-order** | `px-2 py-0.5 rounded bg-[#F0E6F5]/95 text-[#7D3394] border border-[#E2C9EB] text-[10px] font-bold shadow-2xs` | `rounded` (4px); ditempel di sudut kiri atas (`top-2 left-2`) hanya jika `product.isPreorder` bernilai `true` |

### Urutan Layer (`z-index`)
- **`z-30`**: Elemen mengambang lokal di dalam area konten halaman.
- **`z-40`**: Baris tab kategori yang menempel saat digulir (*sticky*) dan bilah aksi bawah (*sticky bottom bar*) pada layar ponsel.
- **`z-50`**: Header/Navbar utama (`fixed top-0`), menu *popover*/*dropdown*, dan jendela dialog (*modal*).

---

## 5. Tipografi, Hierarki, Larangan `uppercase` & Anti-Over-Bold

### 5.1. Aturan Wajib: Tanpa `uppercase` & Pembatasan Bobot Font
- **Larangan Mutlak `uppercase`**: Dilarang menggunakan class `uppercase` di bagian mana pun karena membuat tampilan terasa kaku dan menurunkan keterbacaan bagi pengguna umum.
- **Anti-Over-Bold pada Katalog & Metadata**: Pada daftar produk katalog yang padat (hingga 6 kolom), penggunaan `font-bold` pada judul produk membuat teks terlihat sempit dan melelahkan mata. Gunakan bobot normal (`text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug`) pada judul kartu produk, dan biarkan **nominal harga (`font-extrabold text-[#DC2626]`)** yang menjadi penarik perhatian utama (*visual anchor*) — acuan: `resources/js/pages/home/components/product-card.tsx`.

```tsx
// Buruk: Menggunakan uppercase, border/shadow berat, dan menebalkan semua teks di dalam kartu produk
<article className="rounded-2xl border bg-white p-4 shadow-md">
    <span className="text-xs font-bold uppercase text-purple-700">PRE-ORDER</span>
    <h3 className="font-bold uppercase text-gray-900">{product.title}</h3>
    <p className="font-bold text-gray-600">{product.storeName}</p>
</article>

// Baik: Kartu seamless menyatu dengan latar, tanpa uppercase, judul reguler yang nyaman dibaca, dan harga sebagai fokus utama
<article className="flex flex-col h-full bg-transparent border-0 shadow-none">
    <Link
        href={showProduct({ slug: product.slug })}
        className="text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug cursor-pointer"
    >
        {product.title}
    </Link>
    <span className="text-sm sm:text-base font-extrabold text-[#DC2626] tracking-tight">
        {formatRupiah(product.price)}
    </span>
    <span className="text-[11px] text-gray-400 truncate">
        {product.storeName} • {product.storeDistrict}
    </span>
</article>
```

### 5.2. Hierarki Ukuran Tipografi

| Peran Teks | Ukuran Desktop | Ukuran Mobile | Ketebalan | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Judul Utama (H1 / Banner)** | `text-2xl sm:text-3xl` | `text-xl` | `font-extrabold` (800) | Judul utama banner hero atau halaman informasi |
| **Judul Halaman Auth / Bagian (H2)** | `text-xl sm:text-2xl` | `text-lg sm:text-xl` | `font-bold` (700) | Judul kartu autentikasi, judul seksi checkout/keranjang |
| **Nama Produk (Halaman Detail)** | `text-xl sm:text-2xl` | `text-lg` | `font-extrabold` (800) | Judul produk pada panel tengah halaman detail produk |
| **Nama Produk (Kartu Katalog)** | `text-sm` (`14px`) | `text-xs` (`12px`) | `font-normal` (400) | Nama produk pada `ProductCard` (`line-clamp-2 leading-snug`) |
| **Harga Utama (Detail / Total)** | `text-2xl` (`24px`) | `text-xl` (`20px`) | `font-extrabold` (800) | Harga produk di halaman detail & total tagihan akhir |
| **Harga di Kartu Katalog** | `text-base` (`16px`) | `text-sm` (`14px`) | `font-extrabold` (800) | Nominal harga merah `#DC2626` pada kartu katalog |
| **Teks Isi (Body & Form Label)** | `text-sm` (`14px`) | `text-sm` (`14px`) | `font-normal` / `font-medium` | Deskripsi produk, alamat pengiriman, dan label input form |
| **Metadata Kartu & Navigasi Atas** | `text-[11px]` – `text-xs` | `text-[11px]` – `text-xs` | `font-normal` / `font-medium` | Rating, jumlah terjual, nama toko UMKM, kecamatan, dan top bar |

### 5.3. Konfigurasi Font Global (`resources/css/app.css`)
- **Font Family**: `'Plus Jakarta Sans', 'Instrument Sans', ui-sans-serif, system-ui, sans-serif` didefinisikan pada variabel `--font-sans` di dalam `@theme` pada `resources/css/app.css`.

---

## 6. Ritme Spacing, Layout Halaman & Sistem Navigasi

### 6.1. Aturan Wajib: Proporsi Spacing & Anti-Box-in-Box
- Gunakan skala ritme jarak bertingkat agar elemen yang berkaitan terlihat menyatu dan antar bagian halaman memiliki ruang napas yang jelas:
  - **Mikro (di dalam baris informasi / harga / rating)**: `gap-1` hingga `gap-1.5` (`4px–6px`).
  - **Komponen (di dalam kartu putih / form)**: padding kartu `p-5 sm:p-6` (atau `p-6 sm:p-8` untuk kartu autentikasi), jarak antar field `gap-4` hingga `gap-5`.
  - **Makro (antar seksi halaman di dalam kontainer utama)**: `py-6 flex flex-col gap-6 sm:gap-8`.
- **Larangan *Box-in-Box***: Jangan membungkus informasi deskripsi, rincian toko, atau subtotal dengan kartu berbingkai (`border` + `shadow` + `p-6`) di dalam kartu lain yang sudah memiliki bingkai. Gunakan garis pemisah tipis (`border-t border-gray-100 pt-4`) untuk membagi bagian di dalam satu kartu yang sama.

```tsx
// Buruk: Box-in-box berlapis yang mempersempit ruang baca di layar ponsel
<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-xs">
        <div className="rounded-lg border bg-white p-4">{product.description}</div>
    </div>
</div>

// Baik: Satu kontainer bersih atau dipisahkan dengan divider halus tanpa kotak berlapis
<div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
    <p className="text-sm font-normal leading-relaxed text-gray-600">
        {product.description}
    </p>
</div>
```

### 6.2. Kerangka Layout Aplikasi & Pendaftaran di `resources/js/app.tsx`
1. **Pengecualian Layout Bawaan (`resources/js/app.tsx`)**:
   - Halaman di dalam `home/*`, `products/*`, dan `customer/*` wajib mengembalikan `null` pada resolver layout di `resources/js/app.tsx` agar merender `HomeLayout` secara langsung tanpa terbungkus sidebar dashboard admin bawaan Laravel.
   - Halaman `auth/*` menggunakan `AuthLayout` yang meneruskan ke `AuthSimpleLayout`.
2. **Kerangka Utama Storefront (`HomeLayout` — `resources/js/layouts/home-layout.tsx`)**:
   - **Header Dua Tingkat (`fixed top-0 z-50`)**:
     - *Baris 1 (Menu Informasi — `hidden sm:block h-9 bg-[#F8F9FB]`)*: Menampilkan menu institusional dari `resources/js/layouts/navigation.ts` (**Tentang Kami**, **Kabar & Tips**, **Bantuan**) rata kanan dengan dukungan *popover* sub-menu.
     - *Baris 2 (Belanja & Pencarian — `h-20 bg-white`)*: Memuat tombol menu ponsel + Logo Kossuma (`/assets/images/logo/logo.png`, `h-14`) di kiri, kolom pencarian produk di tengah, serta ikon Keranjang Belanja + tombol **Masuk** / **Daftar** (atau **Dashboard**) di kanan.
   - **Viewport Konten Utama (`<main>`)**: Menggunakan `w-full pt-20 sm:pt-[116px] flex-1` dengan kontainer standar:
     ```tsx
     <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
         {/* Isi halaman */}
     </div>
     ```
   - **Footer Terpadu (`CartFooter`)**: Dipasang di bagian bawah seluruh halaman untuk menampilkan profil koperasi, alamat gerai, jam layanan, dan kontak WhatsApp.
3. **Kerangka Fokus Autentikasi (`AuthSimpleLayout` — `resources/js/layouts/auth/auth-simple-layout.tsx`)**:
   - Menggunakan kanvas `bg-[#F8F9FB]` beserta **Navbar** dan **Footer (`CartFooter`)** yang selaras dengan `HomeLayout`, namun **menghilangkan seluruh fitur distraksi di Navbar** (tanpa top utility bar, tanpa kolom pencarian, tanpa ikon keranjang, dan tanpa tombol Masuk/Daftar) — hanya menyisakan Logo Kossuma di kiri dan tautan **Kembali ke Beranda** di kanan agar pengguna fokus menyelesaikan autentikasi.
4. **Grid Katalog Responsif 6 Kolom & Muat Bertahap**:
   - Grid produk utama menggunakan `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4`.
   - Produk ditampilkan sebanyak **18 item** per tahap (`INITIAL_PAGE_SIZE = 18`) dilengkapi tombol **Muat Lebih Banyak** yang menambah 18 produk berikutnya secara berulang hingga seluruh produk tampil.

---

## 7. Lima Archetype Halaman & Komponen Standar

Sebelum membuat atau memodifikasi halaman, **wajib periksa (`read_file`) file acuan** pada archetype yang sesuai di bawah ini:

### A. Beranda & Katalog Produk (Storefront Exploration)
- **File Acuan**: `resources/js/pages/home/index.tsx`, `resources/js/pages/home/components/product-card.tsx`, `resources/js/pages/home/components/hero-banner.tsx`, `resources/js/pages/home/components/category-tabs.tsx`.
- **Struktur**:
  1. `HeroBanner`: Banner sambutan utama dengan proposisi nilai kuliner halal UMKM Kota Bogor.
  2. `CategoryTabs`: Baris filter kategori yang dapat digulir horizontal dengan tab aktif berwarna `bg-[#F0E6F5] text-[#7D3394]`.
  3. Grid Produk 6 Kolom (`xl:grid-cols-6`): Merender `ProductCard` *seamless* (foto 1:1 `rounded-md sm:rounded-lg`, badge `Pre-order` opsional di kiri atas foto, judul reguler 2 baris, harga merah `font-extrabold`, rating bintang, dan nama toko UMKM + kecamatan).
  4. Paginasi Inkremental: Penanda jumlah produk yang tampil (`Menampilkan X dari Y produk`) dan tombol **Muat Lebih Banyak** (+18 produk per klik).

### B. Detail Produk (3-Column / Sticky Action Pod)
- **File Acuan**: `resources/js/pages/products/show.tsx`, `resources/js/pages/products/components/gallery-showcase.tsx`, `resources/js/pages/products/components/product-info-panel.tsx`, `resources/js/pages/products/components/purchase-action-pod.tsx`, `resources/js/pages/products/components/related-products.tsx`.
- **Struktur**:
  1. Sub-header kembali ke katalog (`Kembali` + breadcrumb ringkas).
  2. Layout 12 kolom pada desktop (`lg:grid-cols-12 gap-6 lg:gap-8 items-start`):
     - Kiri (`lg:col-span-4 lg:sticky lg:top-32`): `GalleryShowcase` (foto utama 1:1 + deretan *thumbnail*).
     - Tengah (`lg:col-span-5`): `ProductInfoPanel` & `ProductAccordions` (judul produk, harga, info toko UMKM, rincian penyajian/penyimpanan).
     - Kanan (`lg:col-span-3 lg:sticky lg:top-32`): `PurchaseActionPod` (pengaturan jumlah barang, catatan pesanan, subtotal, tombol **+ Keranjang** dan **Beli Langsung**; berubah menjadi bilah bawah tetap `fixed bottom-0 z-40` di layar ponsel).
  3. Bagian bawah: `ProductReviews` dan `RelatedProducts`.

### C. Alur Transaksi Pelanggan (Keranjang, Checkout & Pembayaran)
- **File Acuan**: `resources/js/pages/customer/cart/index.tsx`, `resources/js/pages/customer/cart/components/store-cart-group.tsx`, `resources/js/pages/customer/cart/components/order-summary-card.tsx`, `resources/js/pages/customer/checkout/index.tsx`, `resources/js/pages/customer/payment/index.tsx`.
- **Struktur**:
  1. **Halaman Keranjang (`/cart`)**:
     - `CartBreadcrumbBar` di bagian atas.
     - Daftar barang yang dikelompokkan per toko UMKM (`StoreCartGroup`) di kiri (`lg:col-span-8`).
     - `OrderSummaryCard` di kanan (`lg:col-span-4 lg:sticky lg:top-32`) yang **hanya** menampilkan total harga barang, diskon produk yang sudah aktif, estimasi subtotal, dan tombol **Lanjut ke Checkout** (tanpa form alamat, kurir, voucher, atau metode bayar).
  2. **Halaman Checkout (`/checkout`)**:
     - Memuat pemilihan alamat pengiriman (beserta dialog pilih/tambah alamat), opsi pengiriman per metode (Instan, Sameday, Ambil di Gerai), input kode voucher/promo, pemilihan metode pembayaran (QRIS, Transfer VA Bank, COD), dan ringkasan tagihan akhir untuk membuat pesanan.
  3. **Halaman Instruksi Pembayaran (`/checkout/payment`)**:
     - Menampilkan nomor pesanan, batas waktu bayar, total tagihan, instruksi spesifik sesuai metode (kode QRIS, nomor Virtual Account beserta tombol salin, atau instruksi COD), dan simulasi konfirmasi pembayaran untuk keperluan demo.

### D. Halaman Autentikasi Fokus (`AuthLayout`)
- **File Acuan**: `resources/js/layouts/auth/auth-simple-layout.tsx`, `resources/js/pages/auth/login.tsx`, `resources/js/pages/auth/register.tsx`, `resources/js/pages/auth/forgot-password.tsx`.
- **Struktur**:
  1. Navbar bersih (`h-20 bg-white`) yang hanya menampilkan Logo Kossuma di kiri dan tautan **Kembali ke Beranda** di kanan.
  2. Kartu autentikasi tunggal di tengah layar (`w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8`) dengan judul `text-xl sm:text-2xl font-bold text-gray-900` dan sub-judul ramah berbahasa Indonesia.
  3. Input `h-11 rounded-xl`, tombol submit utama `bg-[#7D3394] text-white rounded-xl`, serta mempertahankan seluruh kontrak form Laravel Fortify dan atribut pengujian (`data-test="login-button"`, `data-test="register-user-button"`, dll.).
  4. `CartFooter` di bagian bawah halaman.

### E. Halaman Informasi & Edukasi (Tentang Kami & Kabar)
- **File Acuan**: `resources/js/pages/home/about.tsx`, `resources/js/pages/home/blog.tsx`.
- **Struktur**:
  1. Dibungkus dengan `HomeLayout` dan kontainer standar `max-w-7xl mx-auto`.
  2. Bilah navigasi kembali (`Kembali` ke Beranda) di bagian atas.
  3. Kartu informasi putih bersih dengan tipografi yang nyaman dibaca (`leading-relaxed`) dan placeholder skeleton `bg-gray-100` untuk ilustrasi/foto dokumentasi yang belum tersedia.

---

## 8. Interaksi, Aksesibilitas & Konvensi Teknis

- **Interaksi *Pointer-Only***: Seluruh tombol, tautan, tab kategori, dan kartu produk wajib memiliki class `cursor-pointer` tanpa efek animasi skala (`hover:scale-*`) atau perubahan latar mencolok.
- **Aksesibilitas & Keyboard**:
  - Tombol ikon tanpa teks (seperti tombol keranjang belanja, hapus barang, atau menu ponsel) wajib memiliki atribut `aria-label` berbahasa Indonesia yang jelas (contoh: `aria-label="Keranjang Belanja"`).
  - Elemen form dan tombol menggunakan `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394]` (atau `focus-visible:ring-[#7D3394]/20` pada input).
  - Menu *dropdown* pada header mendukung penutupan otomatis saat klik di luar area (*click outside*) atau menekan tombol `Escape`.
- **Format Nominal Rupiah**:
  - Gunakan fungsi `'Rp' + nilai.toLocaleString('id-ID')` tanpa spasi setelah `Rp` dan tanpa desimal `,00` (contoh: `Rp35.000`, `Rp120.000`).
- **Navigasi Route Berbasis Wayfinder**:
  - Dilarang menulis string URL secara manual (`href="/cart"` atau `href="/login"`). Selalu impor helper route dari `@/routes` (contoh: `href={home()}`, `href={cart()}`, `href={login()}`, `href={showProduct({ slug: product.slug })}`).
- **Penggunaan Ikon (`lucide-react`)**:
  - Gunakan ikon hanya jika memperjelas fungsi kontrol (pencarian, keranjang, panah kembali, bintang rating, lokasi toko). Jangan menaruh ikon dekoratif pada setiap judul paragraf atau baris tabel.

---

## 9. Panduan Implementasi (Do's & Don'ts)

### Do's (Wajib Dilakukan)
- **Periksa file acuan di Bab 7** sebelum membuat halaman baru atau memodifikasi komponen yang sudah ada.
- **Gunakan `HomeLayout`** untuk seluruh halaman publik/pelanggan dan **`AuthSimpleLayout`** untuk seluruh halaman autentikasi.
- **Pertahankan gaya *seamless* pada `ProductCard`** (tanpa border, tanpa shadow, menyatu dengan latar `#F8F9FB`, judul `font-normal`, dan harga merah `#DC2626` `font-extrabold`).
- **Gunakan Bahasa Indonesia sehari-hari** sesuai glosarium pada Bab 2.
- **Gunakan placeholder skeleton (`bg-gray-100`)** untuk seluruh gambar yang belum memiliki foto asli.
- **Pastikan seluruh elemen klik memiliki `cursor-pointer`** dan tampil rapi dari layar `360px+` hingga `1280px+`.

### Don'ts (Dilarang Keras)
- **Jangan pernah menggunakan class `uppercase`** atau menulis teks berhuruf kapital semua di bagian mana pun.
- **Jangan menumpuk informasi (*Too Much Information*)**: Jangan menampilkan pilihan alamat, kurir, voucher, atau metode pembayaran di halaman `/cart` (semua itu tempatnya di `/checkout`).
- **Jangan menggunakan `font-bold` / `font-semibold` secara berlebihan** pada judul produk di katalog atau metadata sekunder.
- **Jangan membuat kotak di dalam kotak (*box-in-box*)** dengan border dan padding berlapis yang mempersempit ruang baca.
- **Jangan menggunakan gambar hasil generate AI** untuk menggantikan foto produk atau artikel.
- **Jangan menambahkan efek hover mencolok** seperti `hover:scale-*`, `hover:underline` pada kartu, atau transisi gerakan yang berlebihan.
