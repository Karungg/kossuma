import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Eye,
    ImagePlus,
    Star,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ImageLightbox, StorefrontImage } from '@/components/media';
import {
    type ExistingFileItem,
    type FileValidationError,
    formatFileSize,
} from '@/types/file-upload';

type GalleryEntry =
    | {
          kind: 'existing';
          key: string;
          index: number;
          url: string;
          thumbnailUrl: string;
          name: string;
          sizeText: string | null;
      }
    | {
          kind: 'new';
          key: string;
          index: number;
          url: string;
          thumbnailUrl: string;
          name: string;
          sizeText: string;
      };

type Props = {
    existingImages: ExistingFileItem[];
    onExistingImagesChange: (images: ExistingFileItem[]) => void;
    files: File[];
    onFilesChange: (files: File[]) => void;
    primaryKey: string | null;
    onPrimaryKeyChange: (key: string | null) => void;
    maxFiles?: number;
    maxSizeBytes?: number;
    disabled?: boolean;
    error?: string;
    dataTest?: string;
};

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function isValidImageFile(file: File): boolean {
    const lowerName = file.name.toLowerCase();
    const matchesExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
        lowerName.endsWith(ext),
    );
    const matchesMime =
        file.type === '' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/webp';

    return matchesExt && matchesMime;
}

