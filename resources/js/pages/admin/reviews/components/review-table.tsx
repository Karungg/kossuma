import { Link, router } from '@inertiajs/react';
import { Eye, EyeOff, MessageSquareReply, Star } from 'lucide-react';
import { useState } from 'react';
import {
    DataTableBulkActionBar,
    DataTablePagination,
    DataTableSortHeader,
} from '@/components/data-table';
import { StorefrontImage } from '@/components/media';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { show as showOrder } from '@/routes/admin/orders';
import { restore } from '@/routes/admin/reviews';
import type { SortDirection } from '@/types/data-table';
import { REVIEW_COLUMNS } from '../types';
import type {
    AdminReviewRow,
    ExportFormat,
    PaginatedAdminReviews,
    ReviewColumnVisibility,
    ReviewSortField,
} from '../types';
import { ReviewHideDialog } from './review-hide-dialog';
import { ReviewReplyDialog } from './review-reply-dialog';

type Props = {
    reviews: PaginatedAdminReviews;
    activeSort: ReviewSortField;
    activeDirection: SortDirection;
    visibleColumns: ReviewColumnVisibility;
    selectedIds: number[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    onToggleSelect: (id: number) => void;
    onToggleSelectAll: (checked: boolean) => void;
    onClearSelection: () => void;
    onSort: (column: ReviewSortField) => void;
    onExportSelected: (format: ExportFormat) => void;
};

const CHECKBOX_CLASS =
    'cursor-pointer border-gray-300 data-[state=checked]:border-[#7D3394] data-[state=checked]:bg-[#7D3394] data-[state=indeterminate]:border-[#7D3394] data-[state=indeterminate]:bg-[#7D3394]';

export function ReviewTable({
    reviews,
    activeSort,
    activeDirection,
    visibleColumns,
    selectedIds,
    isAllSelected,
    isPartiallySelected,
    onToggleSelect,
    onToggleSelectAll,
    onClearSelection,
    onSort,
    onExportSelected,
}: Props) {
    const [hidingReview, setHidingReview] = useState<AdminReviewRow | null>(
        null,
    );
    const [replyingReview, setReplyingReview] = useState<AdminReviewRow | null>(
        null,
    );
    const [restoringId, setRestoringId] = useState<number | null>(null);

    const totalDesktopColumns =
        REVIEW_COLUMNS.filter((column) => visibleColumns[column.key]).length +
        2;

    const handleRestore = (reviewId: number) => {
        setRestoringId(reviewId);
        router.post(
            restore.url(reviewId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRestoringId(null),
            },
        );
    };

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
                <DataTableBulkActionBar
                    selectedCount={selectedIds.length}
                    itemLabel="ulasan"
                    onExport={onExportSelected}
                    onClearSelection={onClearSelection}
                    dataTest="review-bulk-action-bar"
                />

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">
                                <th className="w-12 py-3.5 pr-2 pl-5">
                                    <Checkbox
                                        checked={
                                            isAllSelected
                                                ? true
                                                : isPartiallySelected
                                                  ? 'indeterminate'
                                                  : false
                                        }
                                        onCheckedChange={(checked) =>
                                            onToggleSelectAll(checked === true)
                                        }
                                        aria-label="Pilih semua ulasan di halaman ini"
                                        data-test="select-all-reviews"
                                        className={CHECKBOX_CLASS}
                                    />
                                </th>

                                {visibleColumns.product && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Produk
                                    </th>
                                )}

                                {visibleColumns.store && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Toko UMKM
                                    </th>
                                )}

                                {visibleColumns.author_name && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Pembeli
                                    </th>
                                )}

                                {visibleColumns.order_number && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Pesanan
                                    </th>
                                )}

                                {visibleColumns.rating && (
                                    <DataTableSortHeader
                                        column="rating"
                                        label="Rating"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                {visibleColumns.comment && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Komentar &amp; Tanggapan
                                    </th>
                                )}

                                {visibleColumns.visibility && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Status
                                    </th>
                                )}

                                {visibleColumns.admin_reply && (
                                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                                        Balasan Kossuma
                                    </th>
                                )}

                                {visibleColumns.created_at && (
                                    <DataTableSortHeader
                                        column="created_at"
                                        label="Tanggal"
                                        activeSort={activeSort}
                                        activeDirection={activeDirection}
                                        onSort={onSort}
                                    />
                                )}

                                <th className="py-3.5 pr-5 pl-4 text-right text-xs font-semibold text-gray-600">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {reviews.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={totalDesktopColumns}
                                        className="px-5 py-12 text-center text-sm text-gray-500"
                                    >
                                        Belum ada ulasan yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                reviews.data.map((review) => {
                                    const isSelected = selectedIds.includes(
                                        review.id,
                                    );

                                    return (
                                        <tr
                                            key={review.id}
                                            className={
                                                isSelected
                                                    ? 'bg-[#F9F5FB]/60'
                                                    : review.is_hidden
                                                      ? 'bg-gray-50/50'
                                                      : undefined
                                            }
                                        >
                                            <td className="py-4 pr-2 pl-5 align-top">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        onToggleSelect(
                                                            review.id,
                                                        )
                                                    }
                                                    aria-label={`Pilih ulasan ${review.id}`}
                                                    data-test={`select-review-${review.id}`}
                                                    className={`mt-1 ${CHECKBOX_CLASS}`}
                                                />
                                            </td>

                                            {visibleColumns.product && (
                                                <td className="max-w-[220px] min-w-[160px] px-4 py-4 align-top">
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                            <StorefrontImage
                                                                src={
                                                                    review.product_image_url
                                                                }
                                                                alt={
                                                                    review.product_name
                                                                }
                                                                compact
                                                            />
                                                        </div>
                                                        <div className="flex min-w-0 flex-col gap-0.5">
                                                            <span className="line-clamp-2 text-sm text-gray-900">
                                                                {
                                                                    review.product_name
                                                                }
                                                            </span>
                                                            {review.variant && (
                                                                <span className="text-[11px] text-gray-400">
                                                                    {
                                                                        review.variant
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {visibleColumns.store && (
                                                <td className="max-w-[150px] px-4 py-4 align-top text-xs text-gray-600">
                                                    {review.store_name}
                                                </td>
                                            )}

                                            {visibleColumns.author_name && (
                                                <td className="max-w-[150px] px-4 py-4 align-top">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm text-gray-900">
                                                            {review.author_name}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            {
                                                                review.author_location
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {visibleColumns.order_number && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap">
                                                    {review.order_id &&
                                                    review.order_number ? (
                                                        <Link
                                                            href={showOrder(
                                                                review.order_id,
                                                            )}
                                                            className="cursor-pointer font-semibold text-[#7D3394] tabular-nums"
                                                        >
                                                            {
                                                                review.order_number
                                                            }
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            {visibleColumns.rating && (
                                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                                                        <span
                                                            className={`text-sm font-bold tabular-nums ${
                                                                review.rating <=
                                                                2
                                                                    ? 'text-[#DC2626]'
                                                                    : 'text-gray-900'
                                                            }`}
                                                        >
                                                            {review.rating}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {visibleColumns.comment && (
                                                <td className="max-w-[300px] min-w-[200px] px-4 py-4 align-top">
                                                    <div className="flex flex-col gap-1.5">
                                                        <p className="text-xs leading-relaxed text-gray-700">
                                                            {review.comment}
                                                        </p>
                                                        {review.admin_reply && (
                                                            <p className="border-l-2 border-[#E2C9EB] pl-2.5 text-[11px] leading-relaxed text-[#7D3394]">
                                                                Balasan Kossuma:{' '}
                                                                {
                                                                    review.admin_reply
                                                                }
                                                            </p>
                                                        )}
                                                        {review.is_hidden &&
                                                            review.hidden_reason && (
                                                                <p className="text-[11px] text-[#DC2626]">
                                                                    Alasan
                                                                    disembunyikan:{' '}
                                                                    {
                                                                        review.hidden_reason
                                                                    }
                                                                </p>
                                                            )}
                                                    </div>
                                                </td>
                                            )}

                                            {visibleColumns.visibility && (
                                                <td className="px-4 py-4 align-top whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                                                            review.is_hidden
                                                                ? 'bg-red-50 text-[#DC2626]'
                                                                : 'bg-emerald-50 text-emerald-700'
                                                        }`}
                                                    >
                                                        {review.is_hidden
                                                            ? 'Disembunyikan'
                                                            : 'Tampil'}
                                                    </span>
                                                </td>
                                            )}

                                            {visibleColumns.admin_reply && (
                                                <td className="max-w-[220px] px-4 py-4 align-top text-xs text-gray-600">
                                                    {review.admin_reply ?? '-'}
                                                </td>
                                            )}

                                            {visibleColumns.created_at && (
                                                <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-500">
                                                    {review.created_at_label ??
                                                        '-'}
                                                </td>
                                            )}

                                            <td className="py-4 pr-5 pl-4 text-right align-top whitespace-nowrap">
                                                <div className="inline-flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setReplyingReview(
                                                                review,
                                                            )
                                                        }
                                                        data-test={`reply-review-${review.id}`}
                                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#F0E6F5] px-2.5 py-1.5 text-xs font-semibold text-[#7D3394]"
                                                    >
                                                        <MessageSquareReply className="h-3.5 w-3.5" />
                                                        <span>
                                                            {review.admin_reply
                                                                ? 'Ubah Balas'
                                                                : 'Balas'}
                                                        </span>
                                                    </button>

                                                    {review.is_hidden ? (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                restoringId ===
                                                                review.id
                                                            }
                                                            onClick={() =>
                                                                handleRestore(
                                                                    review.id,
                                                                )
                                                            }
                                                            data-test={`restore-review-${review.id}`}
                                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-60"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            <span>
                                                                Pulihkan
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setHidingReview(
                                                                    review,
                                                                )
                                                            }
                                                            data-test={`hide-review-${review.id}`}
                                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-[#DC2626]"
                                                        >
                                                            <EyeOff className="h-3.5 w-3.5" />
                                                            <span>
                                                                Sembunyikan
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                            <Checkbox
                                checked={
                                    isAllSelected
                                        ? true
                                        : isPartiallySelected
                                          ? 'indeterminate'
                                          : false
                                }
                                onCheckedChange={(checked) =>
                                    onToggleSelectAll(checked === true)
                                }
                                aria-label="Pilih semua ulasan di halaman ini"
                                className={CHECKBOX_CLASS}
                            />
                            <span>Pilih semua</span>
                        </label>

                        <Select
                            value={activeSort}
                            onValueChange={(value) =>
                                onSort(value as ReviewSortField)
                            }
                        >
                            <SelectTrigger
                                aria-label="Urutkan ulasan"
                                className="h-8 w-auto min-w-[130px] cursor-pointer rounded-lg border-gray-200 bg-white text-xs text-gray-700"
                            >
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 bg-white">
                                <SelectItem
                                    value="created_at"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Terbaru
                                </SelectItem>
                                <SelectItem
                                    value="rating"
                                    className="cursor-pointer text-xs"
                                >
                                    Urut: Rating
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {reviews.data.length === 0 ? (
                        <div className="px-4 py-12 text-center text-sm text-gray-500">
                            Belum ada ulasan yang sesuai filter.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {reviews.data.map((review) => {
                                const isSelected = selectedIds.includes(
                                    review.id,
                                );

                                return (
                                    <div
                                        key={review.id}
                                        className={`flex flex-col gap-3 p-4 ${
                                            isSelected
                                                ? 'bg-[#F9F5FB]/60'
                                                : undefined
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex min-w-0 items-start gap-2.5">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        onToggleSelect(
                                                            review.id,
                                                        )
                                                    }
                                                    aria-label={`Pilih ulasan ${review.id}`}
                                                    className={`mt-1 ${CHECKBOX_CLASS}`}
                                                />
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {review.product_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {review.author_name} •{' '}
                                                        {review.store_name}
                                                    </span>
                                                </div>
                                            </div>

                                            <span
                                                className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                                    review.is_hidden
                                                        ? 'bg-red-50 text-[#DC2626]'
                                                        : 'bg-emerald-50 text-emerald-700'
                                                }`}
                                            >
                                                {review.is_hidden
                                                    ? 'Disembunyikan'
                                                    : 'Tampil'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1.5 pl-7">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                                    {review.rating}/5
                                                </span>
                                                {review.order_id &&
                                                    review.order_number && (
                                                        <Link
                                                            href={showOrder(
                                                                review.order_id,
                                                            )}
                                                            className="cursor-pointer font-semibold text-[#7D3394] tabular-nums"
                                                        >
                                                            •{' '}
                                                            {
                                                                review.order_number
                                                            }
                                                        </Link>
                                                    )}
                                            </div>
                                            <p className="text-xs leading-relaxed text-gray-700">
                                                {review.comment}
                                            </p>
                                            {review.admin_reply && (
                                                <p className="border-l-2 border-[#E2C9EB] pl-2.5 text-[11px] text-[#7D3394]">
                                                    Balasan Kossuma:{' '}
                                                    {review.admin_reply}
                                                </p>
                                            )}
                                            {review.is_hidden &&
                                                review.hidden_reason && (
                                                    <p className="text-[11px] text-[#DC2626]">
                                                        Alasan:{' '}
                                                        {review.hidden_reason}
                                                    </p>
                                                )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-2 pl-7">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setReplyingReview(review)
                                                }
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#F0E6F5] px-2.5 py-1.5 text-xs font-semibold text-[#7D3394]"
                                            >
                                                <MessageSquareReply className="h-3.5 w-3.5" />
                                                <span>
                                                    {review.admin_reply
                                                        ? 'Ubah Balas'
                                                        : 'Balas'}
                                                </span>
                                            </button>

                                            {review.is_hidden ? (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        restoringId ===
                                                        review.id
                                                    }
                                                    onClick={() =>
                                                        handleRestore(review.id)
                                                    }
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Pulihkan</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setHidingReview(review)
                                                    }
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-[#DC2626]"
                                                >
                                                    <EyeOff className="h-3.5 w-3.5" />
                                                    <span>Sembunyikan</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DataTablePagination
                    paginated={reviews}
                    itemLabel="ulasan"
                    onlyProps={['reviews', 'filters']}
                />
            </div>

            <ReviewHideDialog
                review={hidingReview}
                onClose={() => setHidingReview(null)}
            />

            <ReviewReplyDialog
                review={replyingReview}
                onClose={() => setReplyingReview(null)}
            />
        </>
    );
}
