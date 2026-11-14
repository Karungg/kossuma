import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function HeroBanner() {
    return (
        <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#F7F2F9] via-white to-gray-50 border border-[#E2C9EB]/50 shadow-[0_4px_24px_-4px_rgba(99,23,123,0.06)] p-6 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Content */}
                <div className="lg:col-span-7 flex flex-col gap-4 z-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7D3394] text-white text-xs font-bold tracking-wide shadow-xs">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>100% Halal, Segar &amp; Higienis</span>
                        </span>
                        <span className="text-xs font-bold text-[#7D3394] bg-[#F0E6F5] px-2.5 py-0.5 rounded-full">
                            Koperasi Berdaya
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[3rem] font-extrabold text-[#1F2937] tracking-tight">
                        Sajian Pangan Halal &amp; Praktis dari UMKM Muslimah Kota Bogor
                    </h1>

                    <p className="text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed">
                        Dukung kemandirian ekonomi keluarga dan nikmati aneka olahan frozen food, lauk siap saji, dan kue khas Bogor langsung dari dapur anggota koperasi berdaya.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                        <a
                            href="#katalog-produk"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#7D3394] text-white text-sm font-bold shadow-md cursor-pointer"
                        >
                            <span>Mulai Belanja</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Right Visual Showcase */}
                <div className="lg:col-span-5 relative flex justify-center items-center">
                    <div className="relative w-full max-w-[460px] aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden shadow-xl bg-gray-100 border border-gray-100">
                        <img
                            alt="Hidangan Kuliner Halal Khas UMKM Kossuma Bogor"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4iVBmfseP1OViE1CsMLZPsctdQdGBq_EpcPWhlfqHU6xEWdaGLWe0mPLQ3us-e6mpxa_68CjULovmeB5XGHLkUG_n1W9ow2BHJ3Z8c9evBfN6pU_FHPcXD1Q9hQMi7ESi4s_ugiEbf7mWp-q-nDQMqOwyq-jnpWLCmqKgZacv2MjTGbYaN_y-W9h625pA3Wmi-XKKXJjb7iioaX8m1fQLU7Uk-A77a1JuxvQPdMhg"
                            loading="eager"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

