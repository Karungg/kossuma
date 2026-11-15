import { Star, User } from 'lucide-react';
import type { ProductReview } from '../types';

interface ProductReviewsProps {
    rating: number;
    reviewCount: number;
    reviews: ProductReview[];
}

export function ProductReviews({
    rating,
    reviewCount,
    reviews,
}: ProductReviewsProps) {
    return (
        <section
            id="ulasan-produk"
            className="w-full pt-8 border-t border-gray-200 flex flex-col gap-6"
        >
            <div className="flex flex-col gap-1">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937] tracking-tight">
                    Ulasan Pembeli
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                    Pendapat pelanggan yang sudah memesan produk ini.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Ringkasan Rating */}
                <div className="lg:col-span-4 p-5 rounded-xl bg-white border border-gray-200 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-7 h-7 fill-amber-500 text-amber-500" />
                            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                                {rating.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">
                                dari 5.0
                            </span>
                            <span className="text-xs text-gray-500">
                                Berdasarkan {reviewCount} ulasan
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="w-14 shrink-0 font-medium">Bintang 5</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#7D3394] w-[92%] rounded-full" />
                            </div>
                            <span className="w-8 text-right font-semibold">92%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-14 shrink-0 font-medium">Bintang 4</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#7D3394] w-[8%] rounded-full" />
                            </div>
                            <span className="w-8 text-right font-semibold">8%</span>
                        </div>
                    </div>
                </div>

                {/* Daftar Ulasan */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {reviews.map((rev) => (
                        <article
                            key={rev.id}
                            className="p-4 sm:p-5 rounded-xl bg-white border border-gray-200 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <Star
                                                key={idx}
                                                className={`w-4 h-4 ${
                                                    idx < rev.rating
                                                        ? 'fill-amber-500 text-amber-500'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">
                                        {rev.date}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {rev.variant}
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#F0E6F5] text-[#7D3394] flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">
                                        {rev.authorName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {rev.authorLocation}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 leading-relaxed">
                                {rev.comment}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
