import type {
    ReportSalesTimelineRow,
    ReportSalesTimelineTotals,
} from '../types';

type Props = {
    rows: ReportSalesTimelineRow[];
    totals: ReportSalesTimelineTotals;
    periodLabel: string;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export function ReportSalesTab({ rows, totals, periodLabel }: Props) {
    const visibleRows = rows.filter(
        (row) => row.orders_count > 0 || row.all_orders_count > 0,
    );
    const displayRows = visibleRows.length > 0 ? visibleRows : rows;

    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
            <div className="mb-4 flex flex-col gap-1">
                <h2 className="text-base font-bold text-gray-900">
                    Rekap Penjualan &amp; Keuangan per Periode
                </h2>
                <p className="text-xs text-gray-500">
                    Rincian kronologis untuk {periodLabel}. Menampilkan{' '}
                    {displayRows.length} baris periode.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-left text-xs sm:text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-xs text-gray-600">
                            <th className="py-3 pr-3 font-semibold">Periode</th>
                            <th className="px-3 py-3 text-right font-semibold">
                                Pesanan
                            </th>
                            <th className="px-3 py-3 text-right font-semibold">
                                Selesai
                            </th>
                            <th className="px-3 py-3 text-right font-semibold">
                                Batal
                            </th>
                            <th className="px-3 py-3 text-right font-semibold">
                                Subtotal
                            </th>
                            <th className="px-3 py-3 text-right font-semibold">
                                Diskon
                            </th>
                            <th className="px-3 py-3 text-right font-semibold">
                                Ongkir
                            </th>
                            <th className="px-3 py-3 text-right font-semibold">
                                Layanan
                            </th>
                            <th className="py-3 pl-3 text-right font-semibold">
                                Total Omzet
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-normal">
                        {displayRows.map((row) => (
                            <tr key={row.key} className="text-gray-700">
                                <td className="py-3 pr-3 text-gray-900">
                                    {row.full_label}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {row.orders_count.toLocaleString('id-ID')}
                                </td>
                                <td className="px-3 py-3 text-right text-emerald-700">
                                    {row.completed_count.toLocaleString(
                                        'id-ID',
                                    )}
                                </td>
                                <td className="px-3 py-3 text-right text-gray-500">
                                    {row.cancelled_count.toLocaleString(
                                        'id-ID',
                                    )}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {formatRupiah(row.subtotal)}
                                </td>
                                <td className="px-3 py-3 text-right text-emerald-700">
                                    {row.discount_amount > 0
                                        ? `-${formatRupiah(row.discount_amount)}`
                                        : formatRupiah(0)}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {formatRupiah(row.shipping_fee)}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {formatRupiah(row.service_fee)}
                                </td>
                                <td className="py-3 pl-3 text-right font-bold text-[#DC2626]">
                                    {formatRupiah(row.total_amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-200 bg-[#F8F9FB] text-gray-900">
                            <td className="py-3 pr-3 font-bold">Total</td>
                            <td className="px-3 py-3 text-right font-bold">
                                {totals.orders_count.toLocaleString('id-ID')}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-emerald-700">
                                {totals.completed_count.toLocaleString('id-ID')}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-gray-600">
                                {totals.cancelled_count.toLocaleString('id-ID')}
                            </td>
                            <td className="px-3 py-3 text-right font-bold">
                                {formatRupiah(totals.subtotal)}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-emerald-700">
                                -{formatRupiah(totals.discount_amount)}
                            </td>
                            <td className="px-3 py-3 text-right font-bold">
                                {formatRupiah(totals.shipping_fee)}
                            </td>
                            <td className="px-3 py-3 text-right font-bold">
                                {formatRupiah(totals.service_fee)}
                            </td>
                            <td className="py-3 pl-3 text-right font-extrabold text-[#DC2626]">
                                {formatRupiah(totals.total_amount)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}
