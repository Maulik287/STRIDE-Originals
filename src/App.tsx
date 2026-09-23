import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  RotateCcw, 
  X, 
  Search, 
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Tag,
  Film,
  SunMedium,
  Sliders,
  Play,
  Pause
} from 'lucide-react';
import { 
  Shoe, 
  FilterState, 
  CartItem, 
  ShoeColorway, 
  ShoeReview, 
  OrderRecord 
} from './types';
import { INITIAL_SHOES } from './data/shoes';
import { shoeMatchesColorFilters } from './utils/colorMatcher';
import { Header } from './components/Header';
import { HeroBanner, BackgroundMode } from './components/HeroBanner';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { CartDrawer } from './components/CartDrawer';
import { SecureCheckoutModal } from './components/SecureCheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Footer } from './components/Footer';
import { VoiceGuideEngine } from './components/VoiceGuideEngine';
import { MarqueeTicker } from './components/MarqueeTicker';
import { FloatingDock } from './components/FloatingDock';
import { CustomSortDropdown } from './components/CustomSortDropdown';
import Lenis from 'lenis';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  categories: [],
  genders: [],
  selectedSizes: [],
  selectedColors: [],
  priceRange: [0, 250],
  minRating: 0,
  onlyInStock: false,
  onlySale: false,
  sortBy: 'featured',
};