export function ImageGalleryUpload({
    existingImages,
    onExistingImagesChange,
    files,
    onFilesChange,
    primaryKey,
    onPrimaryKeyChange,
    maxFiles = 8,
    maxSizeBytes = 2 * 1024 * 1024,
    disabled = false,
    error,
    dataTest,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const dragDepthRef = useRef(0);
    const objectUrlsRef = useRef<Map<File, string>>(new Map());
    const [isDragging, setIsDragging] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        FileValidationError[]
    >([]);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const previewMap = new Map<File, string>();

    for (const file of files) {
        const existingUrl = objectUrlsRef.current.get(file);

        if (existingUrl) {
            previewMap.set(file, existingUrl);
        } else {
            const createdUrl = URL.createObjectURL(file);
            objectUrlsRef.current.set(file, createdUrl);
            previewMap.set(file, createdUrl);
        }
    }

    useEffect(() => {
        const currentFiles = new Set(files);

        for (const [storedFile, storedUrl] of objectUrlsRef.current.entries()) {
            if (!currentFiles.has(storedFile)) {
                URL.revokeObjectURL(storedUrl);
                objectUrlsRef.current.delete(storedFile);
            }
        }
    }, [files]);

    useEffect(() => {
        const storedMap = objectUrlsRef.current;

        return () => {
            for (const url of storedMap.values()) {
                URL.revokeObjectURL(url);
            }
            storedMap.clear();
        };
    }, []);

    const entries: GalleryEntry[] = [
        ...existingImages.map((image, idx) => ({
            kind: 'existing' as const,
            key: `existing:${image.id}`,
            index: idx,
            url: image.url,
            thumbnailUrl: image.thumbnailUrl ?? image.url,
            name: image.name ?? image.alt ?? `Foto ${idx + 1}`,
            sizeText: null,
        })),
        ...files.map((file, idx) => {
            const previewUrl = previewMap.get(file) ?? '';

            return {
                kind: 'new' as const,
                key: `new:${idx}`,
                index: idx,
                url: previewUrl,
                thumbnailUrl: previewUrl,
                name: file.name,
                sizeText: formatFileSize(file.size),
            };
        }),
    ];

    const resolvedPrimaryKey =
        primaryKey && entries.some((entry) => entry.key === primaryKey)
            ? primaryKey
            : (entries[0]?.key ?? null);

    const totalCount = entries.length;
    const remainingSlots = Math.max(0, maxFiles - totalCount);

    const processIncomingImages = (incoming: FileList | File[]) => {
        if (disabled) {
            return;
        }

        const list = Array.from(incoming);

        if (list.length === 0) {
            return;
        }

        const nextErrors: FileValidationError[] = [];
        const accepted: File[] = [];
        const maxSizeText = formatFileSize(maxSizeBytes);

        for (const file of list) {
            if (!isValidImageFile(file)) {
                nextErrors.push({
                    fileName: file.name,
                    reason: 'Format gambar harus JPG, PNG, atau WebP.',
                });
                continue;
            }

            if (file.size > maxSizeBytes) {
                nextErrors.push({
                    fileName: file.name,
                    reason: `Ukuran melebihi batas maksimal ${maxSizeText}.`,
                });
                continue;
            }

            accepted.push(file);
        }

        if (accepted.length > remainingSlots) {
            nextErrors.push({
                fileName: `${accepted.length - remainingSlots} foto lainnya`,
                reason: `Maksimal ${maxFiles} foto per produk.`,
            });
        }

        setValidationErrors(nextErrors);

        const toAdd = accepted.slice(0, remainingSlots);

        if (toAdd.length > 0) {
            const nextFiles = [...files, ...toAdd];
            onFilesChange(nextFiles);

            if (!resolvedPrimaryKey) {
                onPrimaryKeyChange('new:0');
            }
        }
    };

    const handleRemoveEntry = (entry: GalleryEntry) => {
        if (entry.kind === 'existing') {
            const nextExisting = existingImages.filter(
                (_, idx) => idx !== entry.index,
            );
            onExistingImagesChange(nextExisting);

            if (resolvedPrimaryKey === entry.key) {
                const fallbackKey = nextExisting[0]
                    ? `existing:${nextExisting[0].id}`
                    : files.length > 0
                      ? 'new:0'
                      : null;
                onPrimaryKeyChange(fallbackKey);
            }

            return;
        }

        const nextFiles = files.filter((_, idx) => idx !== entry.index);
        onFilesChange(nextFiles);

        if (resolvedPrimaryKey === entry.key) {
            const fallbackKey = existingImages[0]
                ? `existing:${existingImages[0].id}`
                : nextFiles.length > 0
                  ? 'new:0'
                  : null;
            onPrimaryKeyChange(fallbackKey);
        } else if (resolvedPrimaryKey?.startsWith('new:')) {
            const currentPrimaryIndex = Number(
                resolvedPrimaryKey.replace('new:', ''),
            );

            if (currentPrimaryIndex > entry.index) {
                onPrimaryKeyChange(`new:${currentPrimaryIndex - 1}`);
            }
        }
    };

    const handleMoveExisting = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= existingImages.length) {
            return;
        }

        const next = [...existingImages];
        const [moved] = next.splice(index, 1);
        next.splice(target, 0, moved);
        onExistingImagesChange(next);
    };

    const handleMoveNew = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= files.length) {
            return;
        }

        const next = [...files];
        const [moved] = next.splice(index, 1);
        next.splice(target, 0, moved);
        onFilesChange(next);

        if (resolvedPrimaryKey === `new:${index}`) {
            onPrimaryKeyChange(`new:${target}`);
        } else if (resolvedPrimaryKey === `new:${target}`) {
            onPrimaryKeyChange(`new:${index}`);
        }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled || remainingSlots === 0) {
            return;
        }

        dragDepthRef.current += 1;
        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

        if (dragDepthRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepthRef.current = 0;
        setIsDragging(false);

        if (event.dataTransfer.files) {
            processIncomingImages(event.dataTransfer.files);
        }
    };

    return (
        <div className="flex flex-col gap-3.5">
            <div
                role="button"
                tabIndex={disabled || remainingSlots === 0 ? -1 : 0}
                onClick={() =>
                    !disabled && remainingSlots > 0 && inputRef.current?.click()
                }
                onKeyDown={(event) => {
                    if (
                        !disabled &&
                        remainingSlots > 0 &&
                        (event.key === 'Enter' || event.key === ' ')
                    ) {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-test={dataTest}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3394] ${
                    disabled || remainingSlots === 0
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                        : isDragging
                          ? 'cursor-pointer border-[#7D3394] bg-[#F9F5FB]'
                          : 'cursor-pointer border-gray-200 bg-gray-50/50'
                }`}
            >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]">
                    <ImagePlus className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">
                        {remainingSlots === 0
                            ? `Batas maksimal ${maxFiles} foto tercapai`
                            : 'Seret & lepas foto produk di sini, atau klik untuk unggah'}
                    </span>
                    <span className="text-xs text-gray-500">
                        JPG, PNG, atau WebP • Maksimal{' '}
                        {formatFileSize(maxSizeBytes)} per foto • {totalCount}/
                        {maxFiles} foto
                    </span>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    multiple
                    disabled={disabled || remainingSlots === 0}
                    onChange={(event) => {
                        if (event.target.files) {
                            processIncomingImages(event.target.files);
                        }
                        event.target.value = '';
                    }}
                    className="hidden"
                />
            </div>

            {entries.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {entries.map((entry, entryIdx) => {
                        const isPrimary = resolvedPrimaryKey === entry.key;
                        const canMoveLeft = entry.index > 0;
                        const canMoveRight =
                            entry.kind === 'existing'
                                ? entry.index < existingImages.length - 1
                                : entry.index < files.length - 1;

                        return (
                            <div
                                key={entry.key}
                                className="flex flex-col gap-2"
                            >
                                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                                    <StorefrontImage
                                        src={entry.thumbnailUrl}
                                        fallbackSrc={entry.url}
                                        alt={entry.name}
                                        compact
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onPrimaryKeyChange(entry.key)
                                        }
                                        disabled={disabled}
                                        className={`absolute top-2 left-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-2xs ${
                                            isPrimary
                                                ? 'border border-[#E2C9EB] bg-[#F0E6F5]/95 text-[#7D3394]'
                                                : 'bg-white/90 text-gray-600'
                                        }`}
                                    >
                                        <Star
                                            className={`h-3 w-3 ${
                                                isPrimary
                                                    ? 'fill-[#7D3394] text-[#7D3394]'
                                                    : 'text-gray-400'
                                            }`}
                                        />
                                        <span>
                                            {isPrimary ? 'Foto Utama' : 'Utama'}
                                        </span>
                                    </button>

                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                        {entry.url && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPreviewIndex(entryIdx)
                                                }
                                                aria-label={`Lihat pratinjau ${entry.name}`}
                                                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-2xs"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveEntry(entry)
                                            }
                                            disabled={disabled}
                                            aria-label={`Hapus foto ${entry.name}`}
                                            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-[#DC2626] shadow-2xs disabled:opacity-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-xs text-gray-700">
                                            {entry.name}
                                        </span>
                                        {entry.sizeText && (
                                            <span className="text-[10px] text-gray-400">
                                                {entry.sizeText}
                                            </span>
                                        )}
                                    </div>

                                    {(canMoveLeft || canMoveRight) && (
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={
                                                    disabled || !canMoveLeft
                                                }
                                                onClick={() =>
                                                    entry.kind === 'existing'
                                                        ? handleMoveExisting(
                                                              entry.index,
                                                              -1,
                                                          )
                                                        : handleMoveNew(
                                                              entry.index,
                                                              -1,
                                                          )
                                                }
                                                aria-label="Geser ke kiri"
                                                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ArrowLeft className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={
                                                    disabled || !canMoveRight
                                                }
                                                onClick={() =>
                                                    entry.kind === 'existing'
                                                        ? handleMoveExisting(
                                                              entry.index,
                                                              1,
                                                          )
                                                        : handleMoveNew(
                                                              entry.index,
                                                              1,
                                                          )
                                                }
                                                aria-label="Geser ke kanan"
                                                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {validationErrors.length > 0 && (
                <div className="flex flex-col gap-1 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-[#DC2626]">
                    {validationErrors.map((item, idx) => (
                        <div
                            key={`${item.fileName}-${idx}`}
                            className="flex items-start gap-2"
                        >
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                                <span className="font-medium">
                                    {item.fileName}:
                                </span>{' '}
                                {item.reason}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {error && <p className="text-xs text-[#DC2626]">{error}</p>}

            <ImageLightbox
                images={entries.map((item) => ({
                    id: item.key,
                    url: item.url,
                    thumbnailUrl: item.thumbnailUrl,
                    alt: item.name,
                    label: item.name,
                }))}
                open={previewIndex !== null}
                initialIndex={previewIndex ?? 0}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setPreviewIndex(null);
                    }
                }}
            />
        </div>
    );
}
