import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

type Props = {
    value: string;
    onSearch: (
        term: string,
        callbacks: { onStart: () => void; onFinish: () => void },
    ) => void;
    onClear: () => void;
    placeholder?: string;
    ariaLabel?: string;
    debounceMs?: number;
    dataTest?: string;
};

export function DataTableSearch({
    value,
    onSearch,
    onClear,
    placeholder = 'Cari data...',
    ariaLabel = 'Cari data',
    debounceMs = 350,
    dataTest,
}: Props) {
    const [search, setSearch] = useState(value);
    const [isSearching, setIsSearching] = useState(false);
    const onSearchRef = useRef(onSearch);

    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        if (search.trim() === value.trim()) {
            return;
        }

        const timeout = setTimeout(() => {
            onSearchRef.current(search.trim(), {
                onStart: () => setIsSearching(true),
                onFinish: () => setIsSearching(false),
            });
        }, debounceMs);

        return () => clearTimeout(timeout);
    }, [search, value, debounceMs]);

    const handleClear = () => {
        setSearch('');
        onClear();
    };

    return (
        <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape' && search !== '') {
                        handleClear();
                    }
                }}
                placeholder={placeholder}
                aria-label={ariaLabel}
                data-test={dataTest}
                className="h-11 rounded-xl border-gray-200 bg-white pr-16 pl-10 focus-visible:border-[#7D3394] focus-visible:ring-[#7D3394]/20"
            />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5">
                {isSearching && (
                    <Loader2 className="h-4 w-4 animate-spin text-[#7D3394]" />
                )}
                {search !== '' && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Hapus pencarian"
                        className="cursor-pointer text-gray-400"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
