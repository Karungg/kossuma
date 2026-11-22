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
            className="flex w-full flex-col gap-6 border-t border-gray-200 pt-8"
        >
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-extrabold tracking-tight text-[#1F2937] sm:text-xl">
                    Ulasan Pembeli
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">
                    Pendapat pelanggan yang sudah memesan produk ini.
                </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                {/* Ringkasan Rating */}
                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 lg:col-span-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Star className="h-7 w-7 fill-amber-500 text-amber-500" />
                            <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
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

                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 text-xs text-gray-600">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter(
                                (item) => item.rating === star,
                            ).length;
                            const percent =
                                reviews.length > 0
                                    ? Math.round((count / reviews.length) * 100)
                                    : 0;

                            return (
                                <div
                                    key={star}
                                    className="flex items-center gap-2"
                                >
                                    <span className="w-16 shrink-0 font-medium">
                                        Bintang {star}
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-[#7D3394]"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="w-9 text-right font-semibold tabular-nums">
                                        {percent}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daftar Ulasan */}
                <div className="flex flex-col gap-4 lg:col-span-8">
                    {reviews.map((rev) => (
                        <article
                            key={rev.id}
                            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map(
                                            (_, idx) => (
                                                <Star
                                                    key={idx}
                                                    className={`h-4 w-4 ${
                                                        idx < rev.rating
                                                            ? 'fill-amber-500 text-amber-500'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ),
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        •
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {rev.date}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {rev.variant}
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0E6F5] text-[#7D3394]">
                                    <User className="h-4 w-4" />
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

                            <p className="text-sm leading-relaxed text-gray-700">
                                {rev.comment}
                            </p>

                            {rev.adminReply && (
                                <div className="mt-1 flex flex-col gap-1 border-l-2 border-[#E2C9EB] pl-3">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-semibold text-[#7D3394]">
                                            Balasan Kossuma
                                        </span>
                                        {rev.adminRepliedAt && (
                                            <span className="text-gray-400">
                                                • {rev.adminRepliedAt}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                                        {rev.adminReply}
                                    </p>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
