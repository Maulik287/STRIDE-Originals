import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, Award, Check, Send, Sparkles, ChevronRight } from 'lucide-react';
import { VipCareModal, VipCareType } from './VipCareModal';

interface FooterProps {
  onSelectShoeById?: (shoeId: string) => void;
  onOpenSizeGuide?: () => void;
  onOpenOrderHistory?: () => void;
  orderCount?: number;
}

const TERRACE_ITEMS = [
  { id: 'samba-classic-og', name: 'Samba OG Leather' },
  { id: 'gazelle-indoor-terrace', name: 'Gazelle Indoor' },
  { id: 'superstar-shelltoe-prime', name: 'Superstar Shell-Toe' },
  { id: 'campus-00s-chunky', name: 'Campus 00s Skate' },
  { id: 'stan-smith-lux-minimal', name: 'Stan Smith Lux' },
  { id: 'handball-spezial-vintage', name: 'Handball Spezial' },
];

const BOOST_ITEMS = [
  { id: 'ultraboost-light-v1', name: 'Ultraboost Light 1.0' },
  { id: 'nmd-v3-tactical-runner', name: 'NMD_R1 V3 Tactical' },
  { id: 'forum-low-classic-bball', name: 'Forum Low Classic' },
  { id: 'adilette-22-futuristic-slides', name: 'Adilette 22 Slides' },
  { id: 'retropy-e5-cloudfoam', name: 'Retropy E5 Boost' },
];

export const Footer: React.FC<FooterProps> = ({
  onSelectShoeById,
  onOpenSizeGuide,
  onOpenOrderHistory,
  orderCount = 0,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeCareModal, setActiveCareModal] = useState<VipCareType | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-slate-950/92 backdrop-blur-2xl text-slate-300 border-t border-slate-800/80 mt-20 shadow-2xl">
      {/* Top Value Promise Grid */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => setActiveCareModal('track')}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-900/60 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
              <Truck className="w-5 h-5 text-[#00f59b] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-white group-hover:text-emerald-300 transition-colors">
                Free Express Courier
              </h4>
              <p className="text-xs font-normal text-slate-400">On all archive orders over $100</p>
            </div>
          </div>

          <div 
            onClick={() => setActiveCareModal('exchange')}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-900/60 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 transition-colors">
              <RotateCcw className="w-5 h-5 text-[#06b6d4] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                30-Day Hassle-Free Returns
              </h4>
              <p className="text-xs font-normal text-slate-400">Complimentary exchange labels</p>
            </div>
          </div>

          <div 
            onClick={() => setActiveCareModal('authenticity')}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-900/60 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-pink-500/50 transition-colors">
              <ShieldCheck className="w-5 h-5 text-[#ff2a6d] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-white group-hover:text-pink-300 transition-colors">
                100% Authentic Guarantee
              </h4>
              <p className="text-xs font-normal text-slate-400">Inspected & NFC Tagged</p>
            </div>
          </div>

          <div 
            onClick={() => setActiveCareModal('concierge')}
            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-900/60 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
              <Award className="w-5 h-5 text-[#f59e0b] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-white group-hover:text-amber-300 transition-colors">
                VIP Concierge Access
              </h4>
              <p className="text-xs font-normal text-slate-400">24/7 dedicated support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-extrabold tracking-tight text-white uppercase">
                STRIDE
              </span>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                ORIGINALS ARCHIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
              Curated terrace classics, cutting-edge boost performance footwear, and verified deadstock collector editions. Built with cinema-grade 3D physics architecture.
            </p>

            {/* Newsletter Subscription */}
            <form onSubmit={handleSubscribe} className="space-y-2 pt-2 max-w-sm">
              <span className="text-xs font-mono-code font-semibold uppercase tracking-wider text-slate-300 block">
                Join The Archive Club
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-xs font-mono-code bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0066ff]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-xs font-mono-code text-[#00f59b] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  You're subscribed! Use code <strong className="text-white">ORIGINALS15</strong> for 15% off.
                </p>
              )}
            </form>
          </div>

          {/* Column 1: Iconic Silhouettes */}
          <div className="space-y-3">
            <h5 className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#00f59b] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f59b]" />
              Terrace & Classics
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {TERRACE_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSelectShoeById?.(item.id)}
                    className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1 text-left group"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Performance */}
          <div className="space-y-3">
            <h5 className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#06b6d4] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
              Boost & Street
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {BOOST_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSelectShoeById?.(item.id)}
                    className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1 text-left group"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-3">
            <h5 className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#ff2a6d] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a6d]" />
              VIP Care
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActiveCareModal('track')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1 text-left group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ff2a6d] transition-colors" />
                  <span>Track Archive Order</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenSizeGuide?.()}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1 text-left group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ff2a6d] transition-colors" />
                  <span>Shoe Sizing Guide</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveCareModal('exchange')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1 text-left group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ff2a6d] transition-colors" />
                  <span>Exchange Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveCareModal('authenticity')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1 text-left group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ff2a6d] transition-colors" />
                  <span>Authenticity Certification</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveCareModal('concierge')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1 text-left group"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ff2a6d] transition-colors" />
                  <span>24/7 VIP Concierge</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-slate-500">
          <p>© {new Date().getFullYear()} STRIDE Originals Footwear. Built with Bright Cyber Web Architecture.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveCareModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveCareModal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Sale
            </button>
            <button
              onClick={() => setActiveCareModal('security')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Security Statement
            </button>
          </div>
        </div>
      </div>

      {/* VIP Care Interactive Modal */}
      <VipCareModal
        type={activeCareModal}
        isOpen={!!activeCareModal}
        onClose={() => setActiveCareModal(null)}
        onOpenOrderHistory={onOpenOrderHistory}
        orderCount={orderCount}
      />
    </footer>
  );
};
