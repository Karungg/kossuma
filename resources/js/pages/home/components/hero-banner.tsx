import { ArrowRight, CheckCircle2, Store } from 'lucide-react';

export function HeroBanner() {
    return (
        <section className="relative overflow-hidden rounded-[20px] border border-[#E2C9EB]/50 bg-gradient-to-br from-[#F7F2F9] via-white to-gray-50 p-6 shadow-[0_4px_24px_-4px_rgba(99,23,123,0.06)] md:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                {/* Left Content */}
                <div className="z-10 flex flex-col gap-4 lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7D3394] px-3 py-1 text-xs font-bold tracking-wide text-white shadow-xs">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                            <span>100% Halal, Segar &amp; Higienis</span>
                        </span>
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937] sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[3rem]">
                        Sajian Pangan Halal &amp; Praktis dari UMKM Muslimah
                        Kota Bogor
                    </h1>

                    <p className="max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                        Dukung kemandirian ekonomi keluarga dan nikmati aneka
                        olahan frozen food, lauk siap saji, dan kue khas Bogor
                        langsung dari dapur anggota koperasi berdaya.
                    </p>

                    <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
                        <a
                            href="#katalog-produk"
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-6 py-3.5 text-sm font-bold text-white shadow-md"
                        >
                            <span>Mulai Belanja</span>
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {/* Right Visual Showcase */}
                <div className="relative flex items-center justify-center lg:col-span-5">
                    <div className="flex aspect-[4/3] w-full max-w-[460px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 p-6 text-center text-gray-400 sm:aspect-square">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-[#7D3394] shadow-xs">
                            <Store className="h-8 w-8" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                            Pusat Belanja Halal Kossuma
                        </span>
                        <span className="max-w-xs text-xs text-gray-500">
                            Pilihan makanan siap saji, beku, dan kue basah khas
                            ibu-ibu pelaku UMKM se-Kota Bogor
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
