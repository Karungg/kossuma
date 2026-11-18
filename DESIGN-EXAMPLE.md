# Design System — LMS & E-Training Panasonic (`DESIGN.md`)

Dokumen ini merupakan *single source of truth* untuk sistem desain antarmuka pada aplikasi **LMS & E-Training Panasonic**, disusun berdasarkan implementasi aktual di kode saat ini — dengan acuan utama pada **route admin/manage** (`/t/manage/*` dan `/l/manage/*`).

> **Aturan Eksekusi untuk AI Agent**: Saat merancang, membuat, atau merefaktor halaman/komponen UI, AI **wajib** membaca dokumen ini secara menyeluruh, mematuhi protokol di `.agents/rules/design-standards.md`, serta memeriksa minimal satu file komponen acuan pada **Bab 7** sebelum menulis kode.

---

## 1. Filosofi Desain & Identitas Visual

Aplikasi ini menggunakan gaya **Soft Neumorphism** yang menggabungkan permukaan taktil (*raised cards*, *inset input wells*, *specular top-edge highlight*, dan *ambient blurred glow*) dengan struktur layout admin yang bersih dan terprediksi.

- **Dual-Mode Parity**: Mendukung **Light Mode** (`#eef2f7`) dan **Dark Mode** (`#0c1322` / `#11192d`) secara penuh melalui CSS custom properties di `resources/css/app.css` dan token Tailwind di `resources/js/lib/theme.ts`.
- **Dual-Portal Accent**:
  - **E-Training (`/t/...`) — Baseline Utama**: Panasonic Blue (`#0041C0` pada light mode, `#2563eb` / `blue-400` pada dark mode).
  - **LMS (`/l/...`) — Varian Portal**: Teal (`#0D9488` pada light mode, `teal-400` pada dark mode), terlihat pada `StatCard` dan `PortalSwitcher`.

---

## 2. Prinsip UX, Copywriting & Simplicity (Aturan Wajib)

Seluruh halaman dan fitur baru — terutama di area admin — wajib mematuhi 7 prinsip terukur berikut:

1. **Copywriting Sederhana & Konsistensi Terminologi Baku**: Jangan gunakan istilah teknis, nama field database mentah, atau jargon yang tidak umum sehari-hari. Gunakan bahasa yang jelas, singkat, dan langsung dipahami banyak orang (contoh: *"Tambah Admin"*, *"Cari data..."*, *"Simpan"*), serta **wajib** mematuhi glosarium istilah baku berikut:
   - **Pelatihan** (jangan gunakan *Event*, *Event Pelatihan*, atau *Acara*)
   - **Departemen** (jangan gunakan *Divisi* atau *Unit Kerja*)
   - **Departemen Sasaran** (jangan gunakan *Departemen Tujuan* atau *Target Departemen*)
   - **Format** (untuk label format pelatihan; cukup tulis **Format**, bukan *Format Pelatihan*)
   - **Pabrik** (jangan gunakan *Perusahaan*, *Industri*, atau *Unit Industri*)
   - **Pretest**, **Posttest**, **Project** (tanpa tanda hubung, jangan gunakan *Pre-test*, *Post-test*, *Tugas Proyek*, atau *Tugas Projek*)
   - **Status** (label menggunakan **Status**, dan nilai/kalimat status mengikuti nama Enum seperti `Draft`, `Published`, `Ongoing`, `Completed`, `Cancelled` — contoh: *"Pelatihan Published"*, *"Pelatihan Cancelled"*)
