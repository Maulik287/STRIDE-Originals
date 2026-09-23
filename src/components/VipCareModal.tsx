import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Phone, 
  Mail, 
  MessageSquare, 
  Send,
  Lock,
  ArrowRight,
  Package
} from 'lucide-react';

export type VipCareType = 
  | 'track' 
  | 'exchange' 
  | 'authenticity' 
  | 'concierge' 
  | 'privacy' 
  | 'terms' 
  | 'security';

interface VipCareModalProps {
  type: VipCareType | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderHistory?: () => void;
  orderCount?: number;
}

export const VipCareModal: React.FC<VipCareModalProps> = ({
  type,
  isOpen,
  onClose,
  onOpenOrderHistory,
  orderCount = 0,
}) => {
  if (!isOpen || !type) return null;

  const [orderQuery, setOrderQuery] = useState('STRIDE-849204-EXP');
  const [exchangeOrderNumber, setExchangeOrderNumber] = useState('');
  const [exchangeSubmitted, setExchangeSubmitted] = useState(false);
  const [conciergeMsg, setConciergeMsg] = useState('');
  const [conciergeSent, setConciergeSent] = useState(false);

  const handleExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchangeOrderNumber) return;
    setExchangeSubmitted(true);
  };

  const handleConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeMsg) return;
    setConciergeSent(true);
    setConciergeMsg('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200"
      data-lenis-prevent="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative bg-slate-950 text-white w-full max-w-lg rounded-3xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        data-lenis-prevent="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            {type === 'track' && <Truck className="w-5 h-5 text-cyan-400" />}
            {type === 'exchange' && <RotateCcw className="w-5 h-5 text-cyan-400" />}
            {type === 'authenticity' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            {type === 'concierge' && <Sparkles className="w-5 h-5 text-pink-400" />}
            {(type === 'privacy' || type === 'terms' || type === 'security') && <Lock className="w-5 h-5 text-blue-400" />}
            
            <h3 className="font-heading text-lg font-bold text-white tracking-wide">
              {type === 'track' && 'Track Archive Order'}
              {type === 'exchange' && 'Exchange & Return Portal'}
              {type === 'authenticity' && 'Authenticity Certification'}
              {type === 'concierge' && '24/7 VIP Concierge'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms of Sale'}
              {type === 'security' && 'Security Statement'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm font-normal text-slate-300">
          {/* 1. Track Archive Order */}
          {type === 'track' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your order confirmation number below to inspect global express shipment telemetry and carrier dispatch.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="e.g. STRIDE-849204-EXP"
                  className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono-code text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Sample Live Courier Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono-code font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    IN TRANSIT • AIR EXPRESS
                  </span>
                  <span className="text-[11px] font-mono-code text-slate-400">DHL Express</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Tracking: {orderQuery || 'STRIDE-849204-EXP'}</span>
                    <span className="text-cyan-400 font-mono-code">Est: Tomorrow, 11:30 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Departed Frankfurt Sorting Facility. Next stop: New York Regional Distribution Hub.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  <div className="h-1 rounded-full bg-emerald-400"></div>
                  <div className="h-1 rounded-full bg-emerald-400"></div>
                  <div className="h-1 rounded-full bg-cyan-400 animate-pulse"></div>
                  <div className="h-1 rounded-full bg-slate-800"></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono-code text-slate-500 uppercase">
                  <span>Order Placed</span>
                  <span>Inspected</span>
                  <span className="text-cyan-400 font-bold">In Flight</span>
                  <span>Delivered</span>
                </div>
              </div>

              {orderCount > 0 && onOpenOrderHistory && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenOrderHistory();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-mono-code font-bold uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Package className="w-3.5 h-3.5" />
                  View All My Placed Orders ({orderCount})
                </button>
              )}
            </div>
          )}

          {/* 2. Exchange & Return Portal */}
          {type === 'exchange' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-cyan-200 leading-relaxed">
                  Complimentary 30-day exchanges on all unworn footwear in original box. Zero shipping fees, prepaid QR return code provided instantly.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                  3-Step Seamless Exchange:
                </h4>
                <ol className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono-code font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span><strong>Enter Order #</strong>: Identify the sneaker and pick your desired replacement size or colorway.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono-code font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span><strong>Paperless QR Code</strong>: Show the QR code on your phone at any Post Office or FedEx location — no printer required.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono-code font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span><strong>Instant Dispatch</strong>: Your replacement pair is held and dispatched the instant the courier scans your return.</span>
                  </li>
                </ol>
              </div>

              {!exchangeSubmitted ? (
                <form onSubmit={handleExchangeSubmit} className="space-y-2 pt-2">
                  <input
                    type="text"
                    required
                    value={exchangeOrderNumber}
                    onChange={(e) => setExchangeOrderNumber(e.target.value)}
                    placeholder="Enter Order # (e.g. STRIDE-849204)"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono-code text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-mono-code font-bold uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    Generate Return QR Code
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Exchange Registered for {exchangeOrderNumber}!
                  </p>
                  <p className="text-[11px] text-slate-300">
                    A prepaid mobile return QR code has been dispatched to your email address.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. Authenticity Certification */}
          {type === 'authenticity' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-emerald-300">
                    100% Deadstock & Verified Authentic
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Every silhouette in the STRIDE archive is directly sourced from certified tier-1 authorized distributors and verified deadstock allocations.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                  Our 8-Point Physical Inspection Protocol:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-mono-code font-bold text-[11px]">01. Stitch Density</span>
                    <p className="text-[11px] text-slate-400">Computerized micrometer inspection of seams.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-mono-code font-bold text-[11px]">02. UV Telemetry</span>
                    <p className="text-[11px] text-slate-400">Ultraviolet inspection of midsole stamps.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-mono-code font-bold text-[11px]">03. Leather Grade</span>
                    <p className="text-[11px] text-slate-400">Full-grain suppleness & aroma validation.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-mono-code font-bold text-[11px]">04. RFID Serial</span>
                    <p className="text-[11px] text-slate-400">Cross-verified factory SKU registry barcodes.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                <span>Tamper-Proof NFC Security Tag Attached</span>
                <span className="text-emerald-400 font-mono-code font-bold">200% Refund Guarantee</span>
              </div>
            </div>
          )}

          {/* 4. 24/7 VIP Concierge */}
          {type === 'concierge' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly with our senior footwear specialists for real-time sizing consultations, archive releases, and custom inquiries.
              </p>

              {/* Direct channels */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                <a 
                  href="tel:+18008497874" 
                  className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 transition-colors flex items-center gap-2.5 group cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">VIP Phone Line</span>
                    <span className="text-white font-bold text-[11px]">+1 (800) 849-STRIDE</span>
                  </div>
                </a>

                <a 
                  href="mailto:vip@stride-footwear.com" 
                  className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 transition-colors flex items-center gap-2.5 group cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Priority Email</span>
                    <span className="text-white font-bold text-[11px]">vip@stride.store</span>
                  </div>
                </a>
              </div>

              {/* Live Concierge Message Box */}
              {!conciergeSent ? (
                <form onSubmit={handleConciergeSubmit} className="space-y-2 pt-2">
                  <label className="text-xs font-mono-code font-bold text-white uppercase tracking-wider block">
                    Fast-Track Message To Concierge:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={conciergeMsg}
                    onChange={(e) => setConciergeMsg(e.target.value)}
                    placeholder="Ask about size recommendations, upcoming drops, or specific order styling..."
                    className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-mono-code font-bold uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmit To On-Duty Stylist
                  </button>
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Message delivered to VIP Concierge! An on-duty specialist will respond within 2 minutes.</span>
                </div>
              )}
            </div>
          )}

          {/* 5. Policy / Terms / Security */}
          {(type === 'privacy' || type === 'terms' || type === 'security') && (
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              {type === 'privacy' && (
                <>
                  <p><strong>Your Privacy is Respected:</strong> STRIDE uses 256-bit TLS encryption for all customer transactions. We never sell, rent, or lease your personal telemetry to third-party data brokers.</p>
                  <p>Stored payment tokens are handled strictly by PCI-DSS Level 1 certified gateways. You may request complete account data erasure at any time.</p>
                </>
              )}
              {type === 'terms' && (
                <>
                  <p><strong>Terms of Sale:</strong> All footwear purchases include complimentary verified domestic shipping and a 30-day exchange guarantee.</p>
                  <p>Orders may be canceled or amended prior to carrier dispatch. In the rare event of damaged delivery, replacements are prioritized instantly at zero customer cost.</p>
                </>
              )}
              {type === 'security' && (
                <>
                  <p><strong>Security Statement:</strong> Our web infrastructure is audited continuously with end-to-end HTTPS encryption, automated tokenization, and anti-fraud velocity controls.</p>
                  <p>Zero unencrypted credit card data touches our web servers at any stage of the checkout process.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono-code font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
