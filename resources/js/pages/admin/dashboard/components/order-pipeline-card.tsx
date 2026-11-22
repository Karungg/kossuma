import { Link } from '@inertiajs/react';
import { index as ordersIndex } from '@/routes/admin/orders';
import type { OrderPipelineItem, PaymentMethodBreakdown } from '../types';

type Props = {
    pipeline: OrderPipelineItem[];
    paymentMethods: PaymentMethodBreakdown[];
    periodLabel: string;
};

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

const STATUS_BAR_COLORS: Record<OrderPipelineItem['status'], string> = {
    pending_payment: 'bg-amber-400',
    processing: 'bg-[#7D3394]',
    shipped: 'bg-blue-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-400',
};

const PAYMENT_BAR_COLORS: Record<PaymentMethodBreakdown['method'], string> = {
    qris: 'bg-[#7D3394]',
    bank_transfer: 'bg-blue-500',
    cod: 'bg-amber-500',
};

export function OrderPipelineCard({
    pipeline,
    paymentMethods,
    periodLabel,
}: Props) {
    return (
        <section className="flex flex-col justify-between gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-base font-bold text-gray-900">
                            Status Pesanan
                        </h2>
                        <p className="text-xs text-gray-500">
                            Distribusi seluruh pesanan • klik status untuk
                            menyaring
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {pipeline.map((item) => (
                        <Link
                            key={item.status}
                            href={ordersIndex.url({
                                query: { status: item.status },
                            })}
                            className="flex cursor-pointer flex-col gap-1.5"
                        >
                            <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-medium text-gray-700">
                                    {item.label}
                                </span>
                                <span className="text-gray-500 tabular-nums">
                                    <span className="font-bold text-gray-900">
                                        {item.count.toLocaleString('id-ID')}
                                    </span>{' '}
                                    ({item.percentage}%)
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={`h-full rounded-full ${STATUS_BAR_COLORS[item.status]}`}
                                    style={{
                                        width: `${Math.min(100, item.count > 0 ? Math.max(4, item.percentage) : 0)}%`,
                                    }}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-bold text-gray-900">
                        Metode Pembayaran
                    </h3>
                    <p className="text-[11px] text-gray-400">
                        Transaksi valid pada {periodLabel.toLowerCase()}
                    </p>
                </div>

                <div className="flex flex-col gap-2.5">
                    {paymentMethods.map((item) => (
                        <Link
                            key={item.method}
                            href={ordersIndex.url({
                                query: { payment_method: item.method },
                            })}
                            className="flex cursor-pointer items-center justify-between gap-3 text-xs"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${PAYMENT_BAR_COLORS[item.method]}`}
                                />
                                <span className="truncate text-gray-700">
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 tabular-nums">
                                <span className="text-gray-500">
                                    {item.count.toLocaleString('id-ID')}x
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatRupiah(item.amount)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