export default function App() {
  // Persistence for shoes (to keep new user reviews across reloads while pulling updated catalog colors)
  const [shoes, setShoes] = useState<Shoe[]>(() => {
    try {
      localStorage.removeItem('stride_shoes_catalog'); 
      localStorage.removeItem('stride_shoes_catalog_v2'); 
      localStorage.removeItem('stride_shoes_catalog_v3'); 
      localStorage.removeItem('stride_shoes_catalog_v4'); 
      localStorage.removeItem('stride_shoes_catalog_v5'); 
      localStorage.removeItem('stride_shoes_catalog_v6'); 
      localStorage.removeItem('stride_shoes_catalog_v7'); 
      const saved = localStorage.getItem('stride_shoes_catalog_v8');
      if (!saved) return INITIAL_SHOES;
      const parsed: Shoe[] = JSON.parse(saved);
      // Merge user-submitted reviews if any, but ensure colorways and images come from INITIAL_SHOES
      return INITIAL_SHOES.map(initShoe => {
        const found = parsed.find(p => p.id === initShoe.id);
        if (!found) return initShoe;
        return {
          ...initShoe,
          reviews: found.reviews?.length ? found.reviews : initShoe.reviews,
          reviewCount: found.reviews?.length || initShoe.reviewCount,
        };
      });
    } catch {
      return INITIAL_SHOES;
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('stride_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stride_wishlist');
      return saved ? JSON.parse(saved) : ['samba-classic-og'];
    } catch {
      return ['samba-classic-og'];
    }
  });

  // Orders state
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('stride_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscountPct, setPromoDiscountPct] = useState<number>(0);

  // Modals & Drawers
  const [selectedShoeModal, setSelectedShoeModal] = useState<Shoe | null>(null);
  const [selectedColorModal, setSelectedColorModal] = useState<ShoeColorway | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [reviewShoeTarget, setReviewShoeTarget] = useState<Shoe | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderRecord | null>(null);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background Video & Architectural Mode State (Option B: Full Viewport Everywhere by default)
  const [bgMode, setBgMode] = useState<BackgroundMode>('full');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVividMode, setIsVividMode] = useState<boolean>(true);
  const [videoOpacity, setVideoOpacity] = useState<'cinema' | 'max'>('max');
  const globalVideoRef = useRef<HTMLVideoElement>(null);

  // Live cart subtotal calculation for Floating Dock
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.shoe.price * item.quantity, 0);
  }, [cart]);

  // Synchronize global video autoplay
  useEffect(() => {
    if (globalVideoRef.current && bgMode !== 'hero-only') {
      globalVideoRef.current.muted = true;
      globalVideoRef.current.defaultMuted = true;
      globalVideoRef.current.play().catch(() => {});
    }
  }, [bgMode]);

  // Real-time Scroll Progress State (0 to 100%)
  const [scrollProgress, setScrollProgress] = useState(0);

  // Check if any modal or drawer is active to lock background scroll
  const isAnyModalOpen = Boolean(
    selectedShoeModal ||
    isCartOpen ||
    isWishlistOpen ||
    isCheckoutOpen ||
    isOrdersOpen ||
    isSizeGuideOpen ||
    reviewShoeTarget ||
    isOrderConfirmationOpen ||
    isMobileFiltersOpen
  );

  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis Butter-Smooth Momentum Scrolling Engine
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    function raf(time: number) {
      lenis.raf(time);
      updateScroll();
      requestAnimationFrame(raf);
    }
    const animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Synchronize modal states with Lenis scroll lock
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isAnyModalOpen) {
      lenisRef.current.stop();
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('lenis-stopped');
    } else {
      lenisRef.current.start();
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stopped');
    }
  }, [isAnyModalOpen]);

  const handleToggleGlobalPlay = () => {
    if (globalVideoRef.current) {
      if (isVideoPlaying) globalVideoRef.current.pause();
      else globalVideoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('stride_shoes_catalog_v3', JSON.stringify(shoes));
    } catch (e) {
      console.error(e);
    }
  }, [shoes]);

  useEffect(() => {
    try {
      localStorage.setItem('stride_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('stride_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('stride_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Category Tab handler
  const handleSelectCategoryTab = (catId: string) => {
    setActiveCategoryTab(catId);
    if (catId === 'all') {
      setFilters((prev) => ({ ...prev, categories: [] }));
    } else {
      setFilters((prev) => ({ ...prev, categories: [catId] }));
    }
  };

  // Filter modifications
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      if (newFilters.categories) {
        if (newFilters.categories.length === 1) {
          setActiveCategoryTab(newFilters.categories[0]);
        } else if (newFilters.categories.length === 0) {
          setActiveCategoryTab('all');
        } else {
          setActiveCategoryTab('');
        }
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setActiveCategoryTab('all');
  };

  // Cart operations
  const handleAddToCart = (
    shoe: Shoe,
    size: number,
    color: ShoeColorway,
    quantity: number = 1
  ) => {
    const itemId = `${shoe.id}-${size}-${color.name}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          shoe,
          selectedSize: size,
          selectedColor: color,
          quantity,
        },
      ];
    });
    showToast(`Added ${shoe.name} (US ${size}) to your bag`);
  };

  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Wishlist toggle
  const handleToggleWishlist = (shoeId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(shoeId);
      if (exists) {
        showToast('Removed from your wishlist');
        return prev.filter((id) => id !== shoeId);
      } else {
        showToast('Added to your saved wishlist');
        return [...prev, shoeId];
      }
    });
  };

  // Review submission
  const handleSubmitReview = (shoeId: string, review: ShoeReview) => {
    setShoes((prev) =>
      prev.map((s) => {
        if (s.id !== shoeId) return s;
        const newReviews = [review, ...s.reviews];
        const newCount = newReviews.length;
        const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvg = Math.round((totalRating / newCount) * 10) / 10;

        // Recalculate fit summary
        const runsSmall = newReviews.filter((r) => r.fit === 'runs_small').length;
        const trueToSize = newReviews.filter((r) => r.fit === 'true_to_size').length;
        const runsLarge = newReviews.filter((r) => r.fit === 'runs_large').length;

        return {
          ...s,
          reviews: newReviews,
          rating: newAvg,
          reviewCount: newCount,
          fitSummary: {
            runsSmallPct: Math.round((runsSmall / newCount) * 100),
            trueToSizePct: Math.round((trueToSize / newCount) * 100),
            runsLargePct: Math.round((runsLarge / newCount) * 100),
          },
        };
      })
    );

    // Also update currently viewed modal if open
    if (selectedShoeModal?.id === shoeId) {
      setSelectedShoeModal((prev) => {
        if (!prev) return null;
        const updatedReviews = [review, ...prev.reviews];
        const newCount = updatedReviews.length;
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        return {
          ...prev,
          reviews: updatedReviews,
          rating: Math.round((totalRating / newCount) * 10) / 10,
          reviewCount: newCount,
        };
      });
    }

    showToast('Your verified review was posted successfully!');
  };

  const handleToggleReviewHelpful = (shoeId: string, reviewId: string) => {
    setShoes((prev) =>
      prev.map((s) => {
        if (s.id !== shoeId) return s;
        return {
          ...s,
          reviews: s.reviews.map((r) => {
            if (r.id !== reviewId) return r;
            const alreadyVoted = !!r.userVotedHelpful;
            return {
              ...r,
              userVotedHelpful: !alreadyVoted,
              helpfulCount: alreadyVoted ? r.helpfulCount - 1 : r.helpfulCount + 1,
            };
          }),
        };
      })
    );

    if (selectedShoeModal?.id === shoeId) {
      setSelectedShoeModal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          reviews: prev.reviews.map((r) => {
            if (r.id !== reviewId) return r;
            const alreadyVoted = !!r.userVotedHelpful;
            return {
              ...r,
              userVotedHelpful: !alreadyVoted,
              helpfulCount: alreadyVoted ? r.helpfulCount - 1 : r.helpfulCount + 1,
            };
          }),
        };
      });
    }
  };

  // Promo code validation
  const handleApplyPromoCode = (code: string) => {
    const formatted = code.toUpperCase().trim();
    if (formatted === 'ORIGINALS15') {
      setPromoCode('ORIGINALS15');
      setPromoDiscountPct(15);
      return { success: true, message: 'Code ORIGINALS15 applied! 15% discount activated.' };
    }
    if (formatted === 'WELCOME20') {
      setPromoCode('WELCOME20');
      setPromoDiscountPct(20);
      return { success: true, message: 'Code WELCOME20 applied! 20% member discount activated.' };
    }
    return { success: false, message: 'Invalid promo code. Try "ORIGINALS15".' };
  };

  // Order Complete handler
  const handleOrderComplete = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setLastPlacedOrder(newOrder);
    setIsOrderConfirmationOpen(true);
  };

  // Filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.genders.length > 0) count += filters.genders.length;
    if (filters.selectedSizes.length > 0) count += filters.selectedSizes.length;
    if (filters.selectedColors.length > 0) count += filters.selectedColors.length;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 250) count++;
    if (filters.minRating > 0) count++;
    if (filters.onlyInStock) count++;
    if (filters.onlySale) count++;
    return count;
  }, [filters]);

  // Filtered and Sorted Shoes
  const filteredShoes = useMemo(() => {
    return shoes.filter((shoe) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = shoe.name.toLowerCase().includes(query);
        const matchesSubtitle = shoe.subtitle.toLowerCase().includes(query);
        const matchesSeries = shoe.series.toLowerCase().includes(query);
        const matchesCat = shoe.category.toLowerCase().includes(query);
        const matchesColors = shoe.colors.some((c) => c.name.toLowerCase().includes(query));
        if (!matchesName && !matchesSubtitle && !matchesSeries && !matchesCat && !matchesColors) {
          return false;
        }
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(shoe.category)) {
          return false;
        }
      }

      // Gender filter - strict 1:1 segregation (any product belongs to one gender category only)
      if (filters.genders.length > 0) {
        if (!filters.genders.includes(shoe.gender)) {
          return false;
        }
      }

      // Size filter
      if (filters.selectedSizes.length > 0) {
        const hasSize = filters.selectedSizes.some((s) => shoe.sizes.includes(s));
        if (!hasSize) return false;
      }

      // Color filter - intelligent keyword matching and color family recognition
      if (filters.selectedColors.length > 0) {
        if (!shoeMatchesColorFilters(shoe.colors, filters.selectedColors)) {
          return false;
        }
      }

      // Price Range filter
      if (shoe.price < filters.priceRange[0] || shoe.price > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.minRating > 0 && shoe.rating < filters.minRating) {
        return false;
      }

      // Stock
      if (filters.onlyInStock && !shoe.inStock) {
        return false;
      }

      // Sale
      if (filters.onlySale && !shoe.discountPercent) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      // 'featured'
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [shoes, filters]);

  // Wishlist shoes list
  const wishlistShoes = useMemo(() => {
    return shoes.filter((s) => wishlist.includes(s.id));
  }, [shoes, wishlist]);

  // Cart financial totals
  const subtotal = cart.reduce((acc, i) => acc + i.shoe.price * i.quantity, 0);
  const discountAmount = promoDiscountPct > 0 ? (subtotal * promoDiscountPct) / 100 : 0;
  const totalCartItemsCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="relative min-h-screen bg-slate-950 text-[#0f172a] flex flex-col selection:bg-[#0066ff] selection:text-white">
      {/* Global Fixed Cinematic Background Video (Option B: Full Viewport Everywhere) */}
      {bgMode !== 'hero-only' && (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <video
            ref={globalVideoRef}
            src="/videos/hero_bg.mp4"
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover transition-all duration-700 ${
              videoOpacity === 'max' ? 'opacity-95' : 'opacity-80'
            }`}
            style={{
              filter: isVividMode 
                ? 'saturate(1.5) contrast(1.18) brightness(1.05)' 
                : 'saturate(1.05) contrast(1.05) brightness(1.0)',
            }}
          >
            <source src="/videos/hero_bg.mp4" type="video/mp4" />
          </video>
          {/* Ambient Lighting & Subtle Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/15 pointer-events-none" />
          <div className="absolute inset-0 bg-slate-950/5 pointer-events-none" />
        </div>
      )}

      {/* 21st.dev Laser Glow Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-[#ff2a6d] to-emerald-400 animate-border-glow shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Content Wrapper (relative z-10 for perfect contrast over video) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl text-xs font-mono-code flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <Header
          searchQuery={filters.searchQuery}
          onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
          activeCategory={activeCategoryTab}
          onSelectCategory={handleSelectCategoryTab}
          cartCount={totalCartItemsCount}
          wishlistCount={wishlist.length}
          orderCount={orders.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          allShoes={shoes}
          onSelectShoe={(shoe) => setSelectedShoeModal(shoe)}
        />

        {/* Hero Showcase */}
        {!filters.searchQuery && (
          <HeroBanner
            bgMode={bgMode}
            onChangeBgMode={(mode) => setBgMode(mode)}
            isVideoPlaying={isVideoPlaying}
            onToggleVideoPlayback={handleToggleGlobalPlay}
            isVividMode={isVividMode}
            onToggleVividMode={() => setIsVividMode(!isVividMode)}
            videoOpacity={videoOpacity}
            onToggleVideoOpacity={() => setVideoOpacity(videoOpacity === 'cinema' ? 'max' : 'cinema')}
            onQuickFilter={(target) => {
              if (target === 'Classics' || target === 'Running') {
                handleSelectCategoryTab(target);
              } else {
                handleFilterChange({ searchQuery: target });
              }
            }}
            onInspectShoe={(shoeId) => {
              const found = shoes.find(s => s.id === shoeId);
              if (found) setSelectedShoeModal(found);
            }}
          />
        )}

        {/* 21st.dev Infinite Marquee Brand Ticker */}
        <MarqueeTicker />

        {/* Floating Category Navigation Pill Bar */}
        <div className="sticky top-20 z-30 w-full max-w-5xl mx-auto px-3 sm:px-4 my-6">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 p-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 sm:gap-1.5 w-max mx-auto px-1.5 py-0.5">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'Classics', label: 'Terrace' },
                { id: 'Running', label: 'Running & Boost' },
                { id: 'Skate', label: 'Skate' },
                { id: 'Basketball', label: 'Basketball' },
                { id: 'Slides', label: 'Slides' },
                { id: 'Equipment', label: 'Equipment' },
                { id: 'Bags', label: 'Bags' },
              ].map((tab) => {
                const isActive = activeCategoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectCategoryTab(tab.id)}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-mono-code font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.45)] scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Store Layout (Option B: Completely Open & Borderless, Floating Glass Elements) */}
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full transition-all duration-500 my-2 sm:my-4 ${
          bgMode === 'adaptive'
            ? 'bg-slate-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8'
            : 'bg-transparent border-0 shadow-none'
        }`}>
          {/* Floating Results Header & Sort Controls Bar */}
          <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.5)] mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-white">
                  {activeCategoryTab === 'all'
                    ? 'All Shoes & Sneakers'
                    : `${activeCategoryTab} Collection`}
                </h2>
                <span className="text-xs font-mono-code font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  {filteredShoes.length}
                </span>
              </div>
              <p className="text-xs font-normal text-slate-400 mt-0.5 font-sans">
                Featuring authentic terrace silhouettes, high-response running trainers, and retro lifestyle footwear.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="md:hidden px-3.5 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs font-mono-code font-bold uppercase tracking-wider text-white flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-cyan-400"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              {/* Custom Obsidian Glassmorphic Sort Dropdown */}
              <CustomSortDropdown
                value={filters.sortBy}
                onChange={(sortBy) => handleFilterChange({ sortBy })}
              />
            </div>
          </div>

          {/* Active Filter Tags Bar */}
          {activeFilterCount > 0 && (
            <div className="py-3 px-4 mb-6 flex items-center gap-2 flex-wrap rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 shadow-lg text-xs font-mono-code">
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                Active Filters:
              </span>

              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-medium shadow-sm">
                  "{filters.searchQuery}"
                  <button onClick={() => handleFilterChange({ searchQuery: '' })} className="hover:text-rose-400 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-slate-200 border border-white/15 rounded-full font-semibold shadow-sm"
                >
                  {cat}
                  <button
                    onClick={() =>
                      handleFilterChange({
                        categories: filters.categories.filter((c) => c !== cat),
                      })
                    }
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.genders.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-slate-200 border border-white/15 rounded-full font-semibold shadow-sm"
                >
                  {g}
                  <button
                    onClick={() =>
                      handleFilterChange({
                        genders: filters.genders.filter((x) => x !== g),
                      })
                    }
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.selectedSizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 rounded-full font-semibold shadow-sm"
                >
                  US {s}
                  <button
                    onClick={() =>
                      handleFilterChange({
                        selectedSizes: filters.selectedSizes.filter((x) => x !== s),
                      })
                    }
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.selectedColors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-slate-200 border border-white/15 rounded-full font-semibold shadow-sm"
                >
                  {color}
                  <button
                    onClick={() =>
                      handleFilterChange({
                        selectedColors: filters.selectedColors.filter((c) => c !== color),
                      })
                    }
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-950/60 text-amber-300 border border-amber-500/30 rounded-full font-semibold shadow-sm">
                  ★ {filters.minRating}+
                  <button onClick={() => handleFilterChange({ minRating: 0 })} className="hover:text-rose-400 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.onlySale && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-950/70 text-rose-300 border border-rose-500/40 rounded-full font-semibold shadow-sm">
                  On Sale
                  <button onClick={() => handleFilterChange({ onlySale: false })} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-slate-400 hover:text-rose-400 font-bold underline ml-2 cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

        {/* Content Layout Grid (Sidebar + Product Catalog) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
          {/* Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-3 space-y-6">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              activeFilterCount={activeFilterCount}
              totalResults={filteredShoes.length}
            />
          </aside>

          {/* Product Grid (9 cols) */}
          <div className="md:col-span-9 lg:col-span-9">
            {filteredShoes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShoes.map((shoe, idx) => (
                  <ProductCard
                    key={shoe.id}
                    shoe={shoe}
                    index={idx}
                    isWishlisted={wishlist.includes(shoe.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onSelectShoe={(s, color) => {
                      setSelectedShoeModal(s);
                      setSelectedColorModal(color || s.colors[0]);
                    }}
                    onQuickAddToCart={(s, size, color) => handleAddToCart(s, size, color, 1)}
                    activeFilterColors={filters.selectedColors}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto text-[#0066ff]">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-slate-900">
                  No Footwear Matches Your Filters
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
                  Try adjusting your price range, choosing different shoe sizes, or clearing specific colorway filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-heading font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg cursor-pointer inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 21st.dev Dynamic Island Floating Luxury Dock */}
      <FloatingDock
        bgMode={bgMode}
        onChangeBgMode={setBgMode}
        isVividMode={isVividMode}
        onToggleVivid={() => setIsVividMode(!isVividMode)}
        isVideoPlaying={isVideoPlaying}
        onToggleVideoPlay={handleToggleGlobalPlay}
        cartCount={cart.length}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Footer */}
      <Footer
        onSelectShoeById={(shoeId) => {
          const target = shoes.find(
            (s) =>
              s.id === shoeId ||
              s.name.toLowerCase().includes(shoeId.toLowerCase()) ||
              shoeId.toLowerCase().includes(s.name.toLowerCase())
          );
          if (target) {
            setSelectedShoeModal(target);
            setSelectedColorModal(target.colors[0]);
          }
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenOrderHistory={() => setIsOrdersOpen(true)}
        orderCount={orders.length}
      />

      {/* MODALS & DRAWERS */}

      {/* 1. Mobile Filter Drawer Modal */}
      {isMobileFiltersOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm md:hidden overflow-hidden"
          data-lenis-prevent="true"
        >
          <div 
            className="bg-white border-t sm:border border-slate-200 w-full max-h-[85vh] rounded-t-3xl sm:rounded-3xl min-h-0 overflow-y-auto overscroll-contain shadow-2xl"
            data-lenis-prevent="true"
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              activeFilterCount={activeFilterCount}
              totalResults={filteredShoes.length}
              isMobileModal={true}
              onCloseMobile={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Product Detail Modal */}
      <ProductDetailModal
        shoe={selectedShoeModal}
        initialColor={selectedColorModal}
        isOpen={!!selectedShoeModal}
        onClose={() => {
          setSelectedShoeModal(null);
          setSelectedColorModal(null);
        }}
        isWishlisted={selectedShoeModal ? wishlist.includes(selectedShoeModal.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenWriteReview={(shoe) => setReviewShoeTarget(shoe)}
        onToggleReviewHelpful={handleToggleReviewHelpful}
      />

      {/* 3. Write Review Modal */}
      {reviewShoeTarget && (
        <WriteReviewModal
          shoe={reviewShoeTarget}
          isOpen={!!reviewShoeTarget}
          onClose={() => setReviewShoeTarget(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* 4. Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        gender={selectedShoeModal?.gender || 'Unisex'}
      />

      {/* 5. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        promoCode={promoCode}
        onApplyPromoCode={handleApplyPromoCode}
        discountAmount={discountAmount}
      />

      {/* 6. Secure Checkout Modal */}
      <SecureCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        subtotal={subtotal}
        discountAmount={discountAmount}
        promoCode={promoCode}
        onOrderComplete={handleOrderComplete}
      />

      {/* 7. Order Confirmation Modal */}
      <OrderConfirmationModal
        order={lastPlacedOrder}
        isOpen={isOrderConfirmationOpen}
        onClose={() => setIsOrderConfirmationOpen(false)}
        onOpenOrderHistory={() => {
          setIsOrderConfirmationOpen(false);
          setIsOrdersOpen(true);
        }}
      />

      {/* 8. Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onSelectOrder={(order) => {
          setLastPlacedOrder(order);
          setIsOrdersOpen(false);
          setIsOrderConfirmationOpen(true);
        }}
      />

      {/* 9. Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistShoes={wishlistShoes}
        onRemoveFromWishlist={handleToggleWishlist}
        onSelectShoe={(s) => setSelectedShoeModal(s)}
      />

      {/* 10. Native $0 Web Speech AI Voice & Interactive Concierge Engine */}
      <VoiceGuideEngine 
        currentShoe={selectedShoeModal || shoes[0]} 
        allShoes={shoes}
        onSearch={(q) => handleFilterChange({ searchQuery: q })}
        onSelectCategory={(cat) => handleSelectCategoryTab(cat)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onSelectShoe={(s) => setSelectedShoeModal(s)}
      />
      </div>
    </div>
  );
}
