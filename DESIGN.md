# Panduan Desain & Spesifikasi UI: Kossuma Kota Bogor

> **Koperasi Usaha Persaudaraan Muslimah Kota Bogor — Belanja Kuliner Halal & Produk UMKM Lokal**

Dokumen ini adalah **pedoman utama (*Single Source of Truth*)** dalam merancang dan membangun tampilan antarmuka aplikasi Kossuma Kota Bogor. Seluruh halaman dan komponen baru wajib mengikuti aturan di dalam dokumen ini agar tampilan selalu konsisten, sederhana, dan nyaman digunakan.

---

## 1. Prinsip Utama Desain (Wajib Dipatuhi)

Setiap kali membuat atau mengubah halaman, patuhi **7 Aturan Dasar** berikut tanpa terkecuali:

1. **Keep It Simple (Sederhana & Bersih):**
   - Utamakan kesederhanaan. Jangan membuat tata letak yang rumit. Sedikit elemen namun jelas jauh lebih baik daripada layar yang penuh sesak.
2. **Pertahankan Seni *Simple & Easy to Use*:**
   - Desain harus mudah dipahami dalam sekali lihat oleh siapa saja, termasuk ibu rumah tangga dan pengguna awam. Alur mencari produk, melihat detail, hingga memesan harus terasa ringan dan langsung ke tujuan.
3. **Jangan Terlalu Banyak Informasi (*No Too Much Information*):**
   - **Jangan** menambahkan badge, section tambahan, kartu (*card*) berlapis, atau ikon di tempat yang tidak perlu.
   - Jika sebuah informasi sudah jelas hanya dengan teks biasa, jangan tambahkan ikon atau kotak pembungkus baru.
4. **Dilarang Menggunakan Huruf Kapital Semua (`uppercase`):**
   - **Jangan pernah** menggunakan class Tailwind `uppercase` atau menulis teks dengan huruf besar semua pada judul, sub-judul, tabel, maupun label. Gunakan penulisan normal (*Title Case* atau *Sentence case*) agar terlihat ramah dan nyaman dibaca.
5. **Gunakan Bahasa Indonesia Sehari-hari yang Mudah Dimengerti:**
   - Hindari istilah teknis, bahasa kaku, atau kata serapan yang jarang dipakai sehari-hari.
   - Contoh:
     - Gunakan **"Pilihan Kami"**, bukan *"Kurasi Eksklusif"*.
     - Gunakan **"Kirim Hari yang Sama"**, bukan *"Sameday Delivery"*.
     - Gunakan **"Diamkan di suhu ruang sebelum digoreng"**, bukan *"Proses Thawing / Defrosting"*.
     - Gunakan **"Panduan"**, bukan *"Dokumentasi & Regulasi"*.
6. **Gunakan Skeleton untuk Gambar Dummy (Jangan Gunakan Gambar AI):**
   - Jika foto asli belum tersedia, **jangan** menggunakan gambar hasil generate AI atau gambar ilustrasi palsu. Gunakan blok placeholder/skeleton bersih (`bg-gray-100` atau `bg-gray-200 animate-pulse`) agar tampilan tetap natural dan rapi.
7. **Tanpa Efek Hover Berlebihan (*Pointer-Only*) & Responsif di Semua Layar:**
   - **Jangan** menggunakan efek hover seperti `hover:scale-*`, `hover:underline`, atau perubahan warna latar (`hover:bg-*`) yang mencolok. Cukup gunakan `cursor-pointer` pada semua elemen yang bisa diklik.
   - Pastikan tampilan selalu rapi dan proporsional di semua ukuran layar: ponsel (360px+), tablet (768px+), hingga komputer/desktop (1280px+).

---

## 2. Token Desain

### 2.1 Palet Warna

