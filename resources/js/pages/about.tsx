import { Head, Link } from "@inertiajs/react";
import { StorefrontLayout } from "@/layouts/storefront-layout";
import { home } from "@/routes";
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    HeartHandshake,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";

export default function About() {
    return (
        <StorefrontLayout>
            <Head title="Tentang Kami - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Tentang Kossuma Kota Bogor — Koperasi Usaha Persaudaraan Muslimah pemberdaya produk kuliner halal dan UMKM perempuan di Kota Bogor."
                />
            </Head>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-10">
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
                        Tentang Kossuma
                    </span>
                </div>

                {/* Editorial Hero Section */}
                <section className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-xs flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    <div className="flex-1 flex flex-col gap-4">
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Mewadahi Kuliner Halal &amp; Kemandirian UMKM
                            Muslimah Kota Bogor
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            Kossuma lahir sebagai ikhtiar gotong royong para
                            pengusaha kuliner muslimah di Kota Hujan untuk
                            menghadirkan produk pangan halal, lezat, higienis,
                            serta berdaya saing tinggi. Kami membina puluhan
                            pelaku usaha rumahan mulai dari standarisasi mutu,
                            sertifikasi halal BPJPH/MUI, hingga pemasaran
                            digital bersama.
                        </p>
                    </div>

                    <div className="w-full lg:w-96 aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center shrink-0">
                        <Users className="w-10 h-10 text-gray-300" />
                        <span className="text-xs font-semibold text-gray-500">
                            Dokumentasi UMKM Kossuma
                        </span>
                        <span className="text-[11px] text-gray-400">
                            Pemberdayaan kuliner halal perempuan Kota Bogor
                        </span>
                    </div>
                </section>

                {/* 4 Core Pillars */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">
                            100% Halal Terverifikasi
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Seluruh bahan baku dan proses produksi dipastikan
                            memenuhi standar syariat halal BPJPH dan MUI.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center">
                            <HeartHandshake className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">
                            Pemberdayaan Nyata
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Mendukung kemandirian finansial ibu rumah tangga dan
                            pelaku UMKM lokal berbasis kekeluargaan koperasi.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center">
                            <Award className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">
                            Kurasi Higienis &amp; Mutu
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Setiap kemasan frozen food dan kuliner melewati uji
                            rasa, higienitas, dan daya simpan pangan aman.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs flex flex-col gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">
                            Jaringan Multi-Toko
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Memudahkan warga Kota &amp; Kabupaten Bogor memesan
                            berbagai kuliner UMKM dalam satu keranjang pesanan.
                        </p>
                    </div>
                </section>
            </div>
        </StorefrontLayout>
    );
}
