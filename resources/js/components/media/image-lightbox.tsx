import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
    ChevronLeft,
    ChevronRight,
    ImageOff,
    RefreshCw,
    RotateCcw,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StorefrontImage } from './storefront-image';

export type LightboxImageItem = {
    id: string;
    url: string;
    thumbnailUrl?: string;
    alt: string;
    label?: string;
};

type ImageLightboxProps = {
    images: LightboxImageItem[];
    open: boolean;
    initialIndex?: number;
    onOpenChange: (open: boolean) => void;
    onActiveIndexChange?: (index: number) => void;
};

type Point = {
    x: number;
    y: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;
const DOUBLE_CLICK_SCALE = 2.5;
const SWIPE_THRESHOLD_PX = 64;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function getPointerDistance(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function getPointerMidpoint(a: Point, b: Point): Point {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
    };
}

type LightboxCanvasProps = {
    images: LightboxImageItem[];
    initialIndex: number;
    onClose: () => void;
    onActiveIndexChange?: (index: number) => void;
};

function LightboxCanvas({
    images,
    initialIndex,
    onClose,
    onActiveIndexChange,
}: LightboxCanvasProps) {
    const safeInitialIndex = clamp(
        initialIndex,
        0,
        Math.max(0, images.length - 1),
    );
    const [activeIndex, setActiveIndex] = useState(safeInitialIndex);
    const [scale, setScale] = useState(MIN_SCALE);
    const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [imageStatus, setImageStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');
    const [retryKey, setRetryKey] = useState(0);

    const stageRef = useRef<HTMLDivElement>(null);
    const mainImgRef = useRef<HTMLImageElement>(null);
    const pointersRef = useRef<Map<number, Point>>(new Map());
    const dragOriginRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
        originOffsetX: number;
        originOffsetY: number;
        moved: boolean;
    } | null>(null);
    const pinchOriginRef = useRef<{
        distance: number;
        scale: number;
        midpoint: Point;
        originOffset: Point;
    } | null>(null);
    const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
        null,
    );

    const activeImage = images[activeIndex] ?? images[0];
    const hasMultiple = images.length > 1;

    const clampOffset = useCallback(
        (nextOffset: Point, nextScale: number): Point => {
            if (nextScale <= MIN_SCALE) {
                return { x: 0, y: 0 };
            }

            const stage = stageRef.current;
            const img = mainImgRef.current;

            if (!stage) {
                return nextOffset;
            }

            const stageRect = stage.getBoundingClientRect();
            const baseWidth =
                img && img.offsetWidth > 0
                    ? img.offsetWidth
                    : stageRect.width * 0.8;
            const baseHeight =
                img && img.offsetHeight > 0
                    ? img.offsetHeight
                    : stageRect.height * 0.8;

            const maxOffsetX = Math.max(
                0,
                (baseWidth * nextScale - stageRect.width) / 2 + 80,
            );
            const maxOffsetY = Math.max(
                0,
                (baseHeight * nextScale - stageRect.height) / 2 + 80,
            );

            return {
                x: clamp(nextOffset.x, -maxOffsetX, maxOffsetX),
                y: clamp(nextOffset.y, -maxOffsetY, maxOffsetY),
            };
        },
        [],
    );

    const resetTransform = useCallback(() => {
        setScale(MIN_SCALE);
        setOffset({ x: 0, y: 0 });
        setIsDragging(false);
        dragOriginRef.current = null;
        pinchOriginRef.current = null;
    }, []);

    const goToIndex = useCallback(
        (nextIndex: number) => {
            if (images.length === 0) {
                return;
            }

            const wrapped =
                ((nextIndex % images.length) + images.length) % images.length;
            setActiveIndex(wrapped);
            onActiveIndexChange?.(wrapped);
            resetTransform();
            setImageStatus('loading');
            setRetryKey(0);
        },
        [images.length, onActiveIndexChange, resetTransform],
    );

    const applyZoomAroundPoint = useCallback(
        (targetScale: number, clientX?: number, clientY?: number) => {
            const clampedScale = clamp(
                Math.round(targetScale * 100) / 100,
                MIN_SCALE,
                MAX_SCALE,
            );

            if (clampedScale <= MIN_SCALE) {
                setScale(MIN_SCALE);
                setOffset({ x: 0, y: 0 });

                return;
            }

            setScale((currentScale) => {
                if (
                    clientX !== undefined &&
                    clientY !== undefined &&
                    stageRef.current
                ) {
                    const rect = stageRef.current.getBoundingClientRect();
                    const relX = clientX - (rect.left + rect.width / 2);
                    const relY = clientY - (rect.top + rect.height / 2);
                    const ratio = clampedScale / currentScale;

                    setOffset((currentOffset) =>
                        clampOffset(
                            {
                                x: relX - (relX - currentOffset.x) * ratio,
                                y: relY - (relY - currentOffset.y) * ratio,
                            },
                            clampedScale,
                        ),
                    );
                } else {
                    setOffset((currentOffset) =>
                        clampOffset(currentOffset, clampedScale),
                    );
                }

                return clampedScale;
            });
        },
        [clampOffset],
    );

    const handleZoomIn = useCallback(() => {
        applyZoomAroundPoint(scale + ZOOM_STEP);
    }, [applyZoomAroundPoint, scale]);

    const handleZoomOut = useCallback(() => {
        applyZoomAroundPoint(scale - ZOOM_STEP);
    }, [applyZoomAroundPoint, scale]);

    useEffect(() => {
        const element = mainImgRef.current;

        if (element && element.complete) {
            if (element.naturalWidth > 0) {
                setImageStatus('loaded');
            }
        }
    }, [activeIndex, retryKey]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight' && hasMultiple) {
                event.preventDefault();
                goToIndex(activeIndex + 1);
            } else if (event.key === 'ArrowLeft' && hasMultiple) {
                event.preventDefault();
                goToIndex(activeIndex - 1);
            } else if (event.key === '+' || event.key === '=') {
                event.preventDefault();
                handleZoomIn();
            } else if (event.key === '-') {
                event.preventDefault();
                handleZoomOut();
            } else if (event.key === '0') {
                event.preventDefault();
                resetTransform();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        activeIndex,
        goToIndex,
        handleZoomIn,
        handleZoomOut,
        hasMultiple,
        resetTransform,
    ]);

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (imageStatus !== 'loaded') {
            return;
        }

        const delta = event.deltaY < 0 ? 0.35 : -0.35;
        applyZoomAroundPoint(scale + delta, event.clientX, event.clientY);
    };

    const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (imageStatus !== 'loaded') {
            return;
        }

        if (scale > MIN_SCALE) {
            resetTransform();
        } else {
            applyZoomAroundPoint(
                DOUBLE_CLICK_SCALE,
                event.clientX,
                event.clientY,
            );
        }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 && event.pointerType === 'mouse') {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        if (pointersRef.current.size === 2) {
            const [first, second] = Array.from(pointersRef.current.values());
            pinchOriginRef.current = {
                distance: Math.max(1, getPointerDistance(first, second)),
                scale,
                midpoint: getPointerMidpoint(first, second),
                originOffset: offset,
            };
            dragOriginRef.current = null;
            setIsDragging(true);

            return;
        }

        if (pointersRef.current.size === 1) {
            if (event.pointerType === 'touch') {
                const now = Date.now();
                const lastTap = lastTapRef.current;

                if (
                    lastTap &&
                    now - lastTap.time < 280 &&
                    Math.hypot(
                        event.clientX - lastTap.x,
                        event.clientY - lastTap.y,
                    ) < 36
                ) {
                    lastTapRef.current = null;

                    if (imageStatus === 'loaded') {
                        if (scale > MIN_SCALE) {
                            resetTransform();
                        } else {
                            applyZoomAroundPoint(
                                DOUBLE_CLICK_SCALE,
                                event.clientX,
                                event.clientY,
                            );
                        }
                    }

                    return;
                }

                lastTapRef.current = {
                    time: now,
                    x: event.clientX,
                    y: event.clientY,
                };
            }

            dragOriginRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                originOffsetX: offset.x,
                originOffsetY: offset.y,
                moved: false,
            };

            if (scale > MIN_SCALE) {
                setIsDragging(true);
            }
        }
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!pointersRef.current.has(event.pointerId)) {
            return;
        }

        pointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        if (pointersRef.current.size === 2 && pinchOriginRef.current) {
            const [first, second] = Array.from(pointersRef.current.values());
            const currentDistance = getPointerDistance(first, second);
            const currentMidpoint = getPointerMidpoint(first, second);
            const {
                distance: startDistance,
                scale: startScale,
                midpoint: startMidpoint,
                originOffset,
            } = pinchOriginRef.current;

            const nextScale = clamp(
                startScale * (currentDistance / startDistance),
                MIN_SCALE,
                MAX_SCALE,
            );
            const deltaX = currentMidpoint.x - startMidpoint.x;
            const deltaY = currentMidpoint.y - startMidpoint.y;

            setScale(nextScale);
            setOffset(
                clampOffset(
                    {
                        x: originOffset.x + deltaX,
                        y: originOffset.y + deltaY,
                    },
                    nextScale,
                ),
            );

            return;
        }

        const dragOrigin = dragOriginRef.current;

        if (!dragOrigin || dragOrigin.pointerId !== event.pointerId) {
            return;
        }

        const dx = event.clientX - dragOrigin.startX;
        const dy = event.clientY - dragOrigin.startY;

        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            dragOrigin.moved = true;
        }

        if (scale > MIN_SCALE) {
            setOffset(
                clampOffset(
                    {
                        x: dragOrigin.originOffsetX + dx,
                        y: dragOrigin.originOffsetY + dy,
                    },
                    scale,
                ),
            );
        }
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        const dragOrigin = dragOriginRef.current;

        if (
            dragOrigin &&
            dragOrigin.pointerId === event.pointerId &&
            scale === MIN_SCALE &&
            hasMultiple
        ) {
            const dx = event.clientX - dragOrigin.startX;
            const dy = event.clientY - dragOrigin.startY;

            if (
                Math.abs(dx) >= SWIPE_THRESHOLD_PX &&
                Math.abs(dx) > Math.abs(dy) * 1.4
            ) {
                goToIndex(dx < 0 ? activeIndex + 1 : activeIndex - 1);
            }
        }

        pointersRef.current.delete(event.pointerId);

        if (pointersRef.current.size < 2) {
            pinchOriginRef.current = null;
        }

        if (pointersRef.current.size === 0) {
            dragOriginRef.current = null;
            setIsDragging(false);
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const rawImageUrl = activeImage?.url?.trim() ?? '';
    const imageSrc =
        retryKey > 0 &&
        rawImageUrl !== '' &&
        !rawImageUrl.startsWith('data:') &&
        !rawImageUrl.startsWith('blob:')
            ? `${rawImageUrl}${rawImageUrl.includes('?') ? '&' : '?'}retry=${retryKey}`
            : rawImageUrl;

    const zoomPercent = Math.round(scale * 100);

    return (
        <div className="flex h-full w-full flex-col select-none">
            <div className="z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-black/75 px-4 py-3 text-white backdrop-blur-md sm:px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                    {hasMultiple && (
                        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                            {activeIndex + 1} / {images.length}
                        </span>
                    )}
                    <span className="truncate text-xs font-medium text-white/90 sm:text-sm">
                        {activeImage?.label ||
                            activeImage?.alt ||
                            'Pratinjau Foto'}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                    <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={
                            scale <= MIN_SCALE || imageStatus !== 'loaded'
                        }
                        aria-label="Perkecil gambar"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C9EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={resetTransform}
                        disabled={imageStatus !== 'loaded'}
                        aria-label="Atur ulang perbesaran ke 100 persen"
                        className="inline-flex h-9 min-w-[56px] cursor-pointer items-center justify-center rounded-xl bg-white/10 px-2.5 text-xs font-semibold text-white tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C9EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {zoomPercent}%
                    </button>

                    <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={
                            scale >= MAX_SCALE || imageStatus !== 'loaded'
                        }
                        aria-label="Perbesar gambar"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C9EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={resetTransform}
                        disabled={
                            scale === MIN_SCALE &&
                            offset.x === 0 &&
                            offset.y === 0
                        }
                        aria-label="Atur ulang posisi dan ukuran gambar"
                        className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C9EB] disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    <div className="mx-1 h-5 w-px bg-white/15" />

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup pratinjau foto"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/15 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C9EB]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                {hasMultiple && (
                    <button
                        type="button"
                        onClick={() => goToIndex(activeIndex - 1)}
                        aria-label="Foto sebelumnya"
                        className="absolute left-3 z-20 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C9EB] sm:left-5"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}

                <div
                    ref={stageRef}
                    onWheel={handleWheel}
                    onDoubleClick={handleDoubleClick}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    className={`flex h-full w-full touch-none items-center justify-center overflow-hidden p-4 sm:p-8 ${
                        scale > MIN_SCALE
                            ? isDragging
                                ? 'cursor-grabbing'
                                : 'cursor-grab'
                            : 'cursor-zoom-in'
                    }`}
                >
                    {imageSrc === '' || imageStatus === 'error' ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 px-8 py-10 text-center text-white backdrop-blur-sm">
                            <ImageOff className="h-9 w-9 text-white/60" />
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold text-white">
                                    {imageSrc === ''
                                        ? 'Foto belum tersedia'
                                        : 'Foto gagal dimuat'}
                                </span>
                                <span className="text-xs text-white/70">
                                    Periksa koneksi internet Anda lalu coba muat
                                    ulang.
                                </span>
                            </div>
                            {imageSrc !== '' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageStatus('loading');
                                        setRetryKey((prev) => prev + 1);
                                    }}
                                    className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#7D3394] px-4 py-2 text-xs font-bold text-white"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Muat ulang</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {imageStatus === 'loading' && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="h-64 w-64 animate-pulse rounded-2xl bg-white/10 sm:h-96 sm:w-96" />
                                </div>
                            )}

                            <img
                                ref={mainImgRef}
                                key={`${activeImage?.id ?? activeIndex}::${retryKey}`}
                                src={imageSrc}
                                alt={activeImage?.alt ?? 'Foto produk'}
                                draggable={false}
                                onLoad={() => setImageStatus('loaded')}
                                onError={() => setImageStatus('error')}
                                style={{
                                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
                                    transition: isDragging
                                        ? 'none'
                                        : 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                                className={`max-h-full max-w-full rounded-lg object-contain will-change-transform ${
                                    imageStatus === 'loaded'
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                }`}
                            />
                        </>
                    )}
                </div>

                {hasMultiple && (
                    <button
                        type="button"
                        onClick={() => goToIndex(activeIndex + 1)}
                        aria-label="Foto berikutnya"
                        className="absolute right-3 z-20 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2C9EB] sm:right-5"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="z-20 flex flex-col items-center gap-2.5 border-t border-white/10 bg-black/75 px-4 py-3 backdrop-blur-md">
                {hasMultiple && (
                    <div className="flex max-w-full items-center gap-2 overflow-x-auto py-0.5">
                        {images.map((item, idx) => {
                            const isActive = idx === activeIndex;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => goToIndex(idx)}
                                    aria-label={`Lihat foto ${idx + 1}`}
                                    className={`h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-opacity focus:outline-none sm:h-14 sm:w-14 ${
                                        isActive
                                            ? 'border-transparent opacity-100 ring-2 ring-[#E2C9EB]'
                                            : 'border-white/20 opacity-60'
                                    }`}
                                >
                                    <StorefrontImage
                                        src={item.thumbnailUrl || item.url}
                                        fallbackSrc={item.url}
                                        alt={item.alt}
                                        compact
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}

                <span className="text-[11px] text-white/65">
                    {scale > MIN_SCALE
                        ? 'Tahan dan geser untuk melihat detail foto • Klik dua kali untuk mengatur ulang'
                        : 'Klik dua kali, gulir, atau cubit untuk memperbesar foto'}
                </span>
            </div>
        </div>
    );
}

export function ImageLightbox({
    images,
    open,
    initialIndex = 0,
    onOpenChange,
    onActiveIndexChange,
}: ImageLightboxProps) {
    if (images.length === 0) {
        return null;
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/92 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    className="fixed inset-0 z-50 flex h-dvh w-screen flex-col outline-none"
                >
                    <DialogPrimitive.Title className="sr-only">
                        Pratinjau Foto Produk
                    </DialogPrimitive.Title>

                    {open && (
                        <LightboxCanvas
                            key={`${initialIndex}-${images.length}`}
                            images={images}
                            initialIndex={initialIndex}
                            onClose={() => onOpenChange(false)}
                            onActiveIndexChange={onActiveIndexChange}
                        />
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
