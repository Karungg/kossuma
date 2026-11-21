import { Head, Link } from '@inertiajs/react';
import { HomeLayout } from '@/layouts/home-layout';
import { home } from '@/routes';
import { ArrowLeft, BookOpen, Calendar, Clock, Sparkles } from 'lucide-react';

interface ArticleItem {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    imageUrl: string;
}

const ARTICLES: ArticleItem[] = [
    {
        id: '1',
        title: 'Rahasia Ayam Ungkep Lengkuas Khas Bogor: Bumbu Rempah Meresap Hingga Tulang',
        excerpt:
            'Mengintip dapur Pawon Ibu Fatimah di Semplak, Bogor Barat, yang mempertahankan resep turun temurun lengkuas parut segar tanpa pengawet buatan.',
        category: 'Kisah UMKM',
        author: 'Pawon Ibu Fatimah',
        date: '12 Nov 2026',
        readTime: '4 mnt baca',
        imageUrl: '',
    },
    {
        id: '2',
        title: 'Tips Menyimpan Frozen Food Halal Agar Nutrisi & Kelezatan Tetap Terjaga',
        excerpt:
            'Panduan praktis menjaga suhu freezer optimal, cara mendiamkan di suhu ruang yang benar, serta cara menyajikan risol mayo agar tetap lumer dan krispi sempurna.',
        category: 'Tips Dapur',
        author: 'Dapur Ummi Salma',
        date: '08 Nov 2026',
        readTime: '3 mnt baca',
        imageUrl: '',
    },
    {
        id: '3',
        title: 'Perjalanan Kossuma Mengantarkan Puluhan UMKM Muslimah Meraih Sertifikasi Halal BPJPH',
        excerpt:
            'Kemandirian ekonomi berawal dari jaminan kehalalan produk. Simak bagaimana program pendampingan dan subsidi seleksi mutu koperasi Kossuma berjalan di Kota Bogor.',
        category: 'Kabar Koperasi',
        author: 'Pengurus Kossuma',
        date: '01 Nov 2026',
        readTime: '5 mnt baca',
        imageUrl: '',
    },
];

export default function Blog() {
    return (
        <HomeLayout>
            <Head title="Kabar &amp; Kisah Inspirasi - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Kabar, artikel, tips kuliner halal, dan kisah inspiratif perjalanan UMKM Muslimah binaan Kossuma Kota Bogor."
                />
            </Head>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
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
                        Blog
                    </span>
                </div>

                {/* Article Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {ARTICLES.map((article) => (
                        <article
                            key={article.id}
                            className="flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs"
                        >
                            <div>
                                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-gray-100">
                                    {article.imageUrl ? (
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className="text-xs font-medium text-gray-400">
                                            Foto Artikel
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2.5 p-5">
                                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                                        <span className="rounded-full bg-[#F0E6F5] px-2 py-0.5 font-bold text-[#7D3394]">
                                            {article.category}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{article.readTime}</span>
                                        </div>
                                    </div>

                                    <h2 className="line-clamp-2 text-base leading-snug font-bold text-gray-900">
                                        {article.title}
                                    </h2>

                                    <p className="line-clamp-3 text-xs leading-relaxed text-gray-600">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-50 p-5 pt-0 text-xs text-gray-500">
                                <span>{article.author}</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{article.date}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </HomeLayout>
    );
}
