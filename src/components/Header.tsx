import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  PackageCheck, 
  X, 
  SlidersHorizontal,
  ShieldCheck,
  RotateCcw,
  Truck,
  Sparkles
} from 'lucide-react';
import { Shoe } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  cartCount: number;
  wishlistCount: number;
  orderCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenMobileFilters: () => void;
  allShoes: Shoe[];
  onSelectShoe: (shoe: Shoe) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'Classics', label: 'Terrace Heritage' },
  { id: 'Running', label: 'Running & Boost' },
  { id: 'Skate', label: 'Skate & Street' },
  { id: 'Basketball', label: 'Basketball' },
  { id: 'Slides', label: 'Recovery Slides' },
  { id: 'Equipment', label: 'Equipment' },
  { id: 'Bags', label: 'Bags & Packs' },
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  orderCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenMobileFilters,
  allShoes,
  onSelectShoe,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter shoes for instant search suggestions
  const searchSuggestions = searchQuery.trim()
    ? allShoes.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const input = document.getElementById('main-search-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-colors duration-300">
      {/* Top Cyber Value Proposition Strip */}
      <div className="bg-slate-950/95 border-b border-white/10 text-slate-300 text-xs py-2 px-4 font-mono-code tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-center sm:text-left">
          <div className="flex items-center gap-6 mx-auto sm:mx-0 overflow-x-auto py-0.5 no-scrollbar">
            <span className="flex items-center gap-1.5 whitespace-nowrap text-[#00f59b] font-bold">
              <Truck className="w-3.5 h-3.5" />
              EXPRESS GLOBAL COURIER OVER $100
            </span>
            <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap text-cyan-300 font-medium">
              <RotateCcw className="w-3.5 h-3.5 text-[#06b6d4]" />
              30-DAY HASSLE-FREE ARCHIVE EXCHANGES
            </span>
            <span className="hidden lg:flex items-center gap-1.5 whitespace-nowrap text-pink-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff2a6d]" />
              100% VERIFIED AUTHENTIC FOOTWEAR
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <button
              id="header-orders-button"
              onClick={onOpenOrders}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Orders {orderCount > 0 && `(${orderCount})`}</span>
            </button>
            <span className="text-white/20">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              VIP Concierge Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => {
                onSelectCategory('all');
                onSearchChange('');
              }}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              {/* Geometric 3-stripes Icon */}
              <div className="w-10 h-10 bg-slate-900 border border-white/15 rounded-xl flex items-center justify-center p-2 shadow-lg group-hover:border-cyan-400/60 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                <div className="w-full h-full flex items-end justify-between gap-0.5">
                  <div className="w-1.5 h-3 bg-white rounded-xs"></div>
                  <div className="w-1.5 h-5 bg-cyan-400 rounded-xs shadow-[0_0_8px_#06b6d4]"></div>
                  <div className="w-1.5 h-7 bg-[#00f59b] rounded-xs shadow-[0_0_8px_#00f59b]"></div>
                </div>
              </div>
              <div>
                <div className="font-heading text-xl sm:text-2xl font-black tracking-tight text-white leading-none flex items-center gap-1.5">
                  STRIDE
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#06b6d4]"></span>
                </div>
                <div className="text-[9px] font-mono-code font-bold tracking-[0.25em] text-cyan-400/80 uppercase leading-tight mt-1">
                  NEO-TOKYO • ARCHIVE
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar with Live Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block">
            <div
              className={`flex items-center w-full px-4 py-2.5 rounded-full border transition-all duration-200 ${
                isSearchFocused
                  ? 'border-cyan-400 ring-2 ring-cyan-500/20 bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'border-white/15 bg-slate-900/80 hover:bg-slate-900 hover:border-cyan-400/40'
              }`}
            >
              <Search className="w-4 h-4 text-cyan-400 mr-2.5 shrink-0" />
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowSearchDropdown(true);
                }}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search Sambas, Gazelles, Boost, Skate, Leather..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[10px] font-mono-code font-bold text-slate-400 border border-white/15 px-1.5 py-0.5 rounded bg-slate-950 shadow-xs">
                  /
                </span>
              )}
            </div>

            {/* Quick Live Search Dropdown */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.15)] border border-white/15 p-3 z-50 animate-in fade-in-50">
                <div className="text-[11px] font-mono-code font-bold text-cyan-400 uppercase tracking-wider mb-2 px-2">
                  Matching Footwear ({searchSuggestions.length})
                </div>
                {searchSuggestions.length > 0 ? (
                  <div className="space-y-1">
                    {searchSuggestions.map((shoe) => (
                      <button
                        key={shoe.id}
                        onClick={() => {
                          onSelectShoe(shoe);
                          setShowSearchDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-900 rounded-xl text-left transition-colors cursor-pointer border border-transparent hover:border-cyan-500/30"
                      >
                        <img
                          src={shoe.colors[0]?.image || shoe.images[0]}
                          alt={shoe.name}
                          className="w-12 h-12 object-cover rounded-lg bg-slate-900 shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-bold text-white truncate">{shoe.name}</p>
                          <p className="text-xs text-slate-400 truncate">{shoe.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-heading font-extrabold text-cyan-400">${shoe.price}</span>
                          <div className="text-[11px] text-amber-400 font-mono-code font-bold flex items-center justify-end">
                            ★ {shoe.rating}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No shoes found for "{searchQuery}". Try "Samba", "Boost", or "Heritage".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Filter Toggle */}
            <button
              id="mobile-filters-trigger"
              onClick={onOpenMobileFilters}
              className="md:hidden p-2.5 text-slate-300 hover:text-white bg-slate-900/80 border border-white/15 rounded-full cursor-pointer relative hover:border-cyan-400/50"
              aria-label="Filter shoes"
            >
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            </button>

            {/* Wishlist Button */}
            <button
              id="header-wishlist-btn"
              onClick={onOpenWishlist}
              className="relative p-2.5 text-slate-300 hover:text-[#ff2a6d] bg-slate-900/80 border border-white/15 hover:border-rose-500/40 rounded-full transition-colors cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-pink-600 to-[#ff2a6d] text-white text-[10px] font-mono-code font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button with 21st.dev Shimmer */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="shimmer-btn relative flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-full transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] font-mono-code font-black hover:scale-105 active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.3]" />
              <span className="text-xs uppercase tracking-wider font-extrabold">
                BAG
              </span>
              <span className="bg-slate-950 text-cyan-300 text-[11px] font-mono-code font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs border border-cyan-500/30">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="flex items-center w-full px-3.5 py-2 rounded-full border border-white/15 bg-slate-900/80 text-white">
            <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sneakers..."
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="p-1 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Category Bar - 21st.dev Floating Pill Strip */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-white/10 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-nav-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`text-xs font-mono-code font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:scale-105'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
