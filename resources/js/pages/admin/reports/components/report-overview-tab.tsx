import { useId, useState } from 'react';
import type {
    ReportFinancialBreakdown,
    ReportOrderStatusItem,
    ReportPaymentMethodItem,
    ReportSalesTrend,
    ReportShippingMethodItem,
} from '../types';

type Props = {
    periodLabel: string;
    financial: ReportFinancialBreakdown;
    salesTrend: ReportSalesTrend;
    orderStatusBreakdown: ReportOrderStatusItem[];
    paymentMethods: ReportPaymentMethodItem[];
    shippingMethods: ReportShippingMethodItem[];
};

type MetricMode = 'revenue' | 'orders';

const SVG_WIDTH = 720;
const SVG_HEIGHT = 240;
const PAD_LEFT = 64;
const PAD_RIGHT = 18;
const PAD_TOP = 18;
const PAD_BOTTOM = 34;

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

function formatCompactAxis(value: number, mode: MetricMode): string {
    if (mode === 'orders') {
        return value.toLocaleString('id-ID');
    }

    if (value >= 1_000_000_000) {
        return `Rp${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    }

    if (value >= 1_000_000) {
        return `Rp${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
    }

    if (value >= 1_000) {
        return `Rp${Math.round(value / 1_000).toLocaleString('id-ID')} rb`;
    }

    return `Rp${value}`;
}

function computeNiceMax(rawMax: number, mode: MetricMode): number {
    if (rawMax <= 0) {
        return mode === 'revenue' ? 100_000 : 4;
    }

    const magnitude = 10 ** Math.floor(Math.log10(rawMax));
    const normalized = rawMax / magnitude;
    const step =
        normalized <= 1.2
            ? 1.2
            : normalized <= 2
              ? 2
              : normalized <= 4
                ? 4
                : normalized <= 5
                  ? 5
                  : normalized <= 8
                    ? 8
                    : 10;

    return Math.ceil(step * magnitude);
}

export function ReportOverviewTab({
    periodLabel,
    financial,
    salesTrend,
    orderStatusBreakdown,
    paymentMethods,
    shippingMethods,
}: Props) {
    const gradientId = useId();
    const [metric, setMetric] = useState<MetricMode>('revenue');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const points = salesTrend.points;
    const values = points.map((p) =>
        metric === 'revenue' ? p.revenue : p.orders_count,
    );
    const hasValues = values.some((v) => v > 0);
    const maxVal = computeNiceMax(Math.max(0, ...values), metric);
    const innerWidth = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
    const innerHeight = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const tickRatios = [0, 0.25, 0.5, 0.75, 1];
    const pointCount = points.length;

    const getX = (index: number): number => {
        if (pointCount <= 1) {
            return PAD_LEFT + innerWidth / 2;
        }

        return PAD_LEFT + (index / (pointCount - 1)) * innerWidth;
    };

    const getY = (value: number): number => {
        const clamped = Math.max(0, value);

        return PAD_TOP + innerHeight - (clamped / maxVal) * innerHeight;
    };

    const coords = points.map((point, index) => {
        const value = metric === 'revenue' ? point.revenue : point.orders_count;

        return { x: getX(index), y: getY(value), value, point };
    });

    const linePath = coords
        .map(
            (coord, index) =>
                `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`,
        )
        .join(' ');

    const areaPath =
        coords.length > 0
            ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(PAD_TOP + innerHeight).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(PAD_TOP + innerHeight).toFixed(1)} Z`
            : '';

    const labelStep =
        pointCount <= 8 ? 1 : pointCount <= 16 ? 2 : Math.ceil(pointCount / 8);

    const activeCoord = activeIndex !== null ? coords[activeIndex] : null;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6 lg:col-span-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                Tren Penjualan &amp; Pesanan
                            </h2>
                            <p className="text-xs text-gray-500">
                                {periodLabel}
                                {salesTrend.summary.peak_label
                                    ? ` • Puncak: ${salesTrend.summary.peak_label} (${formatRupiah(salesTrend.summary.peak_revenue)})`
                                    : ''}
                            </p>
                        </div>

                        <div className="inline-flex rounded-xl border border-gray-200 bg-[#F8F9FB] p-1">
                            <button
                                type="button"
                                onClick={() => setMetric('revenue')}
                                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium ${
                                    metric === 'revenue'
                                        ? 'bg-[#7D3394] text-white'
                                        : 'text-gray-600'
                                }`}
                            >
                                Omzet (Rp)
                            </button>
                            <button
                                type="button"
                                onClick={() => setMetric('orders')}
                                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium ${
                                    metric === 'orders'
                                        ? 'bg-[#7D3394] text-white'
                                        : 'text-gray-600'
                                }`}
                            >
                                Jumlah Pesanan
                            </button>
                        </div>
                    </div>

                    {!hasValues ? (
                        <div className="flex h-56 items-center justify-center rounded-xl bg-[#F8F9FB] text-sm text-gray-500">
                            Belum ada transaksi tercatat pada periode ini.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-x-auto">
                            <svg
                                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                                className="h-auto w-full min-w-[520px]"
                                role="img"
                                aria-label="Grafik tren penjualan operasional"
                            >
                                <defs>
                                    <linearGradient
                                        id={gradientId}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#7D3394"
                                            stopOpacity="0.24"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#7D3394"
                                            stopOpacity="0.02"
                                        />
                                    </linearGradient>
                                </defs>

                                {tickRatios.map((ratio) => {
                                    const y =
                                        PAD_TOP + innerHeight * (1 - ratio);
                                    const tickVal = Math.round(maxVal * ratio);

                                    return (
                                        <g key={ratio}>
                                            <line
                                                x1={PAD_LEFT}
                                                y1={y}
                                                x2={SVG_WIDTH - PAD_RIGHT}
                                                y2={y}
                                                stroke="#F3F4F6"
                                                strokeWidth="1"
                                            />
                                            <text
                                                x={PAD_LEFT - 8}
                                                y={y + 4}
                                                textAnchor="end"
                                                fill="#9CA3AF"
                                                fontSize="10"
                                            >
                                                {formatCompactAxis(
                                                    tickVal,
                                                    metric,
                                                )}
                                            </text>
                                        </g>
                                    );
                                })}

                                <path
                                    d={areaPath}
                                    fill={`url(#${gradientId})`}
                                />
                                <path
                                    d={linePath}
                                    fill="none"
                                    stroke="#7D3394"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {coords.map((coord, index) => (
                                    <g key={coord.point.key}>
                                        {(index % labelStep === 0 ||
                                            index === pointCount - 1) && (
                                            <text
                                                x={coord.x}
                                                y={SVG_HEIGHT - 10}
                                                textAnchor="middle"
                                                fill="#6B7280"
                                                fontSize="10"
                                            >
                                                {coord.point.label}
                                            </text>
                                        )}
                                        <circle
                                            cx={coord.x}
                                            cy={coord.y}
                                            r={activeIndex === index ? 5 : 3}
                                            fill={
                                                activeIndex === index
                                                    ? '#7D3394'
                                                    : '#FFFFFF'
                                            }
                                            stroke="#7D3394"
                                            strokeWidth="2"
                                            className="cursor-pointer"
                                            onMouseEnter={() =>
                                                setActiveIndex(index)
                                            }
                                            onMouseLeave={() =>
                                                setActiveIndex(null)
                                            }
                                        />
                                    </g>
                                ))}
                            </svg>

                            {activeCoord && (
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F0E6F5]/60 px-3.5 py-2 text-xs text-gray-700">
                                    <span className="font-semibold text-[#7D3394]">
                                        {activeCoord.point.full_label}
                                    </span>
                                    <span>
                                        Omzet:{' '}
                                        <strong className="text-[#DC2626]">
                                            {formatRupiah(
                                                activeCoord.point.revenue,
                                            )}
                                        </strong>{' '}
                                        • Pesanan:{' '}
                                        <strong>
                                            {activeCoord.point.orders_count}
                                        </strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6 lg:col-span-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            Rincian Keuangan
                        </h2>
                        <p className="text-xs text-gray-500">
                            Pemisahan komponen tagihan untuk rekonsiliasi
                        </p>
                    </div>

                    <dl className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-600">Subtotal Produk</dt>
                            <dd className="font-normal text-gray-900">
                                {formatRupiah(financial.subtotal)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-600">Total Diskon</dt>
                            <dd className="font-normal text-emerald-700">
                                -{formatRupiah(financial.discount_amount)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-600">Ongkos Kirim</dt>
                            <dd className="font-normal text-gray-900">
                                {formatRupiah(financial.shipping_fee)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-600">Biaya Layanan</dt>
                            <dd className="font-normal text-gray-900">
                                {formatRupiah(financial.service_fee)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                            <dt className="font-semibold text-gray-900">
                                Pendapatan Bersih
                            </dt>
                            <dd className="font-extrabold text-[#DC2626]">
                                {formatRupiah(financial.net_revenue)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="font-semibold text-gray-900">
                                Total Omzet Kotor
                            </dt>
                            <dd className="font-extrabold text-[#DC2626]">
                                {formatRupiah(financial.total_amount)}
                            </dd>
                        </div>
                    </dl>

                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>Pesanan Selesai</span>
                            <span className="text-emerald-700">
                                {formatRupiah(financial.completed_amount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Menunggu Pembayaran</span>
                            <span>
                                {formatRupiah(financial.pending_amount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>
                                Potensi Hilang ({financial.cancelled_orders_count}{' '}
                                Batal)
                            </span>
                            <span className="text-[#DC2626]">
                                {formatRupiah(financial.cancelled_amount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <h3 className="text-sm font-bold text-gray-900">
                        Distribusi Status Pesanan
                    </h3>
                    <div className="flex flex-col gap-3">
                        {orderStatusBreakdown.map((item) => (
                            <div key={item.status} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">
                                        {item.label}
                                    </span>
                                    <span className="text-gray-500">
                                        {item.count} ({item.percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-[#7D3394]"
                                        style={{
                                            width: `${Math.min(100, item.percentage)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <h3 className="text-sm font-bold text-gray-900">
                        Komposisi Metode Pembayaran
                    </h3>
                    <div className="flex flex-col gap-3">
                        {paymentMethods.map((item) => (
                            <div
                                key={item.method}
                                className="flex flex-col gap-1"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">
                                        {item.label}
                                    </span>
                                    <span className="text-gray-500">
                                        {formatRupiah(item.amount)} (
                                        {item.percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-[#7D3394]"
                                        style={{
                                            width: `${Math.min(100, item.percentage)}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-[11px] text-gray-400">
                                    {item.count} transaksi
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                    <h3 className="text-sm font-bold text-gray-900">
                        Metode &amp; Kurir Pengiriman
                    </h3>
                    {shippingMethods.length === 0 ? (
                        <p className="text-xs text-gray-500">
                            Belum ada data pengiriman pada periode ini.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {shippingMethods.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex flex-col gap-1"
                                >
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-700">
                                            {item.label}
                                        </span>
                                        <span className="text-gray-500">
                                            {item.count} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-emerald-600"
                                            style={{
                                                width: `${Math.min(100, item.percentage)}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-gray-400">
                                        Total ongkir:{' '}
                                        {formatRupiah(item.shipping_fee)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
