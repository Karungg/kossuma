import { useId, useState } from 'react';
import type { SalesChartData } from '../types';

type MetricMode = 'revenue' | 'orders';

type Props = {
    chart: SalesChartData;
    periodLabel: string;
};

const SVG_WIDTH = 720;
const SVG_HEIGHT = 250;
const PAD_LEFT = 64;
const PAD_RIGHT = 18;
const PAD_TOP = 20;
const PAD_BOTTOM = 34;

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

function formatCompactAxisValue(value: number, mode: MetricMode): string {
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

    let step = 1;
    if (normalized <= 1.2) {
        step = 1.2;
    } else if (normalized <= 2) {
        step = 2;
    } else if (normalized <= 4) {
        step = 4;
    } else if (normalized <= 5) {
        step = 5;
    } else if (normalized <= 8) {
        step = 8;
    } else {
        step = 10;
    }

    return Math.ceil(step * magnitude);
}

export function SalesTrendChart({ chart, periodLabel }: Props) {
    const gradientId = useId();
    const [metric, setMetric] = useState<MetricMode>('revenue');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const points = chart.points;
    const values = points.map((point) =>
        metric === 'revenue' ? point.revenue : point.orders_count,
    );
    const hasAnyValue = values.some((value) => value > 0);
    const maxVal = computeNiceMax(Math.max(0, ...values), metric);

    const innerWidth = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
    const innerHeight = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;

    const tickRatios = [0, 0.25, 0.5, 0.75, 1];
    const pointCount = points.length;

    const getX = (index: number): number => {
        if (pointCount <= 1) {
            return PAD_LEFT + innerWidth / 2;
        }

        if (metric === 'orders') {
            const slotWidth = innerWidth / pointCount;

            return PAD_LEFT + slotWidth * index + slotWidth / 2;
        }

        return PAD_LEFT + (index / (pointCount - 1)) * innerWidth;
    };

    const getY = (value: number): number => {
        const clamped = Math.max(0, value);

        return PAD_TOP + innerHeight - (clamped / maxVal) * innerHeight;
    };

    const coordinates = points.map((point, index) => {
        const value = metric === 'revenue' ? point.revenue : point.orders_count;

        return {
            x: getX(index),
            y: getY(value),
            value,
            point,
        };
    });

    const linePath = coordinates
        .map(
            (coord, index) =>
                `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`,
        )
        .join(' ');

    const baselineY = PAD_TOP + innerHeight;
    const areaPath =
        coordinates.length > 0
            ? `${linePath} L ${coordinates[coordinates.length - 1].x.toFixed(1)} ${baselineY.toFixed(1)} L ${coordinates[0].x.toFixed(1)} ${baselineY.toFixed(1)} Z`
            : '';

    const labelStep = pointCount <= 8 ? 1 : pointCount <= 14 ? 2 : 5;
    const activeCoord =
        activeIndex !== null && coordinates[activeIndex]
            ? coordinates[activeIndex]
            : null;

    const barWidth =
        pointCount > 0
            ? Math.max(6, Math.min(28, (innerWidth / pointCount) * 0.58))
            : 16;

    return (
        <section className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="text-base font-bold text-gray-900">
                        Grafik Penjualan
                    </h2>
                    <p className="text-xs text-gray-500">
                        Tren transaksi valid pada {periodLabel.toLowerCase()}
                        {chart.summary.peak_label &&
                        chart.summary.peak_revenue > 0
                            ? ` • Puncak ${chart.summary.peak_label} (${formatRupiah(chart.summary.peak_revenue)})`
                            : ''}
                    </p>
                </div>

                <div
                    role="tablist"
                    aria-label="Pilih metrik grafik penjualan"
                    className="inline-flex rounded-xl bg-gray-100 p-1"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={metric === 'revenue'}
                        onClick={() => setMetric('revenue')}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium ${
                            metric === 'revenue'
                                ? 'bg-white text-[#7D3394] shadow-2xs'
                                : 'text-gray-600'
                        }`}
                    >
                        Omzet (Rp)
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={metric === 'orders'}
                        onClick={() => setMetric('orders')}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium ${
                            metric === 'orders'
                                ? 'bg-white text-[#7D3394] shadow-2xs'
                                : 'text-gray-600'
                        }`}
                    >
                        Jumlah Pesanan
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-gray-100 py-3">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-gray-400">
                        Total Omzet Periode
                    </span>
                    <span className="text-base font-extrabold text-[#DC2626] tabular-nums">
                        {formatRupiah(chart.summary.total_revenue)}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-gray-400">
                        Total Pesanan Valid
                    </span>
                    <span className="text-base font-extrabold text-gray-900 tabular-nums">
                        {chart.summary.total_orders.toLocaleString('id-ID')}{' '}
                        pesanan
                    </span>
                </div>
                {activeCoord && (
                    <div className="ml-auto flex flex-col items-end gap-0.5">
                        <span className="text-[11px] text-[#7D3394]">
                            {activeCoord.point.full_label}
                        </span>
                        <span className="text-xs font-bold text-gray-900 tabular-nums">
                            {formatRupiah(activeCoord.point.revenue)} •{' '}
                            {activeCoord.point.orders_count.toLocaleString(
                                'id-ID',
                            )}{' '}
                            pesanan
                        </span>
                    </div>
                )}
            </div>

            {!hasAnyValue ? (
                <div className="flex h-56 flex-col items-center justify-center gap-1 rounded-xl bg-gray-50 px-4 text-center">
                    <span className="text-sm font-medium text-gray-700">
                        Belum ada transaksi valid pada periode ini
                    </span>
                    <span className="text-xs text-gray-400">
                        Grafik akan terisi otomatis saat ada pesanan diproses,
                        dikirim, atau selesai.
                    </span>
                </div>
            ) : (
                <div
                    className="relative w-full"
                    onMouseLeave={() => setActiveIndex(null)}
                >
                    <svg
                        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                        role="img"
                        aria-label={`Grafik ${metric === 'revenue' ? 'omzet penjualan' : 'jumlah pesanan'} ${periodLabel}`}
                        className="h-auto w-full overflow-visible select-none"
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
                                    stopOpacity="0.22"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#7D3394"
                                    stopOpacity="0.01"
                                />
                            </linearGradient>
                        </defs>

                        {tickRatios.map((ratio) => {
                            const tickVal = Math.round(maxVal * ratio);
                            const y =
                                PAD_TOP + innerHeight - ratio * innerHeight;

                            return (
                                <g key={ratio}>
                                    <line
                                        x1={PAD_LEFT}
                                        y1={y}
                                        x2={SVG_WIDTH - PAD_RIGHT}
                                        y2={y}
                                        stroke="#F3F4F6"
                                        strokeWidth="1"
                                        strokeDasharray={
                                            ratio === 0 ? undefined : '4 4'
                                        }
                                    />
                                    <text
                                        x={PAD_LEFT - 10}
                                        y={y + 4}
                                        textAnchor="end"
                                        className="fill-gray-400 text-[10px]"
                                    >
                                        {formatCompactAxisValue(
                                            tickVal,
                                            metric,
                                        )}
                                    </text>
                                </g>
                            );
                        })}

                        {metric === 'revenue' ? (
                            <>
                                {areaPath && (
                                    <path
                                        d={areaPath}
                                        fill={`url(#${gradientId})`}
                                    />
                                )}
                                {linePath && (
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="#7D3394"
                                        strokeWidth="2.5"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                )}
                                {activeCoord && (
                                    <line
                                        x1={activeCoord.x}
                                        y1={PAD_TOP}
                                        x2={activeCoord.x}
                                        y2={baselineY}
                                        stroke="#E2C9EB"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 3"
                                    />
                                )}
                                {coordinates.map((coord, index) => {
                                    const isActive = activeIndex === index;
                                    const showStaticDot =
                                        pointCount <= 12 || coord.value > 0;

                                    if (!isActive && !showStaticDot) {
                                        return null;
                                    }

                                    return (
                                        <circle
                                            key={coord.point.key}
                                            cx={coord.x}
                                            cy={coord.y}
                                            r={isActive ? 5 : 3}
                                            fill={
                                                isActive ? '#7D3394' : '#FFFFFF'
                                            }
                                            stroke="#7D3394"
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                    );
                                })}
                            </>
                        ) : (
                            coordinates.map((coord, index) => {
                                const isActive = activeIndex === index;
                                const barHeight = Math.max(
                                    coord.value > 0 ? 3 : 0,
                                    baselineY - coord.y,
                                );

                                return (
                                    <rect
                                        key={coord.point.key}
                                        x={coord.x - barWidth / 2}
                                        y={baselineY - barHeight}
                                        width={barWidth}
                                        height={barHeight}
                                        rx={4}
                                        fill={isActive ? '#632676' : '#7D3394'}
                                        fillOpacity={isActive ? 1 : 0.82}
                                    />
                                );
                            })
                        )}

                        {coordinates.map((coord, index) => {
                            const shouldShowLabel =
                                index === 0 ||
                                index === pointCount - 1 ||
                                index % labelStep === 0;

                            if (!shouldShowLabel) {
                                return null;
                            }

                            return (
                                <text
                                    key={`label-${coord.point.key}`}
                                    x={coord.x}
                                    y={SVG_HEIGHT - 8}
                                    textAnchor={
                                        index === 0
                                            ? 'start'
                                            : index === pointCount - 1
                                              ? 'end'
                                              : 'middle'
                                    }
                                    className="fill-gray-400 text-[10px]"
                                >
                                    {coord.point.label}
                                </text>
                            );
                        })}

                        {coordinates.map((coord, index) => {
                            const hitWidth =
                                innerWidth / Math.max(1, pointCount);

                            return (
                                <rect
                                    key={`hit-${coord.point.key}`}
                                    x={coord.x - hitWidth / 2}
                                    y={PAD_TOP}
                                    width={hitWidth}
                                    height={innerHeight}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onFocus={() => setActiveIndex(index)}
                                    onClick={() => setActiveIndex(index)}
                                />
                            );
                        })}
                    </svg>

                    {activeCoord && (
                        <div
                            className="pointer-events-none absolute top-2 z-10 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
                            style={{
                                left: `${Math.min(72, Math.max(6, (activeCoord.x / SVG_WIDTH) * 100))}%`,
                            }}
                        >
                            <div className="text-[11px] font-medium text-gray-500">
                                {activeCoord.point.full_label}
                            </div>
                            <div className="text-sm font-extrabold text-[#DC2626] tabular-nums">
                                {formatRupiah(activeCoord.point.revenue)}
                            </div>
                            <div className="text-[11px] text-gray-600 tabular-nums">
                                {activeCoord.point.orders_count.toLocaleString(
                                    'id-ID',
                                )}{' '}
                                pesanan valid
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
