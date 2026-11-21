import { router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { FileUploadDropzone } from '@/components/file-upload';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { importMethod, importTemplate } from '@/routes/admin/products';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function ProductImportDialog({ open, onClose }: Props) {
    const [xlsxFiles, setXlsxFiles] = useState<File[]>([]);
    const [zipFiles, setZipFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [errors, setErrors] = useState<{
        file?: string;
        images_archive?: string;
    }>({});

    const resetState = () => {
        setXlsxFiles([]);
        setZipFiles([]);
        setProgress(null);
        setErrors({});
    };

    const handleClose = () => {
        if (processing) {
            return;
        }
        resetState();
        onClose();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (xlsxFiles.length === 0) {
            setErrors({ file: 'Pilih file Excel (.xlsx) terlebih dahulu.' });
            return;
        }

        setProcessing(true);
        setErrors({});

        router.post(
            importMethod.url(),
            {
                file: xlsxFiles[0],
                images_archive: zipFiles[0] ?? null,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onProgress: (progressEvent) => {
                    if (progressEvent?.percentage !== undefined) {
                        setProgress(progressEvent.percentage);
                    }
                },
                onError: (serverErrors) => {
                    setErrors({
                        file: serverErrors.file,
                        images_archive: serverErrors.images_archive,
                    });
                },
                onSuccess: () => {
                    resetState();
                    onClose();
                },
                onFinish: () => {
                    setProcessing(false);
                    setProgress(null);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Impor Produk dari Excel
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-gray-600">
                        Impor berjalan di latar belakang. Anda akan menerima
                        notifikasi hasil impor beserta laporan error jika ada
                        baris yang perlu diperbaiki.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 rounded-xl border border-[#E2C9EB] bg-[#F9F5FB] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-[#7D3394]">
                            Gunakan template resmi Kossuma
                        </span>
                        <span className="text-xs text-gray-600">
                            Sudah dilengkapi panduan kolom dan daftar slug
                            kategori & toko aktif.
                        </span>
                    </div>

                    <a
                        href={importTemplate.url()}
                        data-test="download-product-import-template"
                        className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E2C9EB] bg-white px-3.5 text-xs font-semibold text-[#7D3394]"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh Template (.xlsx)</span>
                    </a>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-900">
                            File Data Produk (.xlsx)
                        </span>
                        <FileUploadDropzone
                            files={xlsxFiles}
                            onChange={(next) => {
                                setXlsxFiles(next);
                                setErrors((prev) => ({
                                    ...prev,
                                    file: undefined,
                                }));
                            }}
                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            allowedExtensions={['.xlsx']}
                            multiple={false}
                            maxSizeBytes={10 * 1024 * 1024}
                            title="Pilih atau seret file Excel (.xlsx)"
                            helperText="Maksimal 10 MB • Baris dengan slug yang sama akan memperbarui produk eksisting"
                            disabled={processing}
                            progress={progress}
                            error={errors.file}
                            dataTest="import-product-xlsx-dropzone"
                        />
                    </div>

                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-gray-900">
                                Arsip Foto Produk (.zip)
                            </span>
                            <span className="text-xs text-gray-400">
                                Opsional
                            </span>
                        </div>
                        <FileUploadDropzone
                            files={zipFiles}
                            onChange={(next) => {
                                setZipFiles(next);
                                setErrors((prev) => ({
                                    ...prev,
                                    images_archive: undefined,
                                }));
                            }}
                            accept=".zip,application/zip,application/x-zip-compressed"
                            allowedExtensions={['.zip']}
                            multiple={false}
                            maxSizeBytes={50 * 1024 * 1024}
                            title="Pilih atau seret arsip foto (.zip)"
                            helperText="Maksimal 50 MB • Nama file di dalam .zip dicocokkan dengan kolom image_files (JPG, PNG, WebP)"
                            disabled={processing}
                            error={errors.images_archive}
                            dataTest="import-product-zip-dropzone"
                        />
                    </div>

                    <DialogFooter className="gap-2 border-t border-gray-100 pt-4 sm:gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={processing}
                            className="h-10 cursor-pointer rounded-xl bg-gray-100 px-4 text-sm font-semibold text-gray-700"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing || xlsxFiles.length === 0}
                            data-test="submit-product-import-button"
                            className="h-10 cursor-pointer rounded-xl bg-[#7D3394] px-5 text-sm font-bold text-white disabled:opacity-50"
                        >
                            {processing ? 'Mengunggah...' : 'Mulai Impor'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
