import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUpDown, 
  ChevronDown, 
  Check, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Flame 
} from 'lucide-react';

export type SortOptionId = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface SortOption {
  id: SortOptionId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const SORT_OPTIONS: SortOption[] = [
  { 
    id: 'featured', 
    label: 'Featured / Best Sellers', 
    shortLabel: 'Featured',
    icon: Sparkles 
  },
  { 
    id: 'price-asc', 
    label: 'Price: Low to High', 
    shortLabel: 'Price: Low to High',
    icon: TrendingDown 
  },
  { 
    id: 'price-desc', 
    label: 'Price: High to Low', 
    shortLabel: 'Price: High to Low',
    icon: TrendingUp 
  },
  { 
    id: 'rating', 
    label: 'Customer Rating', 
    shortLabel: 'Rating: Highest',
    icon: Star 
  },
  { 
    id: 'newest', 
    label: 'Newest Drops', 
    shortLabel: 'Newest Drops',
    icon: Flame 
  },
];

interface CustomSortDropdownProps {
  value: SortOptionId;
  onChange: (value: SortOptionId) => void;
}

export const CustomSortDropdown: React.FC<CustomSortDropdownProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.id === value) || SORT_OPTIONS[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${isOpen ? 'z-50' : 'z-20'}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id="sort-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono-code font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
          isOpen
            ? 'bg-slate-900 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : 'bg-slate-900/90 hover:bg-slate-850/90 text-slate-200 border-white/15 hover:border-cyan-400/50 shadow-sm'
        }`}
      >
        <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${isOpen ? 'text-cyan-400' : 'text-slate-400'}`} />
        <span className="text-slate-400 hidden sm:inline">SORT:</span>
        <span className="text-white max-w-[140px] sm:max-w-none truncate">{selectedOption.shortLabel}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`} 
        />
      </button>

      {/* Floating Glassmorphic Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.15)] z-50 p-1.5 animate-in fade-in-50 zoom-in-95 duration-150"
          role="listbox"
        >
          <div className="px-3 py-1.5 mb-1 border-b border-white/10">
            <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest text-cyan-400">
              Select Sort Order
            </span>
          </div>

          <div className="space-y-1">
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.id === value;
              const IconComponent = option.icon;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/25 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent 
                      className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} 
                    />
                    <span>{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
