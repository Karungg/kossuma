import { useState } from 'react';
import { ChevronDown, ShieldCheck, Soup, Utensils } from 'lucide-react';

interface ProductAccordionsProps {
    composition: string;
    cookingInstructions: string[];
    halalAudit: string;
}

export function ProductAccordions({
    composition,
    cookingInstructions,
    halalAudit,
}: ProductAccordionsProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        komposisi: true,
        masak: true,
        halal: false,
    });

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className="flex flex-col gap-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            {/* Accordion Item 1: Komposisi */}
            <div className="flex flex-col">
                <button
                    type="button"
                    onClick={() => toggleSection('komposisi')}
                    className="w-full py-2.5 flex items-center justify-between text-left text-sm font-bold text-gray-900 focus:outline-none cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-[#7D3394]" />
                        <span>Komposisi &amp; Bumbu Rempah</span>
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            openSections.komposisi ? 'rotate-180' : ''
                        }`}
                    />
                </button>
                {openSections.komposisi && (
                    <div className="pt-1 pb-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {composition}
                    </div>
                )}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Accordion Item 2: Saran Penyajian */}
            <div className="flex flex-col">
                <button
                    type="button"
                    onClick={() => toggleSection('masak')}
                    className="w-full py-2.5 flex items-center justify-between text-left text-sm font-bold text-gray-900 focus:outline-none cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <Soup className="w-5 h-5 text-[#7D3394]" />
                        <span>Saran Penyajian Praktis</span>
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            openSections.masak ? 'rotate-180' : ''
                        }`}
                    />
                </button>
                {openSections.masak && (
                    <div className="pt-1 pb-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        <ol className="list-decimal pl-5 space-y-1.5">
                            {cookingInstructions.map((instruction, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: instruction }} />
                            ))}
                        </ol>
                    </div>
                )}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Accordion Item 3: Standar Halal Kossuma */}
            <div className="flex flex-col">
                <button
                    type="button"
                    onClick={() => toggleSection('halal')}
                    className="w-full py-2.5 flex items-center justify-between text-left text-sm font-bold text-gray-900 focus:outline-none cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#7D3394]" />
                        <span>Jaminan Mutu &amp; Audit Halal</span>
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            openSections.halal ? 'rotate-180' : ''
                        }`}
                    />
                </button>
                {openSections.halal && (
                    <div className="pt-1 pb-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {halalAudit}
                    </div>
                )}
            </div>
        </div>
    );
}

