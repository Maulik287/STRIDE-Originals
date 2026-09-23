import React, { useState, useEffect, useRef } from 'react';
import { Heart, Star, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Shoe, ShoeColorway } from '../types';
import { getBestMatchingColorIndex } from '../utils/colorMatcher';

interface ProductCardProps {
  shoe: Shoe;
  index?: number;
  isWishlisted: boolean;
  onToggleWishlist: (shoeId: string) => void;
  onSelectShoe: (shoe: Shoe, color?: ShoeColorway) => void;
  onQuickAddToCart: (shoe: Shoe, size: number, color: ShoeColorway) => void;
  activeFilterColors?: string[];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  shoe,
  index = 0,
  isWishlisted,
  onToggleWishlist,
  onSelectShoe,
  onQuickAddToCart,
  activeFilterColors = [],
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(() => 
    getBestMatchingColorIndex(shoe.colors, activeFilterColors)
  );
  const [showQuickSize, setShowQuickSize] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const activeColor = shoe.colors[selectedColorIndex] || shoe.colors[0];

  // Automatically update active preview to matching colorway variant when color filter changes
  useEffect(() => {
    if (activeFilterColors && activeFilterColors.length > 0) {
      const bestIdx = getBestMatchingColorIndex(shoe.colors, activeFilterColors);
      setSelectedColorIndex(bestIdx);
    } else {
      setSelectedColorIndex(0);
    }
  }, [activeFilterColors, shoe]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      id={`shoe-card-${shoe.id}`}
      onMouseMove={handleMouseMove}
      style={{
        transitionDelay: isVisible ? `${(index % 3) * 110}ms` : '0ms',
      }}
      className={`group relative bg-slate-950/85 hover:bg-slate-900/90 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 hover:border-cyan-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_60px_rgba(6,182,212,0.22)] transition-all duration-700 ease-out flex flex-col hover:-translate-y-2 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.97]'
      }`}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
        style={{
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.15), transparent 70%)`,
        }}
      />

      {/* Floating Badges & Wishlist Action Bar */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1.5">
          {shoe.isBestSeller && (
            <span className="inline-flex items-center gap-1.5 bg-slate-950/90 text-emerald-400 text-[9px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-emerald-500/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              BEST SELLER
            </span>
          )}
          {shoe.isNewArrival && (
            <span className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
              NEW DROP
            </span>
          )}
          {shoe.discountPercent && (
            <span className="inline-flex items-center bg-[#ff2a6d]/90 text-white text-[9px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
              -{shoe.discountPercent}%
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(shoe.id);
          }}
          className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-lg active:scale-90 ${
            isWishlisted
              ? 'bg-rose-950/80 text-[#ff2a6d] border border-rose-500/50 shadow-[0_0_15px_rgba(255,42,109,0.4)]'
              : 'bg-slate-900/80 text-slate-400 hover:text-[#ff2a6d] border border-white/10 hover:border-rose-500/40'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#ff2a6d]' : ''}`} />
        </button>
      </div>

      {/* Product Image Stage: Pristine & Completely Clean (Zero clunky inspect specs overlays) */}
      <div
        onClick={() => onSelectShoe(shoe, activeColor)}
        className="relative w-full aspect-square bg-gradient-to-b from-slate-900/40 via-slate-950/70 to-slate-950 overflow-hidden cursor-pointer flex items-center justify-center p-3"
      >
        <img
          src={activeColor.image}
          alt={`${shoe.name} - ${activeColor.name}`}
          className="w-full h-full object-cover object-center group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Minimalist Floating Corner Indicator (Subtle & Unobtrusive) */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/20 text-cyan-400 text-[10px] font-mono-code font-semibold backdrop-blur-md shadow-lg">
            Details <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Quick Size Flyout Drawer */}
      {showQuickSize && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-950/95 backdrop-blur-2xl p-3.5 border-t border-white/15 z-30 animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono-code font-bold text-white uppercase tracking-wider">
              {shoe.category === 'Equipment' || shoe.category === 'Bags' ? 'Select Size:' : 'Select Size (US):'}
            </span>
            <button
              onClick={() => setShowQuickSize(false)}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer font-mono-code"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {shoe.sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onQuickAddToCart(shoe, s, activeColor);
                  setShowQuickSize(false);
                }}
                className="py-1.5 text-[11px] font-mono-code font-bold bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-white rounded-lg border border-white/10 hover:border-cyan-400 transition-colors cursor-pointer"
              >
                {shoe.category === 'Equipment' || shoe.category === 'Bags' ? 'One Size' : `US ${s}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shoe Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-slate-950/50">
        <div>
          {/* Color preview circles */}
          <div className="flex items-center gap-1.5 mb-2.5">
            {shoe.colors.map((color, idx) => (
              <button
                key={color.name}
                onClick={() => setSelectedColorIndex(idx)}
                title={color.name}
                className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-all cursor-pointer ${
                  selectedColorIndex === idx
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <span className="text-[10px] font-mono-code text-slate-400 ml-1 font-medium">
              {shoe.colors.length} {shoe.colors.length === 1 ? 'colorway' : 'colorways'}
            </span>
          </div>

          {/* Series & Category */}
          <div className="text-[10px] font-mono-code font-bold uppercase tracking-widest text-cyan-400 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            {shoe.series} • {shoe.gender}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectShoe(shoe, activeColor)}
            className="font-heading text-base font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer leading-tight mb-1 truncate"
          >
            {shoe.name}
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-slate-400 line-clamp-1 mb-2 font-normal">
            {shoe.subtitle}
          </p>
        </div>

        {/* Bottom Section: Rating, Price & Quick Add */}
        <div className="pt-2.5 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-mono-code font-bold text-white">{shoe.rating.toFixed(1)}</span>
              <span className="text-[11px] font-mono-code text-slate-400">({shoe.reviewCount})</span>
            </div>

            {/* Fit consensus badge */}
            <span className="text-[10px] font-mono-code font-semibold px-2 py-0.5 bg-cyan-950/70 text-cyan-300 rounded-md border border-cyan-500/30">
              {shoe.fitSummary.trueToSizePct}% True Fit
            </span>
          </div>

          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-black text-white">
                ${shoe.price}
              </span>
              {shoe.originalPrice && (
                <span className="text-xs text-slate-500 line-through font-mono-code">
                  ${shoe.originalPrice}
                </span>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickSize(!showQuickSize)}
              className="p-2 bg-slate-900 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 rounded-xl transition-all cursor-pointer border border-white/15 hover:border-cyan-400 shadow-lg active:scale-95"
              title="Quick Add to Bag"
              aria-label="Quick Add to Bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
