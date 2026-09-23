import React from 'react';
import { 
  X, 
  RotateCcw, 
  Star, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { FilterState } from '../types';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  totalResults: number;
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

const AVAILABLE_SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#18181B' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Cream / Gum', hex: '#E6D7BD' },
  { name: 'Green', hex: '#166534' },
  { name: 'Blue', hex: '#1D4ED8' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Grey', hex: '#6B7280' },
];

const GENDER_OPTIONS = ['Men', 'Women', 'Unisex'];
const CATEGORY_OPTIONS = [
  { id: 'Classics', label: 'Terrace Heritage' },
  { id: 'Running', label: 'Running & Boost' },
  { id: 'Skate', label: 'Skate & Street' },
  { id: 'Basketball', label: 'Basketball' },
  { id: 'Slides', label: 'Recovery Slides' },
  { id: 'Equipment', label: 'Training Equipment' },
  { id: 'Bags', label: 'Bags & Packs' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
  totalResults,
  isMobileModal,
  onCloseMobile,
}) => {
  const toggleCategory = (cat: string) => {
    const exists = filters.categories.includes(cat);
    const newCategories = exists
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFilterChange({ categories: newCategories });
  };

  const toggleGender = (gender: string) => {
    const exists = filters.genders.includes(gender);
    const newGenders = exists
      ? filters.genders.filter((g) => g !== gender)
      : [...filters.genders, gender];
    onFilterChange({ genders: newGenders });
  };

  const toggleSize = (size: number) => {
    const exists = filters.selectedSizes.includes(size);
    const newSizes = exists
      ? filters.selectedSizes.filter((s) => s !== size)
      : [...filters.selectedSizes, size];
    onFilterChange({ selectedSizes: newSizes });
  };

  const toggleColor = (colorName: string) => {
    const exists = filters.selectedColors.includes(colorName);
    const newColors = exists
      ? filters.selectedColors.filter((c) => c !== colorName)
      : [...filters.selectedColors, colorName];
    onFilterChange({ selectedColors: newColors });
  };

  return (
    <div className={`space-y-6 ${isMobileModal ? 'p-6 bg-slate-950 text-white' : 'bg-slate-950/85 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white'}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono-code font-bold tracking-wider uppercase text-white">
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              id="clear-all-filters-btn"
              onClick={onResetFilters}
              className="text-xs font-mono-code font-semibold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          {isMobileModal && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-xs font-mono-code font-extrabold uppercase tracking-wider text-slate-300 mb-3">
          Category
        </h3>
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const isChecked = filters.categories.includes(cat.id);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-cyan-400 cursor-pointer font-medium transition-colors font-mono-code"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-500 cursor-pointer accent-cyan-500 bg-slate-900"
                />
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-mono-code font-extrabold uppercase tracking-wider text-slate-300 mb-3">
          Gender / Fit
        </h3>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => {
            const isSelected = filters.genders.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGender(g)}
                className={`text-xs font-mono-code font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900/90 text-slate-300 border-white/10 hover:border-cyan-400/50 hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* US Shoe Size Grid */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono-code font-extrabold uppercase tracking-wider text-slate-300">
            Size (US)
          </h3>
          {filters.selectedSizes.length > 0 && (
            <span className="text-[11px] font-mono-code font-bold text-cyan-400">
              {filters.selectedSizes.length} selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {AVAILABLE_SIZES.map((size) => {
            const isSelected = filters.selectedSizes.includes(size);
            return (
              <button
                key={size}
                id={`filter-size-${size}`}
                onClick={() => toggleSize(size)}
                className={`h-9 text-xs font-mono-code font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-cyan-400/50 hover:bg-slate-850 hover:text-white'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Family */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono-code font-extrabold uppercase tracking-wider text-slate-300">
            Color Family
          </h3>
          {filters.selectedColors.length > 0 && (
            <span className="text-[11px] font-mono-code font-bold text-cyan-400">
              {filters.selectedColors.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => {
            const isSelected = filters.selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                id={`filter-color-${color.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => toggleColor(color.name)}
                title={color.name === 'Cream / Gum' ? 'Cream / Brown / Gum / Tan' : color.name}
                className={`relative w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                  color.border ? 'border border-white/30' : ''
                } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-[0_0_12px_rgba(6,182,212,0.6)]' : 'hover:scale-105'}`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      color.name === 'White' || color.name === 'Cream / Gum'
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Color Chips */}
        {filters.selectedColors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filters.selectedColors.map((colorName) => {
              const opt = COLOR_OPTIONS.find((c) => c.name === colorName);
              return (
                <span
                  key={colorName}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono-code font-semibold text-cyan-300 shadow-sm"
                >
                  <span
                    className="w-2 h-2 rounded-full border border-white/20"
                    style={{ backgroundColor: opt?.hex || '#94a3b8' }}
                  />
                  {colorName}
                  <button
                    onClick={() => toggleColor(colorName)}
                    className="hover:text-white cursor-pointer ml-0.5"
                    aria-label={`Remove ${colorName} filter`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Dual-Thumb Slider */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono-code font-extrabold uppercase tracking-wider text-slate-300">
            Price Range
          </h3>
          <span className="text-xs font-mono-code font-bold text-cyan-400">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </span>
        </div>

        {/* Dual-Thumb Track Container */}
        <div className="dual-range-slider-container my-1">
          {/* Base Inactive Track */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full relative overflow-hidden pointer-events-none">
            {/* Active Range Highlight */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{
                left: `${Math.max(0, Math.min(100, (filters.priceRange[0] / 250) * 100))}%`,
                width: `${Math.max(0, Math.min(100, ((filters.priceRange[1] - filters.priceRange[0]) / 250) * 100))}%`,
              }}
            />
          </div>

          {/* Left Thumb Input (Min Price: $0 - $250) */}
          <input
            type="range"
            min="0"
            max="250"
            step="5"
            value={filters.priceRange[0]}
            onChange={(e) => {
              const val = Math.min(parseInt(e.target.value, 10), filters.priceRange[1] - 5);
              onFilterChange({
                priceRange: [val, filters.priceRange[1]],
              });
            }}
            className="dual-range-input"
            style={{ zIndex: filters.priceRange[0] > 180 ? 25 : 20 }}
            aria-label="Minimum price filter"
          />

          {/* Right Thumb Input (Max Price: $0 - $250) */}
          <input
            type="range"
            min="0"
            max="250"
            step="5"
            value={filters.priceRange[1]}
            onChange={(e) => {
              const val = Math.max(parseInt(e.target.value, 10), filters.priceRange[0] + 5);
              onFilterChange({
                priceRange: [filters.priceRange[0], val],
              });
            }}
            className="dual-range-input"
            style={{ zIndex: 21 }}
            aria-label="Maximum price filter"
          />
        </div>

        {/* Range Legend Markers */}
        <div className="flex justify-between text-[11px] font-mono-code text-slate-400 font-medium mt-1">
          <span>$0</span>
          <span>$125</span>
          <span>$250</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-mono-code font-extrabold uppercase tracking-wider text-slate-300 mb-3">
          Customer Rating
        </h3>
        <div className="space-y-1.5">
          {[4.8, 4.5, 4.0].map((star) => (
            <button
              key={star}
              onClick={() =>
                onFilterChange({
                  minRating: filters.minRating === star ? 0 : star,
                })
              }
              className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                filters.minRating === star
                  ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'bg-slate-900/50 border-white/5 hover:bg-slate-900 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Star
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
                <span className="font-mono-code">{star} stars & above</span>
              </div>
              {filters.minRating === star && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles (In Stock / On Sale) */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <label className="flex items-center justify-between text-xs font-mono-code font-semibold text-slate-300 cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.onlyInStock}
            onChange={(e) => onFilterChange({ onlyInStock: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-500 cursor-pointer accent-cyan-500"
          />
        </label>
        <label className="flex items-center justify-between text-xs font-mono-code font-semibold text-slate-300 cursor-pointer">
          <span className="text-[#ff2a6d] font-bold">On Sale / Discounted</span>
          <input
            type="checkbox"
            checked={filters.onlySale}
            onChange={(e) => onFilterChange({ onlySale: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 text-[#ff2a6d] focus:ring-[#ff2a6d] cursor-pointer accent-[#ff2a6d]"
          />
        </label>
      </div>

      {isMobileModal && (
        <div className="pt-6 border-t border-white/10">
          <button
            onClick={onCloseMobile}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg hover:scale-102 transition-transform"
          >
            Show {totalResults} Footwear Styles
          </button>
        </div>
      )}
    </div>
  );
};
