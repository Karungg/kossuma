import { Plus } from 'lucide-react';
import type { RecommendationProduct } from '../types';

interface CartRecommendationsProps {
    items: RecommendationProduct[];
    onAddToCart: (product: RecommendationProduct) => void;
}

export function CartRecommendations({
    items,
    onAddToCart,
}: CartRecommendationsProps) {
    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                    Pelengkap Belanja Favorit
                </h3>
                <a
                    href="#katalog"
                    className="text-xs sm:text-sm font-semibold text-[#7D3394] cursor-pointer"
                >
                    Lihat Lainnya
                </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {items.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl p-3 shadow-xs border border-gray-100 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 flex items-center justify-center">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.imageAlt}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs font-medium">Foto Produk</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-[#7D3394] font-bold truncate">
                                    {product.storeName}
                                </span>
                                <h4 className="text-xs sm:text-sm text-gray-900 font-semibold line-clamp-1">
                                    {product.name}
                                </h4>
                                <span className="text-sm font-extrabold text-[#DC2626]">
                                    {formatRupiah(product.price)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => onAddToCart(product)}
                            className="mt-2.5 w-full py-1.5 rounded-lg bg-[#F0E6F5] text-[#7D3394] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Keranjang</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