2. **Anti-Redundansi & Anti-TMI (*Too Much Information*)**: Jangan menambahkan *badge*, *card*, *section*, atau *icon* yang membuat informasi berulang atau terlalu padat. Setiap elemen visual harus memiliki satu fungsi yang jelas dan dilarang menduplikasi informasi yang sudah terlihat di sekitarnya.
3. **Readability & Anti-Over-Bold (`font-normal` First)**: Di atas permukaan *Soft Neumorphism*, dilarang menggunakan `font-bold`, `font-semibold`, atau `font-medium` secara berlebihan pada sel tabel, metadata, badge, tanggal, kapasitas, atau deskripsi. Gunakan `font-normal` sebagai standar konten data dan bedakan hierarki melalui warna (`text-foreground` vs `text-muted-foreground`) serta ukuran teks.
4. **Proporsi Spacing & Anti-Box-in-Box**: Pastikan `margin`, `padding`, dan `gap` selalu proporsional (tidak menyisakan *dead space* yang terlalu lebar dan tidak membuat elemen berhimpitan). Dilarang membungkus metadata atau deskripsi dengan kotak di dalam kotak (*box-in-box*) yang memboroskan ruang baca.
5. **Responsif di Semua Ukuran Layar**: Pastikan layout, tabel, form, dan navigasi tetap rapi, terbaca, dan nyaman digunakan di semua ukuran layar — mulai dari mobile (`320px+`), tablet (`sm`/`md`), hingga desktop lebar (`lg`/`xl`).
6. **Keep It Simple & To-The-Point**: Utamakan alur yang langsung pada inti tugas pengguna tanpa dekorasi berlebihan, langkah berlapis, atau kontrol yang tidak diperlukan.
7. **Prinsip Reusable Component (DRY UI)**: Gunakan kembali komponen standar yang sudah ada atau ekstrak pola UI yang berulang menjadi komponen *reusable* dengan *props* yang bersih agar konsisten di seluruh modul.

---

## 3. Sistem Warna & Token Semantik

Seluruh token warna didefinisikan di `resources/css/app.css` (`:root` dan `.dark`) serta diekspor melalui `resources/js/lib/theme.ts` (`neuColors`, `neuPalette`, `neuBadge`, `neuText`, `neuGlow`, `neuIndicator`).

### 3.1. Hierarki Permukaan (*Surface Tokens*)

| Peran | CSS Variable | Light Mode | Dark Mode | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Page / Canvas** | `--neu-page` | `#eef2f7` | `#0c1322` | Latar belakang utama halaman admin |
| **Raised Surface** | `--neu-surface` | `#eef2f7` | `#11192d` | Card, tabel, dropdown, modal, hero banner |
| **Sunken / Well** | `--neu-sunken` | `#e8edf5` | `#0c1322` | Input field, search bar, area cekung (*inset*) |
| **Sidebar** | `--neu-sidebar` | `#e4ebf5` | `#0c1322` | Navigasi sidebar kiri |
| **Primary Brand** | `--neu-primary` | `#0041C0` | `#2563eb` | Tombol aksi utama, indikator aktif E-Training |
| **Border** | `--neu-border` | `rgba(255, 255, 255, 0.8)` | `rgba(30, 41, 59, 0.8)` | Garis tepi halus untuk efek bevel neumorphic |

### 3.2. Token Semantik & Status

Gunakan mapping semantik dari `neuColors`, `neuBadge`, dan `neuText` di `@/lib/theme`:

| Status / Peran | Warna Dasar | Kegunaan |
| :--- | :--- | :--- |
| **Primary / Info** | `blue` (`#0041C0`) | Aksi utama, tautan aktif, informasi umum E-Training |
| **LMS Portal** | `teal` (`#0D9488`) | Aksen aktif portal LMS |
| **Success** | `emerald` | Status aktif, selesai, disetujui, valid |
| **Warning** | `amber` | Menunggu persetujuan, perhatian, tenggat |
| **Danger / Error** | `rose` | Hapus data, ditolak, error validasi |
| **Muted / Secondary** | `slate` | Teks sekunder, metadata, status non-aktif |

> **Catatan**: `neuPalette` juga menyediakan 22 variasi warna (`blue`, `indigo`, `purple`, `violet`, `fuchsia`, `pink`, `rose`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `slate`, `gray`, `zinc`, `neutral`, `stone`) untuk kebutuhan grafik, role badge, dan kategori.

