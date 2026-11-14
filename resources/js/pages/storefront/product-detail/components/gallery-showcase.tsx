import { useState } from 'react';
import { CheckCircle2, Leaf, Package } from 'lucide-react';
import type { ProductImage } from '../types';

interface GalleryShowcaseProps {
    images: ProductImage[];
}

export function GalleryShowcase({ images }: GalleryShowcaseProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const activeImage = images[activeImageIndex] || images[0];

    return (
        <div className="flex flex-col gap-4">
            {/* Main Primary Showcase Image (1:1 Aspect Ratio) */}
            <div className="w-full bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 aspect-square relative flex items-center justify-center">
                <img
                    src={activeImage.url}
                    alt={activeImage.alt}
                    className="w-full h-full object-cover transition-all duration-300"
                />
            </div>

            {/* Thumbnail Selector Row */}
            <div className="grid grid-cols-4 gap-2.5">
                {images.map((img, idx) => {
                    const isActive = idx === activeImageIndex;

                    return (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`aspect-square rounded-xl overflow-hidden bg-white shadow-2xs focus:outline-none cursor-pointer border ${
                                isActive
                                    ? 'ring-2 ring-[#7D3394] border-transparent shadow-sm'
                                    : 'border-gray-200'
                            }`}
                        >
                            <img
                                src={img.url}
                                alt={img.alt}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    );
                })}
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-3 rounded-xl bg-white border border-gray-100 flex flex-col items-center text-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-[#7D3394]" />
                    <span className="font-bold text-xs text-gray-900">100% Halal LPPOM</span>
                    <span className="text-[10px] text-gray-500">Terverifikasi BPJPH</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-100 flex flex-col items-center text-center gap-1 shadow-2xs">
                    <Package className="w-5 h-5 text-[#7D3394]" />
                    <span className="font-bold text-xs text-gray-900">Vakum Higienis</span>
                    <span className="text-[10px] text-gray-500">Food Grade Sealed</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-100 flex flex-col items-center text-center gap-1 shadow-2xs">
                    <Leaf className="w-5 h-5 text-[#7D3394]" />
                    <span className="font-bold text-xs text-gray-900">Tanpa Pengawet</span>
                    <span className="text-[10px] text-gray-500">Rempah Murni Bogor</span>
                </div>
            </div>
        </div>
    );
}

