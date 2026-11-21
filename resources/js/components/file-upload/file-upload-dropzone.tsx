import {
    AlertCircle,
    FileArchive,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    UploadCloud,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { type FileValidationError, formatFileSize } from '@/types/file-upload';

type Props = {
    files: File[];
    onChange: (files: File[]) => void;
    accept?: string;
    allowedExtensions?: string[];
    multiple?: boolean;
    maxFiles?: number;
    maxSizeBytes?: number;
    title?: string;
    description?: string;
    helperText?: string;
    disabled?: boolean;
    progress?: number | null;
    error?: string;
    dataTest?: string;
};

function matchesExtension(file: File, allowedExtensions?: string[]): boolean {
    if (!allowedExtensions || allowedExtensions.length === 0) {
        return true;
    }

    const lowerName = file.name.toLowerCase();

    return allowedExtensions.some((ext) => {
        const normalized = ext.startsWith('.')
            ? ext.toLowerCase()
            : `.${ext.toLowerCase()}`;
        return lowerName.endsWith(normalized);
    });
}

function resolveFileIcon(fileName: string) {
    const lower = fileName.toLowerCase();

    if (
        lower.endsWith('.xlsx') ||
        lower.endsWith('.csv') ||
        lower.endsWith('.xls')
    ) {
        return FileSpreadsheet;
    }

    if (lower.endsWith('.zip') || lower.endsWith('.rar')) {
        return FileArchive;
    }

    if (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp')
    ) {
        return ImageIcon;
    }

    return FileText;
}

export function FileUploadDropzone({
    files,
    onChange,
    accept,
    allowedExtensions,
    multiple = false,
    maxFiles = 5,
    maxSizeBytes = 10 * 1024 * 1024,
    title = 'Seret & lepas file di sini, atau klik untuk memilih',
    description,
    helperText,
    disabled = false,
    progress = null,
    error,
    dataTest,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const dragDepthRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        FileValidationError[]
    >([]);

    const processIncomingFiles = (incoming: FileList | File[]) => {
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
            if (!matchesExtension(file, allowedExtensions)) {
                nextErrors.push({
                    fileName: file.name,
                    reason: `Format file tidak didukung (${allowedExtensions?.join(', ')}).`,
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

            if (
                multiple &&
                files.some(
                    (existing) =>
                        existing.name === file.name &&
                        existing.size === file.size,
                )
            ) {
                nextErrors.push({
                    fileName: file.name,
                    reason: 'File yang sama sudah dipilih.',
                });
                continue;
            }

            accepted.push(file);
        }

        if (!multiple) {
            setValidationErrors(nextErrors);

            if (accepted.length > 0) {
                onChange([accepted[0]]);
            }

            return;
        }

        const availableSlots = Math.max(0, maxFiles - files.length);

        if (accepted.length > availableSlots) {
            nextErrors.push({
                fileName: `${accepted.length - availableSlots} file lainnya`,
                reason: `Maksimal ${maxFiles} file dapat diunggah.`,
            });
        }

        setValidationErrors(nextErrors);

        const toAdd = accepted.slice(0, availableSlots);

        if (toAdd.length > 0) {
            onChange([...files, ...toAdd]);
        }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled) {
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
            processIncomingFiles(event.dataTransfer.files);
        }
    };

    const handleRemove = (indexToRemove: number) => {
        onChange(files.filter((_, idx) => idx !== indexToRemove));
        setValidationErrors([]);
    };

    return (
        <div className="flex flex-col gap-3">
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={(event) => {
                    if (
                        !disabled &&
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
                    disabled
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                        : isDragging
                          ? 'cursor-pointer border-[#7D3394] bg-[#F9F5FB]'
                          : 'cursor-pointer border-gray-200 bg-gray-50/50'
                }`}
            >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2C9EB] bg-[#F0E6F5] text-[#7D3394]">
                    <UploadCloud className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">
                        {title}
                    </span>
                    {description && (
                        <span className="text-xs text-gray-500">
                            {description}
                        </span>
                    )}
                </div>

                {helperText && (
                    <span className="text-[11px] text-gray-400">
                        {helperText}
                    </span>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={(event) => {
                        if (event.target.files) {
                            processIncomingFiles(event.target.files);
                        }
                        event.target.value = '';
                    }}
                    className="hidden"
                />
            </div>

            {progress !== null && progress > 0 && progress < 100 && (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Mengunggah file...</span>
                        <span className="font-semibold text-[#7D3394]">
                            {progress}%
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-[#7D3394] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
                    {files.map((file, idx) => {
                        const IconComponent = resolveFileIcon(file.name);

                        return (
                            <div
                                key={`${file.name}-${file.size}-${idx}`}
                                className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0E6F5] text-[#7D3394]">
                                        <IconComponent className="h-4 w-4" />
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-xs font-medium text-gray-900 sm:text-sm">
                                            {file.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleRemove(idx)}
                                    disabled={disabled}
                                    aria-label={`Hapus file ${file.name}`}
                                    className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-50 text-[#DC2626] disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
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
        </div>
    );
}