---

## 4. Elevasi, Bayangan & Resep Permukaan (`neuSurfaces`)

Gunakan preset dari `neuSurfaces` dan `neuShadows` di `@/lib/theme` agar konsisten dan **dilarang menulis string shadow panjang secara manual**:

| Kategori | Token `neuSurfaces` / `neuShadows` | Radius & Karakteristik |
| :--- | :--- | :--- |
| **Card Standar** | `neuSurfaces.card` / `neuSurfaces.cardHover` | `rounded-3xl`, bayangan luar ganda (terang di kiri-atas, gelap di kanan-bawah) |
| **Stat Card** | `neuSurfaces.statCard` / `neuSurfaces.statCardHover` | `rounded-3xl`, `borderCardLg`; statis untuk display, hover lift (`hover:-translate-y-1`) hanya saat interaktif (`href` / `onClick`) |
| **Table Container** | `neuSurfaces.tableContainer` | `overflow-hidden rounded-3xl`, membungkus `DataTableTemplate` |
| **Input / Well** | `neuSurfaces.input` / `neuSurfaces.well` | `h-10 rounded-2xl`, bayangan cekung ke dalam (`neuShadows.inset`) |
| **Button Default** | `neuSurfaces.buttonDefault` | `rounded-2xl`, permukaan timbul, tertekan saat `active` |
| **Button Primary** | `neuSurfaces.buttonPrimary` | `rounded-2xl`, `#0041C0`, teks putih `font-bold`, `neuShadows.buttonPrimary` |
| **Dropdown & Modal** | `neuSurfaces.dropdownContent` / `neuSurfaces.modalContent` | `rounded-2xl` (dropdown), `rounded-3xl` (modal) |
| **Floating Pill** | `neuSurfaces.floatingPill` | `rounded-2xl`, `backdrop-blur-md` untuk bar aksi mengambang (`BulkActionsBar`) |

### Efek Specular & Ambient
- **Specular Overlay**: `neuGradients.specular` (`bg-gradient-to-br from-white/70 via-transparent to-black/[0.02]`) dan `neuGradients.highlightLine` (`h-px` di sisi atas card).
- **Ambient Glow**: Lingkaran blur lembut di latar halaman (`pointer-events-none ... rounded-full bg-blue-400/10 blur-3xl`) untuk memberi kedalaman tanpa mengganggu keterbacaan.

---

## 5. Tipografi, Hierarki & Aturan Anti-Over-Bold

### 5.1. Aturan Wajib: Pembatasan Bobot Font (Anti-Over-Bold)
- Di atas permukaan *Soft Neumorphism* (*low surface contrast*), penggunaan `font-bold`, `font-semibold`, atau `font-medium` secara berlebihan pada konten data membuat seluruh elemen terlihat "berteriak" bersamaan, menyempitkan *negative space* huruf, dan menurunkan keterbacaan.
- **Isi Tabel, Metadata & Teks Sekunder (`font-normal`)**: Gunakan bobot normal (`font-normal` / tanpa `font-bold` atau `font-semibold`) sebagai standar wajib pada sel tabel (*table body* `<td>`), badge informasi, tanggal, kapasitas, dan deskripsi — pisahkan hierarki menggunakan **warna teks (`text-foreground` vs `text-muted-foreground`) dan ukuran**, bukan ketebalan huruf (acuan: `resources/js/pages/etraining/event/components/index/table/event-table-row.tsx` dan `event-table-capacity-cell.tsx`).
- **Penekanan Selektif**: Simpan `font-bold` / `font-semibold` **hanya** untuk *visual anchor* utama:
  1. Judul halaman / hero banner (`h1`, `Heading`).
  2. Header kolom tabel (`<th>`).
  3. Angka metrik KPI / persentase kunci pada `StatCard`.
  4. Tombol aksi primer (CTA utama).

