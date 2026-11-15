import { CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { about, blog, docs } from '@/routes';

export function CartFooter() {
    return (
        <footer className="w-full bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.02)] mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Info */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-2xl text-[#7D3394] tracking-tight">
                                Kossuma
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                            Koperasi Usaha Persaudaraan Muslimah Kota Bogor menghadirkan platform digital belanja produk halal dan kuliner khas UMKM perempuan tangguh di Kota Hujan.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7D3394] pt-1">
                            <Link href={about()} className="cursor-pointer">
                                Tentang Kami
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href={blog()} className="cursor-pointer">
                                Blog &amp; Kabar
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href={docs()} className="cursor-pointer">
                                Panduan
                            </Link>
                        </div>
                    </div>

                    {/* Commitments */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                            Jaminan &amp; Komitmen
                        </h4>
                        <ul className="flex flex-col gap-2 text-xs sm:text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                <span>Sertifikasi Halal Terverifikasi BPJPH/MUI</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                <span>Higienis &amp; Bahan Berkualitas Segar</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                <span>Pemberdayaan Ekonomi Muslimah</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                <span>Standar Mutu Rasa Tradisional</span>
                            </li>
                        </ul>
                    </div>

                    {/* Address & Hours */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                            Sekretariat &amp; Gerai
                        </h4>
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                            <MapPin className="w-4 h-4 text-[#7D3394] shrink-0 mt-0.5" />
                            <span>
                                Jl. Pajajaran No. 42, Kel. Baranangsiang, Kec. Bogor Timur, Kota Bogor, Jawa Barat 16143
                            </span>
                        </div>
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-[#7D3394] shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-gray-900">Jam Layanan Gerai:</span>
                                <br />
                                Senin - Sabtu: 08.00 - 17.00 WIB
                            </div>
                        </div>
                    </div>

                    {/* Customer Service */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                            Layanan Pelanggan
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Pusat Bantuan &amp; Pemesanan Katering UMKM:
                        </p>
                        <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
                            <a
                                href="https://wa.me/6281289005544"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#7D3394] font-bold cursor-pointer"
                            >
                                <Phone className="w-4 h-4" />
                                <span>WhatsApp: +62 812-8900-5544</span>
                            </a>
                            <a
                                href="mailto:salam@kossumabogor.id"
                                className="flex items-center gap-2 text-gray-600 cursor-pointer"
                            >
                                <Mail className="w-4 h-4" />
                                <span>Email: salam@kossumabogor.id</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>© 2025 Koperasi Usaha Persaudaraan Muslimah (Kossuma) Kota Bogor. Hak Cipta Dilindungi.</p>
                </div>
            </div>
        </footer>
    );
}

