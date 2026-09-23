import React, { useEffect, useState, useRef } from 'react';
import { Flame, ShieldCheck, Sparkles, Award, Zap } from 'lucide-react';

const MARQUEE_ITEMS = [
  { icon: Flame, text: 'ARCHIVE 2026 DROPS', color: 'text-[#ff2a6d]' },
  { icon: ShieldCheck, text: '100% AUTHENTIC GUARANTEE', color: 'text-emerald-400' },
  { icon: Sparkles, text: 'VULCANIZED GUM CUPSOLES', color: 'text-amber-400' },
  { icon: Zap, text: 'FREE EXPRESS GLOBAL COURIER', color: 'text-cyan-400' },
  { icon: Award, text: 'TERRACE HERITAGE CRAFTSMANSHIP', color: 'text-blue-400' },
  { icon: ShieldCheck, text: 'OVER 2,400+ VERIFIED 5★ REVIEWS', color: 'text-emerald-400' },
  { icon: Flame, text: 'LIMITED RUNWAY COLORWAYS', color: 'text-[#ff2a6d]' },
  { icon: Sparkles, text: 'VERIFIED TRUE-TO-SIZE SIZING', color: 'text-cyan-400' },
];

export const MarqueeTicker: React.FC = () => {
  const [speedSeconds, setSpeedSeconds] = useState(28);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const currentY = window.scrollY;
      const deltaY = Math.abs(currentY - lastScrollY.current);
      const deltaTime = Math.max(1, now - lastScrollTime.current);
      const velocity = deltaY / deltaTime; // pixels per ms

      if (velocity > 0.15) {
        // Accelerate marquee dynamically based on scroll velocity
        const boostedSpeed = Math.max(6, 28 - velocity * 14);
        setSpeedSeconds(boostedSpeed);
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          setSpeedSeconds(28); // Smoothly return to relaxed cruise speed
        }, 500);
      }

      lastScrollY.current = currentY;
      lastScrollTime.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden py-3 bg-slate-950/80 backdrop-blur-2xl border-y border-white/10 shadow-lg relative z-20 my-4">
      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-950 via-slate-950/60 to-transparent z-10" />

      <div 
        className="animate-marquee flex items-center gap-10 whitespace-nowrap transition-all duration-300"
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-sm text-[11px] font-mono-code font-bold tracking-wider uppercase text-slate-200"
            >
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