```tsx
// Buruk: Semua teks di dalam sel tabel diberi font-bold / font-semibold sehingga berat dibaca
<td className="px-4 py-3">
    <p className="font-bold text-slate-900">{row.title}</p>
    <span className="text-xs font-semibold text-slate-500">{row.department}</span>
</td>

// Baik: Gunakan font-normal dan bedakan hierarki dengan ukuran serta warna teks
<td className="px-4 py-3 font-normal">
    <p className="text-sm text-foreground">{row.title}</p>
    <span className="text-xs text-muted-foreground">{row.department}</span>
</td>
```

### 5.2. Hierarki Ukuran Tipografi Admin
- **Executive Hero Title**: `text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight`
- **Detail Hero Title**: `text-base sm:text-xl lg:text-2xl xl:text-3xl font-black tracking-tight`
- **Page Heading (`Heading`)**: `text-xl font-semibold tracking-tight` + deskripsi `text-sm text-muted-foreground`
- **Section Title (`FormSection`)**: `text-sm font-bold text-foreground` + deskripsi `text-xs font-medium text-muted-foreground`

### 5.3. Konfigurasi Font Global (Otomatis di `app.css`)
- **Font Family**: `Instrument Sans` (`400`, `500`, `600`) dimuat melalui `@fontsource/instrument-sans`.
- **Dynamic Font Scaling**: Diatur melalui `html[data-font-size='small' | 'normal' | 'large']` (`14px` / `16px` / `18px`) di `resources/css/app.css`.

---

## 6. Ritme Spacing, Layout Halaman & Navigasi Admin

### 6.1. Aturan Wajib: Proporsi Spacing, Margin, Padding & Anti-Box-in-Box
- Setiap ruang (*space*) harus dimanfaatkan secara efektif: hindari `margin`, `padding`, atau `gap` yang terlalu lebar (menimbulkan *dead space* atau memisahkan elemen yang saling terkait) maupun terlalu sempit (membuat teks, ikon, atau tombol berhimpitan).
- Gunakan skala ritme bertingkat sesuai kedekatan hierarki:
  - **Mikro (di dalam kontrol / baris metadata)**: `gap-1.5` hingga `gap-2.5` (misal: ikon + label).
  - **Komponen (di dalam kartu / form)**: padding kartu `p-4 sm:p-5` (kompak) atau `p-5 sm:p-6` (standar), jarak vertikal antar blok internal `space-y-3` hingga `space-y-4`.
  - **Makro (antar section halaman)**: `gap-5 sm:gap-6` atau `space-y-5 sm:space-y-6`.
- **Larangan *Box-in-Box***: Hindari pembungkusan kotak berlapis (kartu di dalam kartu dengan border/shadow dan padding ganda) untuk metadata atau deskripsi karena menyia-nyiakan ruang baca dan membuat tampilan sempit di layar mobile.

```tsx
// Buruk: Box-in-box berlapis dengan padding berlebihan yang menyempitkan ruang baca
<div className={cn(neuSurfaces.card, 'p-8 space-y-8')}>
    <div className={cn(neuSurfaces.well, 'p-6')}>
        <div className="rounded-xl border p-4">{event.description}</div>
    </div>
</div>

// Baik: Satu permukaan kartu yang bersih dengan padding proporsional tanpa pembungkus berlapis
<div className={cn(neuSurfaces.card, 'p-5 sm:p-6 space-y-4')}>
    <p className="text-sm font-normal leading-relaxed text-muted-foreground">
        {event.description}
    </p>
</div>
```

