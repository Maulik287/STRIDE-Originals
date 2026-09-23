import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Ruler, 
  ThumbsUp, 
  Check, 
  MessageSquarePlus,
  Sparkles,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { Shoe, ShoeColorway, ShoeReview } from '../types';

interface ProductDetailModalProps {
  shoe: Shoe | null;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (shoeId: string) => void;
  onAddToCart: (shoe: Shoe, size: number, color: ShoeColorway, quantity: number) => void;
  onOpenSizeGuide: () => void;
  onOpenWriteReview: (shoe: Shoe) => void;
  onToggleReviewHelpful: (shoeId: string, reviewId: string) => void;
  onTriggerVoiceTour?: (shoe: Shoe) => void;
  initialColor?: ShoeColorway | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  shoe,
  isOpen,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenSizeGuide,
  onOpenWriteReview,
  onToggleReviewHelpful,
  onTriggerVoiceTour,
  initialColor,
}) => {
  if (!isOpen || !shoe) return null;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<ShoeColorway>(shoe.colors[0]);
  const [selectedSize, setSelectedSize] = useState<number>(shoe.sizes[2] || shoe.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'reviews' | 'specs' | 'details'>('reviews');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isSpeakingSpecs, setIsSpeakingSpecs] = useState(false);

  // Synchronize color, size whenever a new shoe is selected or modal opens
  useEffect(() => {
    if (shoe && isOpen) {
      const targetColor = (initialColor && shoe.colors.find(c => c.name === initialColor.name)) || shoe.colors[0];
      setSelectedColor(targetColor);
      setSelectedSize(shoe.sizes[2] || shoe.sizes[0]);
      setQuantity(1);
    }
  }, [shoe?.id, isOpen, initialColor]);

  // Reset scroll container position to top whenever a product is opened or changes
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen, shoe?.id]);

  const isLowStock = shoe.lowStockSizes?.includes(selectedSize);

  // Calculate star distribution
  const totalReviews = shoe.reviews.length;
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  shoe.reviews.forEach((r) => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  });

  const filteredReviews = selectedRatingFilter
    ? shoe.reviews.filter((r) => r.rating === selectedRatingFilter)
    : shoe.reviews;

  const handleAddToCart = () => {
    onAddToCart(shoe, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  // Speak shoe specs using Native $0 Web Speech API
  const handleSpeakSpecs = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingSpecs) {
      window.speechSynthesis.cancel();
      setIsSpeakingSpecs(false);
      return;
    }

    window.speechSynthesis.cancel();
    const narrationText = `Here are the engineering specifications for ${shoe.name}. ${shoe.subtitle}. The upper is crafted from ${shoe.specs.upper}. Ground contact is handled by ${shoe.specs.outsole}. Verified fit telemetry indicates ${shoe.fitSummary.trueToSizePct} percent true to size satisfaction.`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.pitch = 0.88;
    utterance.rate = 1.10;

    const voices = window.speechSynthesis.getVoices();
    const deepMaleVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('daniel'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (deepMaleVoice) utterance.voice = deepMaleVoice;

    utterance.onend = () => setIsSpeakingSpecs(false);
    utterance.onerror = () => setIsSpeakingSpecs(false);

    setIsSpeakingSpecs(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xl overflow-hidden"
      data-lenis-prevent="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isSpeakingSpecs && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          onClose();
        }
      }}
    >
      <div 
        className="relative bg-slate-950/95 text-white w-full max-w-5xl rounded-3xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in-50 zoom-in-95"
        data-lenis-prevent="true"
      >
        {/* Top High-Tech Laser Glow Strip */}
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-[#0066ff] to-emerald-400 animate-border-glow shrink-0" />

        {/* Floating Close Button */}
        <button
          onClick={() => {
            if (isSpeakingSpecs && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full border border-white/15 hover:border-cyan-400/50 shadow-xl backdrop-blur-md transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container with data-lenis-prevent and min-h-0 */}
        <div 
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-white/15"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: High-Res Studio Photography Gallery (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Studio Gallery Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs shrink-0"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-slate-300">
                    {selectedColor.name}
                  </span>
                </div>

                {/* Voice Spec Reader */}
                <button
                  onClick={handleSpeakSpecs}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSpeakingSpecs
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 border-white/10'
                  }`}
                  title="Voice Guide Spec Reader"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeakingSpecs ? 'Speaking...' : 'Sonic Specs'}</span>
                </button>
              </div>

              {/* Main Stage: High-Resolution Authentic Photography (1 image per color) */}
              <div className="relative aspect-4/3 sm:aspect-square bg-gradient-to-b from-slate-900/70 via-slate-950/90 to-slate-950 rounded-2xl overflow-hidden border border-white/15 group shadow-inner">
                <img
                  src={selectedColor.image}
                  alt={`${shoe.name} - ${selectedColor.name}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                  <span className="bg-slate-950/90 text-emerald-400 text-xs font-mono-code font-bold uppercase tracking-wider px-3 py-1 rounded-lg shadow-lg border border-emerald-500/30 backdrop-blur-md">
                    {shoe.series}
                  </span>
                  {shoe.discountPercent && (
                    <span className="bg-gradient-to-r from-pink-600 to-[#ff2a6d] text-white text-xs font-mono-code font-bold uppercase tracking-wider px-3 py-1 rounded-lg shadow-lg border border-pink-400/30">
                      SAVE {shoe.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Floating Wishlist Button on Image Stage */}
                <button
                  onClick={() => onToggleWishlist(shoe.id)}
                  className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
                    isWishlisted
                      ? 'bg-slate-950/90 text-[#ff2a6d] border-pink-500/50 shadow-[0_0_15px_rgba(255,42,109,0.35)]'
                      : 'bg-slate-950/70 text-slate-400 hover:text-[#ff2a6d] border-white/15 hover:border-pink-500/40 hover:bg-slate-900/90'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  aria-label={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#ff2a6d] text-[#ff2a6d]' : ''}`} />
                </button>

                {/* Bottom Colorway Badge */}
                <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15 text-[11px] font-mono-code text-slate-300 font-semibold shadow-md flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span className="text-cyan-400 font-bold">{selectedColor.name.split('/')[0]}</span>
                  {shoe.colors.length > 1 && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span>{shoe.colors.findIndex((c) => c.name === selectedColor.name) + 1} of {shoe.colors.length}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Colorway / Product Photo Thumbnails Tray */}
              <div className="p-3.5 bg-slate-900/50 rounded-2xl border border-white/10 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono-code text-slate-400 mb-2.5">
                  <span className="uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    {shoe.colors.length > 1 ? `Available Colorways (${shoe.colors.length})` : 'Available Colorways (3)'}
                  </span>
                  <span className="text-[11px] text-cyan-400 font-medium">
                    Authentic Studio Shot
                  </span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                  {shoe.colors.map((c) => {
                    const isSelected = selectedColor.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`group relative flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                            : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30 bg-slate-900/80 hover:bg-slate-900'
                        }`}
                      >
                        <div className="w-20 h-16 rounded-lg overflow-hidden relative">
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span
                            className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                          />
                        </div>
                        <span className="text-[10px] font-mono-code font-bold mt-1 text-slate-300 group-hover:text-cyan-400 uppercase tracking-tight truncate max-w-[100px]">
                          {c.name.includes(' - ') ? c.name : c.name.split('/')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                <div className="p-3 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-white/10 hover:border-cyan-400/30 transition-colors">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-300">
                    Free 2-Day Delivery
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-white/10 hover:border-emerald-400/30 transition-colors">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-300">
                    30-Day Hassle Free
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-white/10 hover:border-[#ff2a6d]/30 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-[#ff2a6d]" />
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-300">
                    100% Authentic
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Purchasing & Fit Details (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                {/* Gender & Category Subheader - Clear 56px clearance from absolute close button */}
                <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-widest text-cyan-400 mb-1.5 pr-14">
                  <span>{shoe.category} • {shoe.gender === 'Unisex' ? 'Unisex Edition' : `${shoe.gender}'s Collection`}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">In Stock</span>
                </div>

                {/* Title */}
                <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight mb-2 drop-shadow-sm pr-14">
                  {shoe.name}
                </h1>

                {/* Rating summary */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          shoe.rating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono-code font-bold text-white">{shoe.rating.toFixed(1)}</span>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={() => {
                      setActiveTab('reviews');
                      const element = document.getElementById('reviews-anchor');
                      if (element && scrollContainerRef.current) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-cyan-400 underline cursor-pointer transition-colors"
                  >
                    {shoe.reviewCount} customer reviews
                  </button>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-heading text-3xl font-black text-white">
                    ${shoe.price}
                  </span>
                  {shoe.originalPrice && (
                    <span className="text-base text-slate-500 line-through font-mono-code">
                      ${shoe.originalPrice}
                    </span>
                  )}
                  {shoe.discountPercent && (
                    <span className="text-xs font-mono-code font-bold text-[#ff2a6d] bg-pink-500/10 border border-pink-500/30 px-2.5 py-0.5 rounded-full">
                      Save ${shoe.originalPrice! - shoe.price}
                    </span>
                  )}
                </div>

                {/* Colorways */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-mono-code font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <span>Active Colorway:</span>
                    <span className="text-cyan-400 font-bold">{selectedColor.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {shoe.colors.map((c) => {
                      const isSelected = selectedColor.name === c.name;
                      return (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c)}
                          className={`group flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                              : 'border-white/10 hover:border-white/30 bg-slate-900/70 text-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-xs font-medium text-slate-200 pr-1">
                            {c.name.includes(' - ') ? c.name : c.name.split('/')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selector & Guide */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-slate-300">
                      {shoe.category === 'Equipment' || shoe.category === 'Bags'
                        ? 'Select Size / Specification:'
                        : 'Select Size (US Men / Unisex):'}
                    </span>
                    {shoe.category !== 'Equipment' && shoe.category !== 'Bags' && (
                      <button
                        onClick={onOpenSizeGuide}
                        className="text-xs font-bold text-slate-400 hover:text-cyan-400 underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        Size Guide & Fit Chart
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {shoe.sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      const isLow = shoe.lowStockSizes?.includes(s);
                      const isGear = shoe.category === 'Equipment' || shoe.category === 'Bags';
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`relative py-2.5 text-xs font-mono-code font-bold rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                              : 'bg-slate-900/70 text-slate-200 border-white/10 hover:border-cyan-400/50 hover:bg-slate-800/80'
                          }`}
                        >
                          <span>{isGear ? 'One Size' : s}</span>
                          {isLow && (
                            <span
                              className={`text-[8px] font-extrabold uppercase ${
                                isSelected ? 'text-white' : 'text-amber-400'
                              }`}
                            >
                              Low
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isLowStock && (
                    <p className="mt-2 text-xs font-semibold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Hurry, only 2 pairs left in US {selectedSize}!
                    </p>
                  )}
                </div>

                {/* Sizing Fit Consensus Bar */}
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10 mb-6 shadow-inner">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono-code font-bold text-slate-300 uppercase tracking-wider">
                      Fit Consensus Telemetry:
                    </span>
                    <span className="font-mono-code font-extrabold text-cyan-400">
                      {shoe.fitSummary.trueToSizePct}% True to size
                    </span>
                  </div>

                  {/* Horizontal Segmented Progress Bar */}
                  <div className="h-2 w-full bg-slate-800 rounded-full flex overflow-hidden border border-white/10">
                    <div
                      style={{ width: `${shoe.fitSummary.runsSmallPct}%` }}
                      className="bg-slate-700"
                      title={`Runs Small: ${shoe.fitSummary.runsSmallPct}%`}
                    ></div>
                    <div
                      style={{ width: `${shoe.fitSummary.trueToSizePct}%` }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                      title={`True to Size: ${shoe.fitSummary.trueToSizePct}%`}
                    ></div>
                    <div
                      style={{ width: `${shoe.fitSummary.runsLargePct}%` }}
                      className="bg-slate-700"
                      title={`Runs Large: ${shoe.fitSummary.runsLargePct}%`}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono-code text-slate-400 uppercase tracking-wider mt-1.5">
                    <span>Runs Small ({shoe.fitSummary.runsSmallPct}%)</span>
                    <span className="text-cyan-400 font-bold">True To Size</span>
                    <span>Runs Large ({shoe.fitSummary.runsLargePct}%)</span>
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-white/15 rounded-xl bg-slate-900/80 px-2 py-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-9 text-slate-400 hover:text-white font-bold text-base cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-mono-code font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(5, quantity + 1))}
                      className="w-8 h-9 text-slate-400 hover:text-white font-bold text-base cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    id="modal-add-to-bag-btn"
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-heading text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      addedAnimation
                        ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        Added to Shopping Bag!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                        Add to Bag • ${(shoe.price * quantity).toFixed(2)}
                      </>
                    )}
                  </button>

                  {/* Dedicated Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(shoe.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0 ${
                      isWishlisted
                        ? 'bg-pink-500/15 border-pink-500/50 text-[#ff2a6d] shadow-[0_0_15px_rgba(255,42,109,0.3)]'
                        : 'bg-slate-900/80 border-white/15 text-slate-300 hover:text-[#ff2a6d] hover:border-pink-500/40 hover:bg-slate-800'
                    }`}
                    title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                    aria-label={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#ff2a6d] text-[#ff2a6d]' : ''}`} />
                    <span className="hidden sm:inline text-xs font-mono-code font-bold uppercase tracking-wider">
                      {isWishlisted ? 'Saved' : 'Wishlist'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Micro Perks Notice */}
              <div className="text-[11px] font-mono-code text-slate-400 flex items-center gap-1.5 pt-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Earn 110 STRIDE Club VIP points with this purchase.</span>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div id="reviews-anchor" className="mt-12 pt-8 border-t border-white/10">
            {/* Tab navigation */}
            <div className="flex items-center gap-6 border-b border-white/10 mb-8">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                  activeTab === 'reviews'
                    ? 'text-cyan-400 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Customer Reviews ({shoe.reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                  activeTab === 'details'
                    ? 'text-cyan-400 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Heritage & Design Story
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                  activeTab === 'specs'
                    ? 'text-cyan-400 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Materials & Specifications
              </button>
            </div>

            {/* TAB CONTENT 1: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Reviews Breakdown Header */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-slate-900/60 p-6 rounded-2xl border border-white/10">
                  {/* Score */}
                  <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                    <div className="font-heading text-5xl font-black text-white">
                      {shoe.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            shoe.rating >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-mono-code text-slate-400 font-medium">
                      Based on {shoe.reviewCount} verified buyer reviews
                    </p>
                    <button
                      id="write-review-btn-primary"
                      onClick={() => onOpenWriteReview(shoe)}
                      className="mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      Write A Review
                    </button>
                  </div>

                  {/* Star Distribution Breakdown */}
                  <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingCounts[star] || 0;
                      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <button
                          key={star}
                          onClick={() =>
                            setSelectedRatingFilter(
                              selectedRatingFilter === star ? null : star
                            )
                          }
                          className={`flex items-center gap-3 text-xs w-full group cursor-pointer ${
                            selectedRatingFilter === star ? 'font-bold' : ''
                          }`}
                        >
                          <span className="w-12 text-left text-slate-300 group-hover:text-white flex items-center gap-1 font-mono-code">
                            {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                          </span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] group-hover:from-blue-500 group-hover:to-cyan-300 transition-all"
                            />
                          </div>
                          <span className="w-10 text-right font-mono-code text-slate-400 group-hover:text-slate-200">
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {selectedRatingFilter && (
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Showing only {selectedRatingFilter}-star reviews</span>
                        <button
                          onClick={() => setSelectedRatingFilter(null)}
                          className="font-bold underline text-cyan-400 cursor-pointer"
                        >
                          Show all ratings
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified Reviews List */}
                <div className="space-y-4">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-5 bg-slate-900/70 border border-white/10 shadow-lg rounded-2xl space-y-3 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      review.rating >= s
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-display font-bold text-white">
                                {review.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400">
                              <span className="font-semibold text-slate-200">{review.author}</span>
                              {review.verifiedBuyer && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-bold bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
                                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                                  Verified Buyer
                                </span>
                              )}
                              <span>•</span>
                              <span>{review.date}</span>
                            </div>
                          </div>

                          {/* Fit tag badge */}
                          <div className="text-[10px] font-mono-code font-semibold text-slate-300 bg-slate-800/80 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Fit: {review.fit.replace('_', ' ')}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          {review.comment}
                        </p>

                        {/* Helpful vote feedback */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono-code text-slate-400">
                          <span>
                            Comfort score:{' '}
                            <strong className="text-white">{review.comfortRating}/5</strong>
                          </span>
                          <button
                            onClick={() => onToggleReviewHelpful(shoe.id, review.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              review.userVotedHelpful
                                ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful ({review.helpfulCount})
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs font-mono-code">
                      No reviews found matching this filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DETAILS */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {shoe.description}
                </p>

                <div>
                  <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-3">
                    Architectural Specifications & Highlights
                  </h4>
                  <ul className="space-y-2.5">
                    {shoe.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)] mt-1.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SPECS */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900/70 rounded-2xl border border-white/10 hover:border-cyan-400/30 transition-colors shadow-sm">
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-cyan-400">
                    Upper Construction
                  </span>
                  <p className="text-sm font-display font-bold text-white mt-1.5">{shoe.specs.upper}</p>
                </div>
                <div className="p-5 bg-slate-900/70 rounded-2xl border border-white/10 hover:border-cyan-400/30 transition-colors shadow-sm">
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-cyan-400">
                    Outsole & Tread Matrix
                  </span>
                  <p className="text-sm font-display font-bold text-white mt-1.5">{shoe.specs.outsole}</p>
                </div>
                <div className="p-5 bg-slate-900/70 rounded-2xl border border-white/10 hover:border-cyan-400/30 transition-colors shadow-sm">
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-cyan-400">
                    Lining & Internal Cushioning
                  </span>
                  <p className="text-sm font-display font-bold text-white mt-1.5">{shoe.specs.lining}</p>
                </div>
                <div className="p-5 bg-slate-900/70 rounded-2xl border border-white/10 hover:border-cyan-400/30 transition-colors shadow-sm">
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-cyan-400">
                    Closure System & Hardware
                  </span>
                  <p className="text-sm font-display font-bold text-white mt-1.5">{shoe.specs.closure}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
