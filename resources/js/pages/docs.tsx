import { Head, Link } from '@inertiajs/react';
import { StorefrontLayout } from '@/layouts/storefront-layout';
import { home } from '@/routes';
import {
    ArrowLeft,
    CheckCircle2,
    FileCheck2,
    HelpCircle,
    Info,
    MessageCircle,
    Scale,
    ShieldAlert,
} from 'lucide-react';

export default function Docs() {
    return (
        <StorefrontLayout>
            <Head title="Dokumentasi &amp; Standar Mutu - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Panduan kurasi produk, standar sertifikasi halal BPJPH/MUI, dan prosedur kemitraan UMKM kuliner Kossuma Kota Bogor."
                />
            </Head>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
                {/* Navigation Bar */}
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-2xs flex items-center justify-between">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-[#7D3394] text-xs font-bold shrink-0 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali ke Katalog</span>
                    </Link>
                    <span className="text-xs font-semibold text-gray-500">
                        Dokumentasi &amp; Regulasi
                    </span>
                </div>

                {/* Header Banner */}
                <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-100 shadow-xs flex flex-col gap-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E6F5] text-[#7D3394] text-xs font-bold w-fit">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Standar Mutu &amp; Kepatuhan Syariat</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Dokumentasi Kurasi &amp; Panduan Mitra UMKM
                    </h1>
                    <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                        Transparansi adalah fondasi kepercayaan kami. Pelajari standar higienitas, verifikasi halal, serta pedoman bergabung menjadi toko mitra binaan Kossuma Kota Bogor.
                    </p>
                </div>

                {/* Key Documentation Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Block 1: Sertifikasi Halal */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">
                                    Verifikasi Halal BPJPH / MUI
                                </h3>
                                <span className="text-xs text-gray-500">
                                    Kewajiban Mutlak Seluruh Produk
                                </span>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Semua produk pangan, bumbu, dan olahan daging wajib memiliki sertifikat halal resmi atau dalam proses pendampingan halal PPH (Pendamping Proses Produk Halal) binaan Kossuma.
                        </p>

                        <ul className="flex flex-col gap-2 text-xs text-gray-600 pt-1">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Pengecekan kehalalan asal bahan hewani (daging, ayam, minyak)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Bebas dari bahan kritis najis dan alkohol</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Fasilitas dapur terpisah dan terverifikasi suci</span>
                            </li>
                        </ul>
                    </div>

                    {/* Block 2: Higienitas & Kemasan Frozen */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center shrink-0">
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">
                                    Standar Kemasan &amp; Daya Simpan
                                </h3>
                                <span className="text-xs text-gray-500">
                                    Perlindungan Kualitas Pengiriman
                                </span>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Produk beku (frozen food) wajib dikemas menggunakan plastik vakum food-grade atau seal kedap udara berlabel tanggal produksi dan masa kadaluarsa (best before).
                        </p>

                        <ul className="flex flex-col gap-2 text-xs text-gray-600 pt-1">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                <span>Kemasan vakum tebal minimal 75 mikron</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                <span>Wajib beku sempurna minimal 12 jam sebelum kirim</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                <span>Petunjuk penyajian dan penyimpanan tertera jelas</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* FAQ & Mitra Join Section */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#7D3394]">
                            <HelpCircle className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900">
                                Ingin Mendaftarkan Produk UMKM Anda?
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                            Bergabunglah bersama komunitas perempuan pengusaha kuliner Kota Bogor. Dapatkan fasilitas kurasi, pendampingan sertifikasi halal, dan akses pasar digital terintegrasi.
                        </p>
                    </div>

                    <a
                        href="https://wa.me/6281289005544?text=Halo%20Admin%20Kossuma%2C%20saya%20tertarik%20mendaftarkan%20produk%20UMKM%20ke%20koperasi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-xl bg-[#7D3394] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>Konsultasi Kurasi UMKM</span>
                    </a>
                </div>
            </div>
        </StorefrontLayout>
    );
}
