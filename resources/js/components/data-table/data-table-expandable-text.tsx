type Props = {
    text: string | null | undefined;
    isExpanded: boolean;
    onToggle: () => void;
    emptyText?: string;
    threshold?: number;
};

export function DataTableExpandableText({
    text,
    isExpanded,
    onToggle,
    emptyText = '-',
    threshold = 90,
}: Props) {
    if (!text || text.trim() === '') {
        return <span className="text-gray-400">{emptyText}</span>;
    }

    const isLong = text.length > threshold || text.includes('\n');

    return (
        <div className="flex flex-col items-start gap-1">
            <p
                className={`leading-relaxed break-words whitespace-pre-line text-gray-600 ${
                    isLong && !isExpanded ? 'line-clamp-2' : ''
                }`}
            >
                {text}
            </p>
            {isLong && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="cursor-pointer text-xs font-medium text-[#7D3394]"
                >
                    {isExpanded ? 'Ringkas' : 'Selengkapnya'}
                </button>
            )}
        </div>
    );
}
