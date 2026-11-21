import { CheckCircle2, Leaf, Package, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { ImageLightbox, StorefrontImage } from '@/components/media';
import type { ProductImage } from '../types';

interface GalleryShowcaseProps {
    images: ProductImage[];
}

export function GalleryShowcase({ images }: GalleryShowcaseProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const safeIndex =
        images.length > 0 ? Math.min(activeImageIndex, images.length - 1) : 0;
    const activeImage = images[safeIndex];
    const hasActiveImageUrl = Boolean(activeImage?.url?.trim());

    const handleOpenLightbox = () => {
        if (hasActiveImageUrl) {
            setIsLightboxOpen(true);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
                {hasActiveImageUrl ? (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={handleOpenLightbox}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleOpenLightbox();
                            }
                        }}
                        aria-label={`Perbesar foto ${activeImage.alt}`}
                        className="relative h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394]"
                    >
                        <StorefrontImage
                            src={activeImage.url}
                            fallbackSrc={activeImage.thumbnailUrl}
                            alt={activeImage.alt}
                            priority
                            allowRetry
                            emptyLabel="Foto Produk"
                        />

                        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xs">
                            <ZoomIn className="h-3.5 w-3.5" />
                            <span>Perbesar</span>
                        </span>
                    </div>
                ) : (
                    <StorefrontImage
                        src=""
                        alt="Foto Produk"
                        emptyLabel="Belum ada foto produk"
                    />
                )}
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2.5">
                    {images.map((img, idx) => {
                        const isActive = idx === safeIndex;

                        return (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => setActiveImageIndex(idx)}
                                aria-label={`Pilih foto ${idx + 1}: ${img.alt}`}
                                className={`aspect-square cursor-pointer overflow-hidden rounded-xl border bg-white shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394] ${
                                    isActive
                                        ? 'border-transparent shadow-sm ring-2 ring-[#7D3394]'
                                        : 'border-gray-200'
                                }`}
                            >
                                <StorefrontImage
                                    src={img.thumbnailUrl || img.url}
                                    fallbackSrc={img.url}
                                    alt={img.alt}
                                    compact
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-3 text-center shadow-2xs">
                    <CheckCircle2 className="h-5 w-5 text-[#7D3394]" />
                    <span className="text-xs font-bold text-gray-900">
                        100% Halal LPPOM
                    </span>
                    <span className="text-[10px] text-gray-500">
                        Terverifikasi BPJPH
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-3 text-center shadow-2xs">
                    <Package className="h-5 w-5 text-[#7D3394]" />
                    <span className="text-xs font-bold text-gray-900">
                        Vakum Higienis
                    </span>
                    <span className="text-[10px] text-gray-500">
                        Kemasan Rapat &amp; Bersih
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-3 text-center shadow-2xs">
                    <Leaf className="h-5 w-5 text-[#7D3394]" />
                    <span className="text-xs font-bold text-gray-900">
                        Tanpa Pengawet
                    </span>
                    <span className="text-[10px] text-gray-500">
                        Rempah Murni Bogor
                    </span>
                </div>
            </div>

            <ImageLightbox
                images={images.map((item) => ({
                    id: item.id,
                    url: item.url,
                    thumbnailUrl: item.thumbnailUrl,
                    alt: item.alt,
                    label: item.label,
                }))}
                open={isLightboxOpen}
                initialIndex={safeIndex}
                onOpenChange={setIsLightboxOpen}
                onActiveIndexChange={setActiveImageIndex}
            />
        </div>
    );
}
