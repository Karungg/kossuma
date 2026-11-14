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
        <div className="sticky top-20 z-40 bg-[#F8F9FB]/95 backdrop-blur-md pt-2 pb-3" id="katalog-produk">
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onSelectCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isActive
                                        ? 'font-bold text-[#7D3394] bg-[#F0E6F5] shadow-2xs'
                                        : 'text-gray-600 font-medium'
                                }`}
                            >
                                {cat.id === 'all' && <LayoutGrid className="w-4 h-4 shrink-0" />}
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