| Nama Token | Kode Hex | Class Tailwind | Penggunaan di Antarmuka |
| :--- | :--- | :--- | :--- |
| **Ungu Utama (Brand)** | `#7D3394` | `bg-[#7D3394]` / `text-[#7D3394]` | Warna identitas koperasi, tombol utama, teks aktif, dan kotak centang (*checkbox*). |
| **Ungu Lembut (Surface)** | `#F0E6F5` | `bg-[#F0E6F5]` | Latar belakang tab kategori yang sedang dipilih dan penanda ringan. |
| **Garis Tepi Ungu** | `#E2C9EB` | `border-[#E2C9EB]` | Garis tepi halus pada kotak informasi toko UMKM atau kupon. |
| **Latar Halaman** | `#F8F9FB` | `bg-[#F8F9FB]` | Warna latar belakang dasar untuk seluruh halaman depan. |
| **Permukaan Kartu** | `#FFFFFF` | `bg-white` | Warna dasar kartu produk, header, footer, dan kotak konten. |
| **Skeleton / Placeholder** | `#F3F4F6` | `bg-gray-100` | Warna latar pengganti gambar (*skeleton*) saat foto asli belum ada. |
| **Teks Utama** | `#1F2937` | `text-[#1F2937]` / `text-gray-900` | Judul halaman, nama produk, dan teks utama. |
| **Teks Pendukung** | `#6B7280` | `text-gray-500` / `text-gray-600` | Keterangan tambahan, nama toko, lokasi kecamatan, dan tanggal. |
| **Teks Redup** | `#9CA3AF` | `text-gray-400` | Harga coret sebelum diskon, teks bantuan di kolom pencarian, dan pembatas. |
| **Merah Harga** | `#DC2626` | `text-[#DC2626]` | Warna khusus untuk menampilkan nominal harga produk dan total belanja. |
| **Hijau Halal & Stok** | `#059669` | `text-emerald-600` | Penanda produk halal, stok tersedia, dan pesan berhasil. |
| **Kuning Bintang** | `#F59E0B` | `text-amber-500` | Warna ikon bintang penilaian produk. |
| **Garis Tepi Netral** | `#F3F4F6` / `#E5E7EB` | `border-gray-100` / `border-gray-200` | Garis tepi standar pada kartu dan pembatas antar bagian. |

---

### 2.2 Tipografi & Ukuran Teks

**Jenis Huruf Utama:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`

| Jenis Teks | Ukuran Desktop | Ukuran Mobile | Ketebalan | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Judul Utama (H1)** | `28px – 32px` (`text-2xl sm:text-3xl`) | `20px – 24px` (`text-xl`) | `font-extrabold` (800) | Judul utama banner atau halaman |
| **Judul Bagian (H2)** | `20px` (`text-xl`) | `18px` (`text-lg`) | `font-bold` (700) | Judul bagian konten |
| **Nama Produk (Detail)** | `24px` (`text-2xl`) | `18px` (`text-lg`) | `font-extrabold` (800) | Nama produk di halaman detail |
| **Nama Produk (Kartu)** | `15px` (`text-sm md:text-base`) | `14px` (`text-sm`) | `font-bold` (700) | Nama produk di daftar katalog (maksimal 2 baris) |
| **Harga Utama** | `24px` (`text-2xl`) | `20px` (`text-xl`) | `font-extrabold` (800) | Harga di halaman detail & total keranjang |
| **Harga di Kartu** | `16px – 18px` (`text-base sm:text-lg`) | `15px` (`text-base`) | `font-extrabold` (800) | Harga produk di kartu katalog |
| **Teks Isi (Body)** | `14px` (`text-sm`) | `14px` (`text-sm`) | `font-normal` (400) | Penjelasan produk, alamat, dan artikel |
| **Teks Kecil (Keterangan)** | `12px` (`text-xs`) | `12px` (`text-xs`) | `font-medium` (500) | Nama toko, penilaian, dan navigasi atas |

> **Catatan Penting:** Jangan pernah menambahkan class `uppercase` pada teks apa pun.

---

### 2.3 Sudut Lengkungan (*Border Radius*) & Layer (`z-index`)

#### Sudut Lengkungan
- **`rounded-lg` (8px):** Tombol kecil, menu di dalam daftar pilihan, dan kotak input.
- **`rounded-xl` (12px):** Standar utama untuk kartu produk, tombol aksi, dan bilah navigasi.
- **`rounded-2xl` (16px):** Kontainer bagian utama seperti banner dan grup toko di keranjang.
- **`rounded-full` (9999px):** Kolom pencarian, tombol tambah/kurang jumlah, dan tombol kembali.

#### Urutan Layer (`z-index`)
- **`z-30`:** Elemen pendukung di dalam halaman.
- **`z-40`:** Baris tab kategori yang menempel saat layar digulir (*sticky*) dan bilah tombol beli di bagian bawah layar ponsel.
- **`z-50`:** Header utama di bagian atas layar, menu dropdown, dan jendela pop-up (*modal*).

---

## 3. Struktur Layout & Kerangka Halaman

### 3.1 Kerangka Utama (`StorefrontLayout`)
Semua halaman depan dan informasi (Beranda, Detail Produk, Keranjang, Tentang Kami, dan Kabar/Blog) wajib menggunakan [`StorefrontLayout`](file:///home/miftah/Code/PHP/kossuma/resources/js/layouts/storefront-layout.tsx).

Setiap halaman publik wajib didaftarkan pada [`resources/js/app.tsx`](file:///home/miftah/Code/PHP/kossuma/resources/js/app.tsx) agar mengembalikan nilai `null` pada pengaturan layout bawaan, sehingga tidak terbungkus oleh tampilan sidebar admin/dashboard.

### 3.2 Ukuran Kontainer Halaman Standar
Isi utama di dalam `<StorefrontLayout>` wajib dibungkus menggunakan kontainer berikut agar lebar dan jarak tepinya selalu sama di semua halaman:

```tsx
<div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
    {/* Isi halaman di sini */}
