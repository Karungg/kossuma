import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type QuantityStepperProps = {
    value: number;
    max: number;
    min?: number;
    disabled?: boolean;
    size?: 'sm' | 'md';
    autoCorrectDelayMs?: number;
    alignMessage?: 'left' | 'right';
    onChange: (nextQuantity: number) => void;
    onExceedStateChange?: (isExceeding: boolean) => void;
    onRemoveAtMin?: () => void;
    decrementAriaLabel?: string;
    incrementAriaLabel?: string;
    inputAriaLabel?: string;
    incrementDataTest?: string;
    inputDataTest?: string;
};

export function QuantityStepper({
    value,
    max,
    min = 1,
    disabled = false,
    size = 'md',
    autoCorrectDelayMs = 2000,
    alignMessage = 'left',
    onChange,
    onExceedStateChange,
    onRemoveAtMin,
    decrementAriaLabel = 'Kurangi jumlah',
    incrementAriaLabel = 'Tambah jumlah',
    inputAriaLabel = 'Jumlah pembelian',
    incrementDataTest,
    inputDataTest,
}: QuantityStepperProps) {
    const [draftValue, setDraftValue] = useState<string | null>(null);
    const [exceedMessage, setExceedMessage] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearAutoCorrectTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const clearExceedState = () => {
        clearAutoCorrectTimer();

        if (exceedMessage !== null) {
            setExceedMessage(null);
            onExceedStateChange?.(false);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const displayedValue = draftValue ?? String(value);
    const numericDisplay =
        draftValue !== null ? Number.parseInt(draftValue, 10) || value : value;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            return;
        }

        const digitsOnly = event.target.value.replace(/\D/g, '');

        if (digitsOnly === '') {
            clearExceedState();
            setDraftValue('');

            return;
        }

        const parsed = Number.parseInt(digitsOnly, 10);

        if (Number.isNaN(parsed) || parsed === 0) {
            clearExceedState();
            setDraftValue('0');

            return;
        }

        if (parsed > max) {
            setDraftValue(String(parsed));
            setExceedMessage(
                `Maks. pembelian barang ini ${max} item, mohon kurangi pembelianmu, ya`,
            );
            onExceedStateChange?.(true);

            clearAutoCorrectTimer();
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
                setDraftValue(null);
                setExceedMessage(null);
                onExceedStateChange?.(false);
                onChange(max);
            }, autoCorrectDelayMs);

            return;
        }

        clearExceedState();
        setDraftValue(null);
        onChange(Math.max(min, parsed));
    };

    const commitDraftValue = () => {
        if (draftValue === null) {
            return;
        }

        clearAutoCorrectTimer();
        const parsed = Number.parseInt(draftValue, 10);
        setDraftValue(null);

        if (exceedMessage !== null) {
            setExceedMessage(null);
            onExceedStateChange?.(false);
        }

        if (Number.isNaN(parsed) || parsed < min) {
            if (value !== min) {
                onChange(min);
            }

            return;
        }

        const clamped = Math.min(max, parsed);

        if (clamped !== value) {
            onChange(clamped);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commitDraftValue();
            event.currentTarget.blur();
        }
    };

    const handleDecrement = () => {
        if (disabled) {
            return;
        }

        clearExceedState();

        if (numericDisplay <= min) {
            if (onRemoveAtMin) {
                onRemoveAtMin();
            }

            return;
        }

        const next = Math.min(max, Math.max(min, numericDisplay - 1));
        setDraftValue(null);
        onChange(next);
    };

    const handleIncrement = () => {
        if (disabled || numericDisplay >= max) {
            return;
        }

        clearExceedState();
        const next = Math.min(max, Math.max(min, numericDisplay + 1));
        setDraftValue(null);
        onChange(next);
    };

    const isDecrementDisabled =
        disabled || (!onRemoveAtMin && numericDisplay <= min);
    const isIncrementDisabled = disabled || numericDisplay >= max;

    const isSmall = size === 'sm';

    return (
        <div
            className={cn(
                'flex flex-col gap-1.5',
                alignMessage === 'right'
                    ? 'items-start sm:items-end'
                    : 'items-start',
            )}
        >
            <div
                className={cn(
                    'inline-flex items-center rounded-lg border transition-colors',
                    isSmall
                        ? 'border-gray-200 bg-gray-100 p-1'
                        : 'border-gray-300 bg-white',
                    exceedMessage !== null &&
                        'border-[#DC2626] ring-2 ring-[#DC2626]/15',
                    disabled && 'opacity-50',
                )}
            >
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={isDecrementDisabled}
                    aria-label={decrementAriaLabel}
                    className={cn(
                        'flex shrink-0 cursor-pointer items-center justify-center text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300',
                        isSmall
                            ? 'h-7 w-7 rounded-md bg-white shadow-2xs disabled:opacity-50'
                            : 'h-8 w-8',
                    )}
                >
                    <Minus className="h-3.5 w-3.5" />
                </button>

                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={displayedValue}
                    disabled={disabled}
                    onChange={handleInputChange}
                    onBlur={commitDraftValue}
                    onKeyDown={handleKeyDown}
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label={inputAriaLabel}
                    aria-invalid={exceedMessage !== null}
                    data-test={inputDataTest}
                    className={cn(
                        'bg-transparent text-center text-sm font-bold text-gray-900 tabular-nums focus:outline-none disabled:cursor-not-allowed',
                        isSmall ? 'w-11 px-1' : 'w-12 px-1',
                        exceedMessage !== null && 'text-[#DC2626]',
                    )}
                />

                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={isIncrementDisabled}
                    aria-label={incrementAriaLabel}
                    data-test={incrementDataTest}
                    className={cn(
                        'flex shrink-0 cursor-pointer items-center justify-center text-[#7D3394] disabled:cursor-not-allowed disabled:text-gray-300',
                        isSmall
                            ? 'h-7 w-7 rounded-md bg-white shadow-2xs disabled:opacity-50'
                            : 'h-8 w-8',
                    )}
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
            </div>

            {exceedMessage !== null && (
                <p
                    role="alert"
                    data-test="quantity-exceed-message"
                    className={cn(
                        'max-w-[240px] text-xs leading-snug font-medium text-[#DC2626]',
                        alignMessage === 'right'
                            ? 'text-left sm:text-right'
                            : 'text-left',
                    )}
                >
                    {exceedMessage}
                </p>
            )}
        </div>
    );
}