### 6.2. Page Canvas & Application Shell
1. **Page Canvas**: Tinggi minimal `min-h-[calc(100dvh-4.5rem)]`, padding responsif `p-4 sm:p-6 lg:p-8` dengan `pb-[max(...,env(safe-area-inset-bottom))]` dan jarak vertikal antar blok `space-y-5 sm:space-y-6`.
2. **Application Shell (`AppSidebarLayout`)**: Tersusun dari `AppShell` (`variant="sidebar"`), `AppSidebar`, `AppContent` (`min-w-0 flex-1 overflow-x-clip`), dan `AppSidebarHeader`.
3. **Top Header (`AppSidebarHeader`)**: Tinggi `h-16` (`h-12` saat sidebar *collapsed*), `backdrop-blur-md`, memuat `SidebarTrigger` + `Breadcrumbs` di kiri serta `PortalSwitcher`, `ThemeToggleSwitch`, dan `NotificationBell` di kanan.

---

## 7. Empat Archetype Halaman Admin & Komponen Standar

Sebelum membuat atau mengubah halaman admin, **wajib periksa (`read_file`) file acuan** pada archetype yang sesuai di bawah ini:

### A. Admin Dashboard
- **File Acuan**: `resources/js/pages/etraining/dashboard/admin/index.tsx`, `resources/js/pages/lms/dashboard/admin/index.tsx`.
- **Struktur**:
  1. `CompactExecutiveHero`: Banner gradient (`from-[#002B82] via-[#0041C0] to-[#0b2447]`) dengan pola dot-grid halus, badge peran, sapaan user, dan judul ringkas.
  2. `AdminStatCards`: Baris metrik ringkas menggunakan `StatCardGrid` & `StatCard`.
  3. Grid utama 12 kolom (`grid-cols-1 gap-6 xl:grid-cols-12`):
     - `xl:col-span-7`: Ringkasan data master / distribusi / grafik (`AdminMasterDataOverview`).
     - `xl:col-span-5`: Aktivitas terbaru (`RecentActivities`).

### B. Admin Index / CRUD List
- **File Acuan**: `resources/js/pages/etraining/user/admin/index.tsx`, `resources/js/pages/etraining/admin/approval/index.tsx`, `resources/js/pages/etraining/event/components/index/table/event-table-row.tsx`.
- **Struktur**:
  1. Header halaman: `Heading` di kiri + tombol aksi utama (`neuSurfaces.buttonPrimary`) di kanan.
  2. Ringkasan statistik opsional (`UserStatCards`).
  3. `DataTableTemplate`:
     - Toolbar: Search input cekung, filter dropdown & `FilterChips`, `DataExportDropdown`, `ColumnVisibilityDropdown`.
     - Isi Tabel: Seluruh sel body menggunakan `font-normal` dengan pemisahan hierarki melalui warna teks.
     - Seleksi baris & `BulkActionsBar` untuk aksi massal.
     - `DataTablePagination` dan `DataTableEmptyState` saat data kosong.
  4. `ConfirmationModal` untuk konfirmasi aksi destruktif (hapus tunggal/massal).

### C. Admin Form (Create / Edit)
- **File Acuan**: `resources/js/pages/etraining/user/admin/create.tsx`, `resources/js/components/form-section.tsx`.
- **Struktur**:
  1. `Heading` judul dan deskripsi form.
  2. Kontainer `rounded-3xl` neumorphic card (`p-4.5 sm:p-8`).
  3. Pengelompokan field dengan `FormSection` (ikon `size-10 rounded-2xl` di kiri, judul & deskripsi, konten di kanan dengan `sm:pl-13`).
  4. Kontrol input standar: `Input` / `neuSurfaces.input`, `SearchableSelect`, `StatusRadioGroup`, `RichTextEditor`, serta `FormSheet` jika form dibuka dalam slide-over sheet.

