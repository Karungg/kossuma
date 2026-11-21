import { ImageOff, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type StorefrontImageProps = {
    src?: string | null;
    fallbackSrc?: string | null;
    alt: string;
    className?: string;
    imgClassName?: string;
    priority?: boolean;
    compact?: boolean;
    allowRetry?: boolean;
    emptyLabel?: string;
    errorLabel?: string;
    onLoadSuccess?: () => void;
    onLoadFailure?: () => void;
};

type InnerProps = {
    resolvedSrc: string;
    fallbackSrc: string;
    alt: string;
    className?: string;
    imgClassName?: string;
    priority: boolean;
    compact: boolean;
    allowRetry: boolean;
    errorLabel: string;
    onRetry: () => void;
    onLoadSuccess?: () => void;
    onLoadFailure?: () => void;
};

function StorefrontImageInner({
    resolvedSrc,
    fallbackSrc,
    alt,
    className,
    imgClassName,
    priority,
    compact,
    allowRetry,
    errorLabel,
    onRetry,
    onLoadSuccess,
    onLoadFailure,
}: InnerProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [activeSrc, setActiveSrc] = useState(resolvedSrc);
    const [usedFallback, setUsedFallback] = useState(false);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        'loading',
    );

    useEffect(() => {
        const element = imgRef.current;

        if (element && element.complete) {
            if (element.naturalWidth > 0) {
                setStatus('loaded');
                onLoadSuccess?.();
            } else {
                setStatus('error');
            }
        }
    }, [activeSrc, onLoadSuccess]);

    const handleLoad = () => {
        setStatus('loaded');
        onLoadSuccess?.();
    };

    const handleError = () => {
        if (!usedFallback && fallbackSrc !== '' && fallbackSrc !== activeSrc) {
            setUsedFallback(true);
            setActiveSrc(fallbackSrc);
            setStatus('loading');

            return;
        }

        setStatus('error');
        onLoadFailure?.();
    };

    return (
        <div
            className={cn(
                'relative h-full w-full overflow-hidden bg-gray-100',
                className,
            )}
        >
            {status === 'loading' && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 animate-pulse bg-gray-200/80"
                />
            )}

            {status === 'error' ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gray-100 p-3 text-center text-gray-400">
                    <ImageOff
                        className={cn(
                            'shrink-0 text-gray-300',
                            compact ? 'h-4 w-4' : 'h-6 w-6',
                        )}
                    />
                    {!compact && (
                        <span className="text-xs font-normal text-gray-400">
                            {errorLabel}
                        </span>
                    )}
                    {allowRetry && !compact && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onRetry();
                            }}
                            className="mt-1 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394]"
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>Muat ulang</span>
                        </button>
                    )}
                </div>
            ) : (
                <img
                    ref={imgRef}
                    src={activeSrc}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : 'auto'}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        'h-full w-full object-cover transition-opacity duration-200',
                        status === 'loaded' ? 'opacity-100' : 'opacity-0',
                        imgClassName,
                    )}
                />
            )}
        </div>
    );
}

export function StorefrontImage({
    src,
    fallbackSrc,
    alt,
    className,
    imgClassName,
    priority = false,
    compact = false,
    allowRetry = false,
    emptyLabel = 'Belum ada foto',
    errorLabel = 'Foto gagal dimuat',
    onLoadSuccess,
    onLoadFailure,
}: StorefrontImageProps) {
    const [retryCount, setRetryCount] = useState(0);

    const normalizedSrc = typeof src === 'string' ? src.trim() : '';
    const normalizedFallback =
        typeof fallbackSrc === 'string' ? fallbackSrc.trim() : '';
    const primarySrc = normalizedSrc || normalizedFallback;

    if (primarySrc === '') {
        return (
            <div
                className={cn(
                    'flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gray-100 p-3 text-center text-gray-400',
                    className,
                )}
            >
                <ImageOff
                    className={cn(
                        'shrink-0 text-gray-300',
                        compact ? 'h-4 w-4' : 'h-6 w-6',
                    )}
                />
                {!compact && (
                    <span className="text-xs font-normal text-gray-400">
                        {emptyLabel}
                    </span>
                )}
            </div>
        );
    }

    const retryableSrc =
        retryCount > 0 &&
        !primarySrc.startsWith('data:') &&
        !primarySrc.startsWith('blob:')
            ? `${primarySrc}${primarySrc.includes('?') ? '&' : '?'}retry=${retryCount}`
            : primarySrc;

    return (
        <StorefrontImageInner
            key={`${primarySrc}::${normalizedFallback}::${retryCount}`}
            resolvedSrc={retryableSrc}
            fallbackSrc={normalizedFallback}
            alt={alt}
            className={className}
            imgClassName={imgClassName}
            priority={priority}
            compact={compact}
            allowRetry={allowRetry}
            errorLabel={errorLabel}
            onRetry={() => setRetryCount((prev) => prev + 1)}
            onLoadSuccess={onLoadSuccess}
            onLoadFailure={onLoadFailure}
        />
    );
}
