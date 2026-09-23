import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Shoe } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistShoes: Shoe[];
  onRemoveFromWishlist: (shoeId: string) => void;
  onSelectShoe: (shoe: Shoe) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistShoes,
  onRemoveFromWishlist,
  onSelectShoe,
}) => {
  if (!isOpen) return null;

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
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ff2a6d]">
                <Heart className="w-4 h-4 fill-[#ff2a6d]" />
              </div>
              <div>
                <h2 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                  Saved Wishlist
                </h2>
                <span className="text-[11px] font-mono-code text-slate-400">
                  {wishlistShoes.length} {wishlistShoes.length === 1 ? 'silhouette' : 'silhouettes'} saved
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div 
            data-lenis-prevent="true"
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-3.5"
          >
            {wishlistShoes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16 px-4">
                <div className="w-20 h-20 bg-slate-900/90 border border-pink-500/30 rounded-3xl flex items-center justify-center text-[#ff2a6d] shadow-[0_0_30px_rgba(255,42,109,0.2)]">
                  <Heart className="w-9 h-9 stroke-[1.8]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs font-normal text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Tap the heart icon on any pair to save your favorite footwear to your personal collection.
                  </p>
                </div>
              </div>
            ) : (
              wishlistShoes.map((shoe) => (
                <div
                  key={shoe.id}
                  className="flex gap-3.5 p-3 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all duration-200 shadow-sm group"
                >
                  <div
                    onClick={() => {
                      onSelectShoe(shoe);
                      onClose();
                    }}
                    className="w-20 h-20 rounded-xl bg-slate-950 shrink-0 border border-white/10 overflow-hidden flex items-center justify-center p-1 cursor-pointer"
                  >
                    <img
                      src={shoe.colors[0]?.image || shoe.images[0]}
                      alt={shoe.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4
                          onClick={() => {
                            onSelectShoe(shoe);
                            onClose();
                          }}
                          className="font-heading text-sm font-bold text-white truncate hover:text-cyan-400 cursor-pointer transition-colors"
                        >
                          {shoe.name}
                        </h4>
                        <button
                          onClick={() => onRemoveFromWishlist(shoe.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] font-mono-code text-slate-400 truncate">{shoe.subtitle}</p>
                      <span className="font-heading text-sm font-black text-cyan-300 mt-1 block">
                        ${shoe.price}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectShoe(shoe);
                        onClose();
                      }}
                      className="mt-2 w-full py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-heading font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-98 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                      Select Size & Buy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
