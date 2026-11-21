export type ExistingFileItem = {
    id: string | number;
    url: string;
    thumbnailUrl?: string | null;
    name?: string;
    alt?: string | null;
    label?: string | null;
    isPrimary?: boolean;
};

export type FileValidationError = {
    fileName: string;
    reason: string;
};

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2).replace('.', ',')} MB`;
}