</div>
```

### 3.3 Aturan Responsif Semua Layar
- **Ponsel (`< 640px`):** Padding kiri-kanan `px-4` (16px), daftar produk ditampilkan dalam **2 kolom** (`grid-cols-2 gap-4`).
- **Tablet (`640px – 1024px`):** Padding kiri-kanan `sm:px-6` (24px), daftar produk ditampilkan dalam **3 kolom** (`md:grid-cols-3 gap-5`).
- **Desktop (`> 1024px`):** Padding kiri-kanan `lg:px-8` (32px), lebar maksimal `max-w-7xl` (1280px), daftar produk ditampilkan dalam **4 kolom** (`lg:grid-cols-4 gap-5`).

---

## 4. Sistem Navigasi (Header Dua Tingkat)

Header menggunakan desain **Two-Tier (Dua Baris)** yang bersih:

1. **Baris Atas (Menu Informasi — Hanya di Tablet/Desktop `sm:block`):**
   - Tinggi `h-9` (36px) dengan latar `#F8F9FB` dan posisi rata kanan (`justify-end`).
   - Berisi tautan halaman informasi: **Tentang Kami**, **Kabar & Tips**, serta **Bantuan**.
   - Jika menu memiliki sub-menu, klik pada menu akan membuka kotak daftar pilihan (*popover*) yang rapi tanpa judul berhuruf kapital semua.
   - Daftar menu dikelola secara terpusat di [`resources/js/layouts/navigation.ts`](file:///home/miftah/Code/PHP/kossuma/resources/js/layouts/navigation.ts).

2. **Baris Utama (Belanja & Pencarian):**
   - Tinggi `h-20` (80px) dengan latar putih bersih.
   - **Kiri:** Tombol menu garis tiga (khusus ponsel) dan Logo Kossuma (`/assets/images/logo/logo.png`) dengan tinggi `h-14` (`w-auto object-contain`).
   - **Tengah:** Kolom pencarian produk (`rounded-full bg-gray-50 h-11`).
   - **Kanan:** Ikon keranjang belanja beserta angka jumlah barang, serta tombol **Masuk** / **Daftar**.

3. **Menu Ponsel (Slide-down Menu):**
   - Pada layar ponsel, menu informasi dibuka melalui tombol menu di kiri atas. Sub-menu ditampilkan menurun ke bawah (*accordion*) yang mudah disentuh dengan jari.

---

## 5. Standar Komponen Utama

### 5.1 Kartu Produk Katalog
Kartu produk dirancang sesederhana mungkin agar foto dan harga langsung terlihat jelas:
- **Foto/Gambar 1:1 (`aspect-square`):**
  - Jika belum ada foto asli, gunakan skeleton `<div className="w-full aspect-square bg-gray-100" />`.
  - **Dilarang** menempelkan stiker diskon, label promo, atau tombol beli di atas area gambar.
- **Isi Kartu:**
  1. **Nama Produk:** Maksimal 2 baris (`line-clamp-2`), warna `#1F2937`, tebal (`font-bold`).
  2. **Harga Produk:** Warna merah `#DC2626` (`font-extrabold`), dengan harga sebelum diskon dicoret di sebelahnya jika ada.
  3. **Info Singkat:** Bintang penilaian, jumlah terjual, dan nama toko UMKM beserta kecamatannya.

### 5.2 Placeholder Gambar (Skeleton)
Untuk gambar produk, banner, atau foto artikel yang masih berupa data contoh (*dummy*), gunakan blok skeleton bersih:

```tsx
{/* Contoh Skeleton Gambar Produk / Artikel */}
<div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
    Foto Produk
</div>
```

### 5.3 Bilah Navigasi Kembali (Sub-Header Halaman Dalam)
Untuk halaman selain Beranda (seperti Detail Produk, Keranjang, Tentang Kami, dan Kabar), gunakan satu baris penunjuk sederhana di bagian atas:

```tsx
<div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-2xs flex items-center justify-between gap-3">
    <Link
        href={home()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-[#7D3394] text-xs font-bold shrink-0 cursor-pointer"
    >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali</span>
    </Link>
    <span className="text-xs font-medium text-gray-500">Nama Halaman</span>
</div>
```

### 5.4 Tombol Aksi (Buttons)
- **Tombol Utama:**
  ```tsx
  <button
      type="button"
      className="px-6 py-3 rounded-xl bg-[#7D3394] text-white text-sm font-bold cursor-pointer"
  >
      Teks Tombol
  </button>
  ```
- **Tombol Sekunder:**
  ```tsx
  <button
      type="button"
      className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold cursor-pointer"
  >
      Teks Tombol
  </button>
  ```

---

## 6. Standar Penulisan Kode & Format Data

1. **Penulisan Harga Rupiah:**
   - Gunakan format `'Rp' + nilai.toLocaleString('id-ID')` tanpa spasi dan tanpa angka desimal `,00` di belakangnya (contoh: `Rp35.000`, `Rp65.000`).
2. **Navigasi Halaman (Wayfinder):**
   - Jangan menulis alamat URL secara manual (seperti `href="/cart"`). Selalu gunakan fungsi route dari `@/routes` (seperti `href={cart()}`, `href={home()}`).
3. **Penggunaan Ikon (`lucide-react`):**
   - Gunakan ikon hanya jika benar-benar membantu pengguna memahami fungsi tombol (misalnya ikon kaca pembesar untuk cari, ikon keranjang, atau panah kembali). Jangan menaruh ikon hiasan di setiap judul atau paragraf.

---

## 7. Daftar Periksa: Yang Boleh (Do's) & Dilarang (Don'ts)

### Wajib Dilakukan (Do's)
- **Buat tampilan sesederhana mungkin (*Keep It Simple*)** dengan ruang kosong (*whitespace*) yang lega agar mata tidak lelah.
- **Gunakan bahasa Indonesia sehari-hari** yang akrab, sopan, dan langsung dimengerti.
- **Gunakan skeleton (`bg-gray-100`)** untuk semua gambar dummy yang belum memiliki foto asli.
- **Gunakan warna merah `#DC2626` khusus untuk harga** dan warna ungu `#7D3394` untuk tombol/elemen aktif utama.
- **Pastikan semua tombol dan link memiliki class `cursor-pointer`**.
- **Uji tampilan di ukuran layar kecil (ponsel) dan besar (desktop)** agar tidak ada elemen yang bertumpuk atau terpotong.

### Dilarang Keras (Don'ts)
- **DILARANG menggunakan `uppercase` (huruf kapital semua)** di bagian mana pun.
- **DILARANG menambahkan badge, kartu kecil, section tambahan, atau ikon yang tidak perlu** yang membuat halaman terlihat ramai (*too much information*).
- **DILARANG menggunakan gambar hasil generate AI** untuk gambar dummy.
- **DILARANG menambahkan efek hover** seperti membesar (`hover:scale-*`), garis bawah (`hover:underline`), atau berubah warna latar saat kursor diarahkan.
- **DILARANG menggunakan istilah asing atau teknis yang rumit** jika ada padanan kata bahasa Indonesia sehari-hari yang lebih sederhana.
- **DILARANG menaruh tombol atau label di atas foto produk** pada kartu katalog.
