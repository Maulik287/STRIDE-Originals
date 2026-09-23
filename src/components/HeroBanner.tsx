import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Mic, Star, Play, Pause, Sliders, SunMedium } from 'lucide-react';

export type BackgroundMode = 'adaptive' | 'full' | 'hero-only';

interface HeroBannerProps {
  onQuickFilter: (categoryOrQuery: string) => void;
  onOpenVoiceTour?: () => void;
  onInspectShoe?: (shoeId: string) => void;
  bgMode?: BackgroundMode;
  onChangeBgMode?: (mode: BackgroundMode) => void;
  isVideoPlaying?: boolean;
  onToggleVideoPlayback?: () => void;
  isVividMode?: boolean;
  onToggleVividMode?: () => void;
  videoOpacity?: 'cinema' | 'max';
  onToggleVideoOpacity?: () => void;
}

const HERO_FEATURED_COLORWAYS = [
  { 
    shoeId: 'samba-classic-og',
    modelName: 'Samba OG',
    name: 'Cloud White / Core Black / Gum', 
    price: '$110',
    tag: 'ORIGINAL 1970s',
    image: '/shoes/samba-og-white.jpg',
    specs: 'Full-Grain Leather • Gum Cupsole',
    rating: '4.8 (342)',
    colorHex: '#EBEBEB',
    accentHex: '#18181B'
  },
  { 
    shoeId: 'gazelle-indoor-terrace',
    modelName: 'Gazelle Indoor',
    name: 'Royal Blue / Cloud White', 
    price: '$120',
    tag: 'TERRACE ICON',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&auto=format&fit=crop&q=85',
    specs: 'Buttery Suede • Translucent Gum',
    rating: '4.9 (286)',
    colorHex: '#1D4ED8',
    accentHex: '#FFFFFF'
  },
  { 
    shoeId: 'campus-00s-terrace-green',
    modelName: 'Campus 00s',
    name: 'Collegiate Green / Gum', 
    price: '$110',
    tag: 'TERRACE HERITAGE',
    image: 'https://images.unsplash.com/photo-1692977121299-08ecbacd25a3?w=1200&auto=format&fit=crop&q=85',
    specs: 'Plush Suede • Padded Collar',
    rating: '4.9 (184)',
    colorHex: '#1E4D2B',
    accentHex: '#E6D7BD'
  },
  { 
    shoeId: 'ultraboost-light-v1',
    modelName: 'Ultraboost Light',
    name: 'Core Black / Solar Red / Carbon', 
    price: '$190',
    tag: 'BOOST PERFORMANCE',
    image: '/shoes/ultraboost-black.jpg',
    specs: 'Light BOOST • Continental Rubber',
    rating: '4.9 (489)',
    colorHex: '#18181B',
    accentHex: '#DC2626'
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  onQuickFilter,
  onOpenVoiceTour,
  onInspectShoe,
  bgMode = 'adaptive',
  onChangeBgMode,
  isVideoPlaying = true,
  onToggleVideoPlayback,
  isVividMode = true,
  onToggleVividMode,
  videoOpacity = 'cinema',
  onToggleVideoOpacity,
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [internalIsPlaying, setInternalIsPlaying] = useState(true);
  const [internalIsVivid, setInternalIsVivid] = useState(true);
  const [internalOpacity, setInternalOpacity] = useState<'cinema' | 'max'>('cinema');
  const [showcaseMousePos, setShowcaseMousePos] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeColorway = HERO_FEATURED_COLORWAYS[selectedColorIndex];

  const handleShowcaseMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setShowcaseMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const effectiveIsPlaying = onToggleVideoPlayback ? isVideoPlaying : internalIsPlaying;
  const effectiveIsVivid = onToggleVividMode ? isVividMode : internalIsVivid;
  const effectiveOpacity = onToggleVideoOpacity ? videoOpacity : internalOpacity;

  const handleTogglePlay = () => {
    if (onToggleVideoPlayback) {
      onToggleVideoPlayback();
    } else {
      if (videoRef.current) {
        if (internalIsPlaying) videoRef.current.pause();
        else videoRef.current.play();
      }
      setInternalIsPlaying(!internalIsPlaying);
    }
  };

  const handleToggleVivid = () => {
    if (onToggleVividMode) onToggleVividMode();
    else setInternalIsVivid(!internalIsVivid);
  };

  const handleToggleOpacity = () => {
    if (onToggleVideoOpacity) onToggleVideoOpacity();
    else setInternalOpacity(internalOpacity === 'cinema' ? 'max' : 'cinema');
  };

  // Local video autoplay on mount (only for hero-only mode)
  useEffect(() => {
    if (bgMode === 'hero-only' && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Hero autoplay requires gesture:', err);
      });
    }
  }, [bgMode]);

  // Smooth scroll parallax tracking for cinema-grade depth
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`relative overflow-hidden text-slate-900 mx-4 sm:mx-6 lg:mx-8 my-6 transition-all duration-500 ${
      bgMode === 'hero-only'
        ? 'rounded-3xl bg-slate-900 border border-slate-200/90 shadow-[0_25px_60px_rgba(15,23,42,0.12)]'
        : 'bg-transparent border-0'
    }`}>
      {/* If hero-only mode, render local video */}
      {bgMode === 'hero-only' && (
        <>
          <video
            ref={videoRef}
            src="/videos/hero_bg.mp4"
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
              effectiveOpacity === 'max' ? 'opacity-100' : 'opacity-85'
            }`}
            style={{
              filter: effectiveIsVivid 
                ? 'saturate(1.5) contrast(1.18) brightness(1.06)' 
                : 'saturate(1.05) contrast(1.05) brightness(1.0)',
              transform: `scale(${1 + Math.min(0.15, scrollY * 0.0003)}) translateY(${Math.min(60, scrollY * 0.15)}px)`,
            }}
          >
            <source src="/videos/hero_bg.mp4" type="video/mp4" />
          </video>
          {/* Atmospheric Vignette & Subtle Cyber Mesh Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-transparent to-slate-950/15 pointer-events-none" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Typography & Conversion Actions Floating Directly Over Cinematic Video */}
        <div 
          className="max-w-2xl text-center lg:text-left flex-1 transition-transform duration-150 ease-out z-10"
          style={{ transform: `translateY(${Math.min(80, scrollY * -0.06)}px)` }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/60 text-emerald-400 border border-emerald-500/30 text-xs font-mono-code font-bold tracking-widest uppercase mb-5 shadow-lg backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-[#ff2a6d]" />
            NEO-TOKYO ARCHIVE 2026 • EDITORIAL
          </div>

          {/* Main Hero Headline - Perfectly tuned sizing with zero text clipping or overflow */}
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.04] mb-5 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            CULTURE NEVER <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-[#ff2a6d] drop-shadow-[0_2px_18px_rgba(6,182,212,0.45)]">
              STANDS STILL.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed mb-8 max-w-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            From 1970s European terrace culture to high-fashion runways. Experience footwear craftsmanship with authenticated full-grain leather, vulcanized gum soles, and verified sizing fit data.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
            <button
              id="hero-shop-classics"
              onClick={() => onQuickFilter('Classics')}
              className="shimmer-btn px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono-code font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_45px_rgba(6,182,212,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              Explore Terrace Classics
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenVoiceTour && (
              <button
                id="hero-audio-tour-btn"
                onClick={onOpenVoiceTour}
                className="shimmer-btn px-6 py-4 bg-slate-950/60 hover:bg-slate-900/80 text-white hover:text-cyan-400 font-mono-code font-bold text-xs uppercase tracking-wider rounded-full border border-white/25 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer shadow-lg backdrop-blur-md"
              >
                <Mic className="w-4 h-4 text-cyan-400" />
                Start Voice Guide ($0 AI)
              </button>
            )}
          </div>

          {/* Micro trust indicators */}
          <div className="pt-6 border-t border-white/20 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-mono-code text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Authenticity Guaranteed
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Over 2,400+ Verified 5★ Reviews
            </span>
          </div>
        </div>

        {/* Right Column: Sheer Translucent Glass Studio Showcase with Parallax */}
        <div 
          className="w-full lg:w-[500px] xl:w-[520px] flex-shrink-0 flex flex-col gap-3 transition-transform duration-150 ease-out z-10"
          style={{ transform: `translateY(${Math.min(100, scrollY * 0.05)}px)` }}
        >
          <div 
            onClick={() => onInspectShoe?.(activeColorway.shoeId)}
            onMouseMove={handleShowcaseMouseMove}
            className="group relative w-full h-[380px] sm:h-[430px] rounded-3xl overflow-hidden border border-white/25 bg-slate-950/35 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:border-cyan-400/70 transition-all duration-500 hover:-translate-y-2 animate-float"
          >
            {/* 21st.dev Dynamic Cursor Spotlight Layer */}
            <div 
              className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
              style={{
                background: `radial-gradient(500px circle at ${showcaseMousePos.x}px ${showcaseMousePos.y}px, rgba(6, 182, 212, 0.22), transparent 70%)`,
              }}
            />

            {/* High-Resolution Sneaker Image with Smooth Floating Zoom */}
            <img 
              key={activeColorway.image}
              src={activeColorway.image}
              alt={`${activeColorway.modelName} - ${activeColorway.name}`}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
            />

            {/* Top Floating Badge Strip */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2">
                <span className="bg-slate-950/80 text-emerald-400 text-xs font-mono-code font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border border-emerald-500/30 backdrop-blur-md">
                  {activeColorway.tag}
                </span>
                <span className="bg-slate-950/70 backdrop-blur-md text-white text-xs font-mono-code font-bold px-2.5 py-1 rounded-full border border-white/15 shadow-sm">
                  {activeColorway.modelName}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-sm text-xs font-mono-code font-bold text-white">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{activeColorway.rating}</span>
              </div>
            </div>

            {/* Bottom Floating Showcase Card */}
            <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/15 shadow-2xl flex items-center justify-between z-20">
              <div>
                <span className="text-[10px] font-mono-code uppercase font-bold tracking-wider text-cyan-400">
                  {activeColorway.modelName} • Featured Silhouette
                </span>
                <h3 className="font-heading text-base font-bold text-white leading-tight">
                  {activeColorway.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs font-mono-code text-slate-300">
                  <span>{activeColorway.specs}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-heading text-xl font-black text-white block">
                  {activeColorway.price}
                </span>
                <span className="text-[10px] font-mono-code text-cyan-400 font-bold uppercase tracking-wider group-hover:text-cyan-300 flex items-center gap-1 justify-end">
                  Explore Edition ↗
                </span>
              </div>
            </div>
          </div>

          {/* Colorway Palette Selector */}
          <div className="flex items-center justify-between px-5 py-2.5 rounded-full bg-slate-950/60 border border-white/20 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code uppercase tracking-wider text-slate-300 font-semibold">
                Colorway:
              </span>
              <span className="text-xs font-display font-bold text-white truncate max-w-[220px]">
                {activeColorway.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {HERO_FEATURED_COLORWAYS.map((c, idx) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColorIndex === idx
                      ? 'border-cyan-400 scale-125 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'border-white/30 hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.accentHex }}
                  title={c.name}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: c.colorHex }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Video Master Controls Toolbar */}
      <div className="absolute bottom-3 right-4 z-10 flex flex-wrap items-center justify-end gap-2">
        {/* Background Mode Switcher (A / B / C) */}
        {onChangeBgMode && (
          <div className="hidden sm:flex items-center bg-white/90 backdrop-blur-md rounded-full p-0.5 border border-slate-200/90 shadow-xs text-[9px] font-mono-code font-bold uppercase">
            <button
              onClick={() => onChangeBgMode('adaptive')}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                bgMode === 'adaptive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Option A: Scroll-Adaptive Frosted Glass (Recommended)"
            >
              Option A: Adaptive
            </button>
            <button
              onClick={() => onChangeBgMode('full')}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                bgMode === 'full'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Option B: Full Viewport Video Everywhere"
            >
              Option B: Full
            </button>
            <button
              onClick={() => onChangeBgMode('hero-only')}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                bgMode === 'hero-only'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Option C: Hero Banner Only"
            >
              Option C: Hero Only
            </button>
          </div>
        )}

        {/* Color Grading Mode Toggle */}
        <button
          onClick={handleToggleVivid}
          className={`px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-md text-[10px] font-mono-code font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
            effectiveIsVivid 
              ? 'bg-amber-400/90 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]' 
              : 'bg-white/85 text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
          title="Toggle Enhanced Cyber Vivid Colors"
        >
          <SunMedium className="w-2.5 h-2.5" />
          <span>{effectiveIsVivid ? 'Vivid ⚡' : 'Natural'}</span>
        </button>

        {/* Video Opacity Mode Toggle */}
        <button
          onClick={handleToggleOpacity}
          className="px-2.5 py-1 rounded-full bg-white/85 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-xs backdrop-blur-md text-[10px] font-mono-code font-bold tracking-wider uppercase flex items-center gap-1 transition-all duration-200 cursor-pointer active:scale-95"
          title="Toggle Video Transparency / Full Visibility"
        >
          <Sliders className="w-2.5 h-2.5 text-slate-500" />
          <span>{effectiveOpacity === 'max' ? '100%' : '85%'}</span>
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={handleTogglePlay}
          className="px-2.5 py-1 rounded-full bg-white/85 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-xs backdrop-blur-md text-[10px] font-mono-code font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
          title={effectiveIsPlaying ? 'Pause video motion' : 'Play video motion'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${effectiveIsPlaying ? 'bg-[#00f59b] shadow-[0_0_6px_#00f59b]' : 'bg-slate-400'}`} />
          {effectiveIsPlaying ? (
            <>
              <Pause className="w-2.5 h-2.5 text-slate-500" />
              <span>Motion</span>
            </>
          ) : (
            <>
              <Play className="w-2.5 h-2.5 text-slate-500" />
              <span>Paused</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
