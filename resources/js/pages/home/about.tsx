import { Head, Link } from '@inertiajs/react';
import { HomeLayout } from '@/layouts/home-layout';
import { home } from '@/routes';
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
} from 'lucide-react';

export default function About() {
    return (
        <HomeLayout>
            <Head title="Tentang Kami - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Tentang Kossuma Kota Bogor — Koperasi Usaha Persaudaraan Muslimah pemberdaya produk kuliner halal dan UMKM perempuan di Kota Bogor."
                />
            </Head>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-2xs">
                    <Link
                        href={home()}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-[#7D3394]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Katalog</span>
                    </Link>
                    <span className="text-xs font-semibold text-gray-500">
                        Tentang Kossuma
                    </span>
                </div>

                {/* Editorial Hero Section */}
                <section className="flex flex-col items-center gap-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-xs sm:p-12 lg:flex-row lg:gap-12">
                    <div className="flex flex-1 flex-col gap-4">
                        <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Mewadahi Kuliner Halal &amp; Kemandirian UMKM
                            Muslimah Kota Bogor
                        </h1>
                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                            Kossuma lahir sebagai ikhtiar gotong royong para
                            pengusaha kuliner muslimah di Kota Hujan untuk
                            menghadirkan produk pangan halal, lezat, higienis,
                            serta berdaya saing tinggi. Kami membina puluhan
                            pelaku usaha rumahan mulai dari standarisasi mutu,
                            sertifikasi halal BPJPH/MUI, hingga pemasaran
                            digital bersama.
                        </p>
                    </div>

                    <div className="flex aspect-[4/3] w-full shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 p-6 text-center text-gray-400 lg:w-96">
                        <Users className="h-10 w-10 text-gray-300" />
                        <span className="text-xs font-semibold text-gray-500">
                            Dokumentasi UMKM Kossuma
                        </span>
                        <span className="text-[11px] text-gray-400">
                            Pemberdayaan kuliner halal perempuan Kota Bogor
                        </span>
                    </div>
                </section>

                {/* 4 Core Pillars */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-5 shadow-2xs">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0E6F5] text-[#7D3394]">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">
                            100% Halal Terverifikasi
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-500">
                            Seluruh bahan baku dan proses produksi dipastikan
                            memenuhi standar syariat halal BPJPH dan MUI.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-5 shadow-2xs">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0E6F5] text-[#7D3394]">
                            <HeartHandshake className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Pemberdayaan Nyata
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-500">
                            Mendukung kemandirian finansial ibu rumah tangga dan
                            pelaku UMKM lokal berbasis kekeluargaan koperasi.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-5 shadow-2xs">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0E6F5] text-[#7D3394]">
                            <Award className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Kurasi Higienis &amp; Mutu
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-500">
                            Setiap kemasan frozen food dan kuliner melewati uji
                            rasa, higienitas, dan daya simpan pangan aman.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-5 shadow-2xs">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0E6F5] text-[#7D3394]">
                            <Users className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Jaringan Multi-Toko
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-500">
                            Memudahkan warga Kota &amp; Kabupaten Bogor memesan
                            berbagai kuliner UMKM dalam satu keranjang pesanan.
                        </p>
                    </div>
                </section>
            </div>
        </HomeLayout>
    );
}
