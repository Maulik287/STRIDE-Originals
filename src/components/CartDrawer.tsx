import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Truck, 
  Lock,
  Sparkles
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: () => void;
  promoCode: string;
  onApplyPromoCode: (code: string) => { success: boolean; message: string };
  discountAmount: number;
}

const FREE_SHIPPING_THRESHOLD = 100;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  promoCode,
  onApplyPromoCode,
  discountAmount,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.shoe.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = onApplyPromoCode(promoInput.trim());
    setPromoMessage({ text: result.message, isError: !result.success });
    if (result.success) {
      setPromoInput('');
    }
  };

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : 9.99;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md animate-in fade-in-30"
      data-lenis-prevent="true"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10" data-lenis-prevent="true">
        <div className="w-screen max-w-md bg-slate-950/95 backdrop-blur-2xl text-white border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShoppingBag className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div>
                <h2 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                  Shopping Bag
                </h2>
                <span className="text-[11px] font-mono-code text-slate-400">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your vault
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="px-6 py-3.5 bg-slate-900/80 border-b border-white/10">
            <div className="flex items-center justify-between text-xs font-mono-code mb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-cyan-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    FREE Express Courier Unlocked!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-cyan-300 font-bold">${remainingForFreeShipping.toFixed(2)}</strong> for FREE Courier
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono-code font-bold text-cyan-400">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div
                style={{ width: `${freeShippingProgress}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              />
            </div>
          </div>

          {/* Items List */}
          <div 
            data-lenis-prevent="true"
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-3.5"
          >
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16 px-4">
                <div className="w-20 h-20 bg-slate-900/90 border border-cyan-500/30 rounded-3xl flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <ShoppingBag className="w-9 h-9 stroke-[1.8]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                    Your Bag is Empty
                  </h3>
                  <p className="text-xs font-normal text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Explore our Originals archive, terrace classics, and high-performance silhouettes.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-heading font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all"
                >
                  Explore Footwear
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all duration-200 shadow-sm group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-slate-950 shrink-0 border border-white/10 overflow-hidden flex items-center justify-center p-1">
                    <img
                      src={item.selectedColor.image}
                      alt={item.shoe.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-heading text-sm font-bold text-white truncate">
                          {item.shoe.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] font-mono-code text-slate-400 truncate">
                        {item.selectedColor.name}
                      </p>
                      <div className="inline-block mt-1 text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 bg-cyan-950/60 text-cyan-300 rounded-md border border-cyan-500/30">
                        Size: {item.shoe.category === 'Equipment' || item.shoe.category === 'Bags' ? 'One Size' : `US ${item.selectedSize}`}
                      </div>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-white/15 rounded-lg bg-slate-950/90 overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 font-bold transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-mono-code font-bold text-cyan-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 font-bold transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-heading text-sm font-black text-cyan-300">
                        ${(item.shoe.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl space-y-3.5">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-cyan-400" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Promo code (try 'ORIGINALS15')"
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono-code uppercase bg-slate-950/80 rounded-xl border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono-code font-bold uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] font-mono-code font-semibold ${
                      promoMessage.isError ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </form>

              {/* Cost Summary Breakdown */}
              <div className="space-y-2 text-xs font-mono-code text-slate-400 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-cyan-400 font-semibold">
                    <span>Discount ({promoCode})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-200">
                    {shippingFee === 0 ? <span className="text-cyan-300 font-bold">FREE</span> : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-200">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-white pt-2.5 border-t border-white/10">
                  <span className="uppercase tracking-wider">Total</span>
                  <span className="font-heading text-cyan-300 text-lg font-black">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="drawer-proceed-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-heading text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-95"
              >
                <Lock className="w-4 h-4 stroke-[2.3]" />
                Proceed to Secure Checkout
                <ArrowRight className="w-4 h-4 ml-1 stroke-[2.3]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono-code text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>256-bit SSL Encrypted • 30-Day Money Back Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
