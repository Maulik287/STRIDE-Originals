import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Sparkles, 
  Play, 
  Pause, 
  ShoppingBag, 
  Heart, 
  ArrowUp, 
  Mic, 
  Sliders,
  Volume2
} from 'lucide-react';
import { BackgroundMode } from './HeroBanner';

interface FloatingDockProps {
  bgMode: BackgroundMode;
  onChangeBgMode: (mode: BackgroundMode) => void;
  isVividMode: boolean;
  onToggleVivid: () => void;
  isVideoPlaying: boolean;
  onToggleVideoPlay: () => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenVoiceTour?: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  bgMode,
  onChangeBgMode,
  isVividMode,
  onToggleVivid,
  isVideoPlaying,
  onToggleVideoPlay,
  cartCount,
  cartTotal,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onOpenVoiceTour,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCinemaExpanded, setIsCinemaExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-fit z-40 px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-full glass-dock shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02]">
        
        {/* Audio Tour Capsule Trigger */}
        {onOpenVoiceTour && (
          <button
            onClick={onOpenVoiceTour}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer shadow-md group"
            title="Start $0 AI Voice Guide"
          >
            <div className="relative w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <Mic className="w-3 h-3 relative z-10" />
              <span className="absolute -inset-0.5 rounded-full bg-cyan-400/40 animate-ping" />
            </div>
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-cyan-300 hidden sm:inline">
              Voice Guide
            </span>
          </button>
        )}

        {/* Cinema Video Experience Controller */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setIsCinemaExpanded(!isCinemaExpanded)}
            className="flex items-center gap-1.5 text-[11px] font-mono-code font-bold text-slate-300 hover:text-white cursor-pointer"
            title="Toggle Cinema Video Controls"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline uppercase tracking-wider">Cinema:</span>
            <span className="text-cyan-400 uppercase font-bold">{bgMode}</span>
          </button>

          {/* Quick Mode Buttons */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={() => onChangeBgMode('full')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold uppercase transition-all cursor-pointer ${
                bgMode === 'full'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Viewport Video"
            >
              Full
            </button>
            <button
              onClick={() => onChangeBgMode('adaptive')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold uppercase transition-all cursor-pointer ${
                bgMode === 'adaptive'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Adaptive Blur Video"
            >
              Adapt
            </button>
          </div>

          {/* Vivid Saturation Toggle */}
          <button
            onClick={onToggleVivid}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold uppercase border transition-all cursor-pointer ml-1 ${
              isVividMode
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-transparent text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Vivid Color Boost"
          >
            {isVividMode ? '⚡ Vivid' : 'Norm'}
          </button>

          {/* Play/Pause Video */}
          <button
            onClick={onToggleVideoPlay}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isVideoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>

        {/* Wishlist Floating Counter */}
        <button
          onClick={onOpenWishlist}
          className="relative p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer shadow-md group active:scale-95"
          title="Open Wishlist"
          aria-label="Open Wishlist"
        >
          <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff2a6d] text-white text-[9px] font-mono-code font-bold flex items-center justify-center shadow-md">
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Floating Luxury Cart Button */}
        <button
          onClick={onOpenCart}
          className="shimmer-btn flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 hover:opacity-95 text-slate-950 font-mono-code font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-transform"
          title="Open Shopping Cart"
          aria-label="Open Shopping Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-slate-950" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-slate-950 text-emerald-400 text-[8px] font-mono-code px-1 rounded-full border border-emerald-400">
                {cartCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline">Bag</span>
          <span className="bg-slate-950/20 px-1.5 py-0.5 rounded-md text-[11px]">
            ${cartTotal.toFixed(0)}
          </span>
        </button>

        {/* Floating Scroll to Top Pill */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-white/10 hover:border-cyan-400 transition-all cursor-pointer shadow-md animate-in fade-in zoom-in-75 active:scale-90"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

      </div>
    </div>
  );
};