### D. Admin Detail / Show
- **File Acuan**: `resources/js/pages/etraining/admin/task/grade.tsx`, `resources/js/pages/etraining/event/layouts/event-detail-layout.tsx`, `resources/js/components/detail-hero/detail-hero-template.tsx`.
- **Struktur**:
  1. Top bar: Tombol *Kembali* neumorphic (`ArrowLeft`, `font-medium`) di kiri + grup tombol aksi (`Edit`, `Publish`, `Hapus`, dll.) di kanan.
  2. Hero Banner Card (`DetailHeroTemplate`):
     - Tanpa kotak avatar ikon dekoratif besar agar fokus pada informasi.
     - Baris 1: Badge status / tipe semantik (`DetailHeroBadge` / `EventStatusBadge` / `TaskTypeBadge`).
     - Baris 2: Judul utama (`h1` dengan `font-bold tracking-tight`).
     - Baris 3: Metadata terstruktur berbasis `<dl>` (`DetailHeroPill.Text`, `DetailHeroPill.Link`, `DetailHeroPill.Copy`) menggunakan pasangan `Label: Nilai` (`text-xs font-normal`, label `text-slate-500`, nilai `text-slate-800`) tanpa bingkai pill/kotak berulang.
     - Slot kanan (`extra`) / bawah (`stats`): Opsional untuk metrik ringkas (`DetailHeroMetric`).
  3. Konten lanjutan dibungkus dengan `DetailPageContainer`.

---

## 8. Interaksi, Aksesibilitas & Penanganan Browser

- **Micro-interaction**: Elemen interaktif menggunakan transisi halus (`transition-all duration-200` / `duration-300`), sedikit terangkat saat hover (`hover:-translate-y-0.5` / `hover:-translate-y-1`), dan kembali ke posisi semula atau cekung saat ditekan (`active:translate-y-0` + `neuShadows.pressed`).
- **Aksesibilitas**:
  - Elemen card yang berfungsi sebagai tombol wajib memiliki `role="button"`, `tabIndex={0}`, dukungan `Enter`/`Space`, dan `aria-pressed`.
  - Fokus keyboard menggunakan `focus-visible:ring-[3px]` atau `neuColors.primaryRing`.
- **Browser Compatibility**: Input `date` dan `time` kustom menggunakan class `.no-native-calendar-icon` atau atribut `[data-custom-picker]` (didefinisikan di `resources/css/app.css`) agar ikon bawaan browser tidak tampil ganda dengan ikon Lucide.

---

## 9. Panduan Implementasi (Do's & Don'ts)

### Do's
- **Gunakan token `@/lib/theme`**: Selalu impor `neuSurfaces`, `neuColors`, `neuShadows`, atau `neuBadge` alih-alih menyalin ulang string shadow panjang.
- **Gunakan komponen template yang sudah ada**: Pakai `DataTableTemplate`, `DetailHeroTemplate`, `StatCard`, `FormSection`, dan `ConfirmationModal` untuk menjaga konsistensi.
- **Gunakan `font-normal` untuk data & metadata**: Pastikan sel tabel, badge, tanggal, kapasitas, dan deskripsi nyaman dipindai (*scannable*).
- **Jaga proporsi margin & padding**: Pastikan setiap *space* termanfaatkan dengan baik menggunakan ritme jarak yang konsisten (tidak terlalu renggang/kosong dan tidak terlalu sempit/sesak).

### Don'ts
- **Jangan menduplikasi informasi**: Hindari menaruh badge, ikon, atau kartu tambahan yang hanya mengulang data yang sudah jelas terlihat.
- **Jangan menggunakan `font-bold` / `font-semibold` secara berlebihan**: Jangan menebalkan teks di dalam sel tabel atau metadata sekunder.
- **Jangan membuang ruang dengan kotak berlapis (*box-in-box*) atau jarak yang tidak seimbang**: Hindari padding ganda atau margin/gap ekstrem yang membuat layout terasa kosong atau berhimpitan.
- **Jangan hardcode warna portal secara sembarangan**: Gunakan aksen biru (`#0041C0`) untuk E-Training dan teal (`#0D9488`) untuk LMS sesuai konteks route (`/t` vs `/l`).
- **Jangan mengabaikan tampilan mobile**: Selalu uji dan pastikan grid, tabel (`minWidth` + scroll horizontal yang aman), dan tombol aksi tetap rapi di layar kecil.
