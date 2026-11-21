import { LayoutGrid } from 'lucide-react';
import type { CategoryTab } from '../types';

interface CategoryTabsProps {
    categories: CategoryTab[];
    activeCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export function CategoryTabs({
    categories,
    activeCategory,
    onSelectCategory,
}: CategoryTabsProps) {
    return (
        <div
            className="sticky top-20 z-40 bg-[#F8F9FB]/95 pt-2 pb-3 backdrop-blur-md"
            id="katalog-produk"
        >
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-xs md:flex-row md:items-center">
                <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onSelectCategory(cat.id)}
                                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs whitespace-nowrap transition-all sm:text-sm ${
                                    isActive
                                        ? 'bg-[#F0E6F5] font-bold text-[#7D3394] shadow-2xs'
                                        : 'font-medium text-gray-600'
                                }`}
                            >
                                {cat.id === 'all' && (
                                    <LayoutGrid className="h-4 w-4 shrink-0" />
                                )}
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
