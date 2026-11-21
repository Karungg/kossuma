import { Link } from '@inertiajs/react';
import type { PaginatedData } from '@/types/data-table';

type Props<T> = {
    paginated: PaginatedData<T>;
    itemLabel: string;
    onlyProps: string[];
};

function formatPaginationLabel(label: string): string {
    if (label.includes('Previous')) {
        return 'Sebelumnya';
    }
    if (label.includes('Next')) {
        return 'Berikutnya';
    }

    return label;
}

export function DataTablePagination<T>({
    paginated,
    itemLabel,
    onlyProps,
}: Props<T>) {
    if (paginated.total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="text-xs text-gray-500">
                Menampilkan {paginated.from ?? 0}–{paginated.to ?? 0} dari{' '}
                {paginated.total} {itemLabel}
            </span>

            {paginated.last_page > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {paginated.links.map((link, idx) => {
                        const label = formatPaginationLabel(link.label);

                        if (link.url === null) {
                            return (
                                <span
                                    key={idx}
                                    className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-400"
                                >
                                    {label}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={idx}
                                href={link.url}
                                preserveState
                                preserveScroll
                                only={onlyProps}
                                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                    link.active
                                        ? 'bg-[#7D3394] text-white'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
