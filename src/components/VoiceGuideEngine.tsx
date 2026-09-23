import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send, 
  Play, 
  Pause, 
  SkipForward, 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft,
  MessageSquare, 
  Compass, 
  ShoppingBag, 
  RotateCcw, 
  ExternalLink, 
  Square,
  ShieldCheck,
  Truck,
  Package,
  Ruler,
  CreditCard,
  Tag
} from 'lucide-react';
import { Shoe } from '../types';

interface VoiceGuideEngineProps {
  currentShoe?: Shoe | null;
  allShoes?: Shoe[];
  onStepChange?: (stepIndex: number, stepTitle: string) => void;
  onExplodeToggle?: (explode: boolean) => void;
  onSearch?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenOrders?: () => void;
  onOpenSizeGuide?: () => void;
  onOpenCheckout?: () => void;
  onSelectShoe?: (shoe: Shoe) => void;
}

export interface VoiceTourStep {
  title: string;
  subtitle: string;
  script: string;
  triggerExploded?: boolean;
}

interface ActionChip {
  label: string;
  action: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedShoes?: Shoe[];
  actionChips?: ActionChip[];
}

const CATEGORIZED_SUGGESTIONS = [
  'Samba vs Gazelle?',
  'Shoes under $120',
  'Do Sambas run true to size?',
  'How do I style Sambas?',
  'Best for all-day walking?',
  'How does 3D canvas work?',
  'Track my order',
  'Are shoes 100% authentic?',
  'Open size conversion guide',
  'What payment methods?',
  'How to clean suede & leather?',
  'Why are Sambas so famous?',
  'What promo code works?',
  'Show black sneakers',
  'Are they good in the rain?',
  'Open my shopping bag',
];

export const VoiceGuideEngine: React.FC<VoiceGuideEngineProps> = ({
  currentShoe,
  allShoes = [],
  onStepChange,
  onExplodeToggle,
  onSearch,
  onSelectCategory,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenSizeGuide,
  onOpenCheckout,
  onSelectShoe,
}) => {
  // Mode: 'chat' (two-way interactive voice/text) or 'tour' (guided 4-chapter narrative)
  const [activeTab, setActiveTab] = useState<'chat' | 'tour'>('chat');
  
  // Expanded HUD State
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);

  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Greetings. I am your STRIDE AI Footwear Concierge. I can answer questions about all website features—from 3D model rotation and fit telemetry to order tracking, sizing charts, and authentic terrace history. Tap the mic and speak at your own pace!",
      timestamp: 'Now',
      actionChips: [
        { label: 'Samba vs Gazelle', action: () => handleSendMessage('What is the difference between Samba and Gazelle?') },
        { label: 'Size Guide', action: () => onOpenSizeGuide && onOpenSizeGuide() },
        { label: 'Track Order', action: () => onOpenOrders && onOpenOrders() },
        { label: 'Shoes under $120', action: () => handleSendMessage('Show me shoes under $120') }
      ]
    },
  ]);

  // Tour State
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');

  const currentStepRef = useRef(0);
  const isTourPlayingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const lastTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const handleSendMessageRef = useRef<(text?: string) => void>(() => {});
  const interactionTurnRef = useRef<Record<string, number>>({});

  // Suggestions scroll ref and drag state
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Tour Steps
  const tourSteps: VoiceTourStep[] = [
    {
      title: 'Architectural Heritage',
      subtitle: 'The 1970s Terrace Genesis',
      script: currentShoe
        ? `Welcome to the STRIDE Archive. You are inspecting the ${currentShoe.name}, part of the ${currentShoe.series}. Notice the low profile silhouette that redefined footwear culture from European terraces to global runways.`
        : 'Welcome to the STRIDE Archive. Culture never stands still. Explore our precision-engineered footwear built with obsessively curated materials.',
      triggerExploded: false,
    },
    {
      title: 'Anatomy: Gum Outsole & Cushioning',
      subtitle: 'Footwear Core Architecture',
      script: currentShoe
        ? `Let us examine the structural anatomy. The cupsole utilizes high-density vulcanized gum rubber paired with an internal shock-absorbing EVA core for maximum ground feedback and zero fatigue.`
        : 'Examining the foundation: high-density vulcanized gum rubber outsole with concentric pivot zones engineered for multi-surface grip.',
      triggerExploded: false,
    },
    {
      title: 'Materiality: T-Toe & Supple Leather',
      subtitle: 'Hand-Finished Craftsmanship',
      script: currentShoe
        ? `Moving to the upper. The signature T-toe overlay is crafted from heavy-nap textured suede, anchored by hand-burnished full-grain leather that molds organically to your foot within 48 hours.`
        : 'The upper features premium full-grain leather paired with textured suede overlays and gold foil branding.',
      triggerExploded: false,
    },
    {
      title: 'Fit & Sizing Telemetry',
      subtitle: 'Verified Customer Data',
      script: currentShoe
        ? `According to over ${currentShoe.reviewCount} verified buyers, ${currentShoe.fitSummary.trueToSizePct}% report true-to-size fit. ${currentShoe.fitSummary.runsSmallPct > 10 ? 'If you prefer a relaxed toe box, we advise ordering a half size up.' : 'Order your standard size with total confidence.'}`
        : 'Fit telemetry confirms 94% true-to-size satisfaction across over 2,400 verified reviews.',
      triggerExploded: false,
    }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat' && isExpanded) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded, activeTab]);

  // Suggestions Carousel Scroll Helpers
  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (!suggestionsRef.current) return;
    const scrollAmount = 180;
    suggestionsRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!suggestionsRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - suggestionsRef.current.offsetLeft;
    scrollLeftRef.current = suggestionsRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !suggestionsRef.current) return;
    e.preventDefault();
    const x = e.pageX - suggestionsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    suggestionsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Helper to rotate response angles to prevent repetitive answers
  const getNextVariantIndex = (key: string, maxVariants: number): number => {
    const current = interactionTurnRef.current[key] || 0;
    interactionTurnRef.current[key] = (current + 1) % maxVariants;
    return current;
  };

  // Comprehensive AI Knowledge & Conversational Reasoning Engine covering ALL website aspects
  const generateAIResponse = (userText: string): {
    reply: string;
    recommendedShoes?: Shoe[];
    actionChips?: ActionChip[];
  } => {
    const lower = userText.toLowerCase().trim();

    // 1. WEBSITE CAPABILITY: 3D Canvas / 360 Viewer / Exploded Anatomy
    if (lower.includes('3d') || lower.includes('rotate') || lower.includes('360') || lower.includes('canvas') || lower.includes('explode') || lower.includes('view model')) {
      return {
        reply: "Our Cinema-Grade 3D Interactive Canvas lets you click and drag to spin footwear 360 degrees in full high-DPR resolution. When viewing any shoe detail, you can inspect micro-grain leather textures, examine vulcanized gum tread, or switch colorways in real time with zero latency.",
        actionChips: [
          { label: 'Start 3D Audio Tour', action: () => { setActiveTab('tour'); startTour(); } },
          { label: 'Inspect Samba 3D', action: () => {
            const samba = allShoes.find(s => s.name.toLowerCase().includes('samba'));
            if (samba && onSelectShoe) onSelectShoe(samba);
          }}
        ]
      };
    }

    // 2. WEBSITE CAPABILITY: Sizing Guide & Conversion Chart
    if (lower.includes('size chart') || lower.includes('size guide') || lower.includes('conversion') || lower.includes('uk size') || lower.includes('eu size') || lower.includes('cm') || (lower.includes('how') && lower.includes('measure'))) {
      if (onOpenSizeGuide) onOpenSizeGuide();
      return {
        reply: "Opening the Interactive Size Conversion Matrix. We provide precise conversion between US Men's, US Women's, UK, EU, and exact centimeter foot measurements, along with verified wearer fit distributions.",
        actionChips: [
          { label: 'Open Size Guide Modal', action: () => onOpenSizeGuide && onOpenSizeGuide() }
        ]
      };
    }

    // 3. WEBSITE CAPABILITY: Order Tracking & Order History
    if (lower.includes('track') || lower.includes('my order') || lower.includes('past orders') || lower.includes('order status') || lower.includes('where is my package') || lower.includes('order history')) {
      if (onOpenOrders) onOpenOrders();
      return {
        reply: "Opening your Order History & Live Courier Telemetry. Every archive purchase is tracked via live Express Courier with a dedicated tracking ID, estimated delivery window, and verifiable status.",
        actionChips: [
          { label: 'View Order History', action: () => onOpenOrders && onOpenOrders() }
        ]
      };
    }

    // 4. WEBSITE CAPABILITY: Authenticity Guarantee & Zero Replicas
    if (lower.includes('authentic') || lower.includes('fake') || lower.includes('replica') || lower.includes('legit') || lower.includes('real') || lower.includes('verification') || lower.includes('guarantee')) {
      return {
        reply: "The STRIDE 100% Authenticity Guarantee: Every silhouette in our archive is certified with serialized archive tags, NFC provenance chip verification, and factory inspection standards. We uphold a zero-replica policy and guarantee 100% genuine craftsmanship.",
        actionChips: [
          { label: 'Explore Archive Silhouettes', action: () => onSelectCategory && onSelectCategory('Classics') }
        ]
      };
    }

    // 5. WEBSITE CAPABILITY: Payment Methods, Klarna & Security
    if (lower.includes('payment') || lower.includes('pay') || lower.includes('apple pay') || lower.includes('credit card') || lower.includes('klarna') || lower.includes('installment') || lower.includes('security') || lower.includes('ssl')) {
      return {
        reply: "We support Apple Pay, Visa, Mastercard, American Express, and Klarna 4-interest-free installment financing. All transactions are protected by bank-grade 256-bit SSL encryption with biometric authentication.",
        actionChips: [
          { label: 'Open Checkout', action: () => onOpenCheckout && onOpenCheckout() },
          { label: 'Open Shopping Bag', action: () => onOpenCart && onOpenCart() }
        ]
      };
    }

    // 6. WEBSITE CAPABILITY: Returns, 30-Day Exchange & Warranty
    if (lower.includes('return') || lower.includes('exchange') || lower.includes('refund') || lower.includes('policy') || lower.includes('send back') || lower.includes('warranty')) {
      return {
        reply: "30-Day Archive Return Policy: We offer 30-day hassle-free returns and size exchanges on all unworn pairs with original tags. Every box includes a pre-printed prepaid courier return label for instant drop-off.",
        actionChips: [
          { label: 'Check Sizing First', action: () => onOpenSizeGuide && onOpenSizeGuide() }
        ]
      };
    }

    // 7. WEBSITE CAPABILITY: Free Courier Shipping & Delivery Timelines
    if (lower.includes('shipping') || lower.includes('courier') || lower.includes('delivery') || lower.includes('how long') || lower.includes('dispatch') || lower.includes('free ship')) {
      return {
        reply: "Express Courier Dispatch: Orders over $100 unlock complimentary Global Express Courier (standard $9.99 under $100). Packages dispatch within 24 hours and arrive at your doorstep in 2 to 3 business days with live tracking.",
        actionChips: [
          { label: 'View Shopping Bag', action: () => onOpenCart && onOpenCart() }
        ]
      };
    }

    // 8. WEBSITE CAPABILITY: Promo Codes & VIP Savings
    if (lower.includes('promo') || lower.includes('coupon') || lower.includes('discount') || lower.includes('code') || lower.includes('voucher') || lower.includes('save money') || lower.includes('deal')) {
      return {
        reply: "Active VIP Promo Code: Apply code 'ORIGINALS15' during checkout to immediately deduct 15% from your total cart order. Express Courier is automatically complimentary when cart exceeds $100.",
        actionChips: [
          { label: 'Open Cart & Apply', action: () => onOpenCart && onOpenCart() }
        ]
      };
    }

    // 9. WEBSITE CAPABILITY: Wishlist & Vault
    if (lower.includes('wishlist') || lower.includes('favorite') || lower.includes('save') || lower.includes('heart')) {
      if (onOpenWishlist) onOpenWishlist();
      return {
        reply: "Opening your Saved Wishlist Vault. You can tap the Heart icon on any footwear card across the archive to curate your dream collection and track stock availability.",
        actionChips: [
          { label: 'View Wishlist', action: () => onOpenWishlist && onOpenWishlist() }
        ]
      };
    }

    // 10. WEBSITE CAPABILITY: Filtering, Searching & Store Navigation
    if (lower.includes('filter') || lower.includes('sort') || lower.includes('search') || lower.includes('how to find') || lower.includes('navigate')) {
      return {
        reply: "Store Navigation: Use the category tabs at the top (Terrace & Classics, Boost & Running, Skate & Street, Slides, Equipment). You can filter by price range, color palette, and shoe size in the left sidebar, or sort by Best Selling, Price, and Top Rated.",
        actionChips: [
          { label: 'Filter Terrace Classics', action: () => onSelectCategory && onSelectCategory('Classics') },
          { label: 'Filter Running', action: () => onSelectCategory && onSelectCategory('Running') },
          { label: 'Filter Skate', action: () => onSelectCategory && onSelectCategory('Skate') }
        ]
      };
    }

    // 11. COMPARISON: Samba vs Gazelle
    if ((lower.includes('samba') && lower.includes('gazelle')) || (lower.includes('difference') && (lower.includes('samba') || lower.includes('gazelle')))) {
      const variant = getNextVariantIndex('samba_vs_gazelle', 3);
      const samba = allShoes.find(s => s.name.toLowerCase().includes('samba'));
      const gazelle = allShoes.find(s => s.name.toLowerCase().includes('gazelle'));
      const found = [samba, gazelle].filter(Boolean) as Shoe[];

      if (variant === 0) {
        return {
          reply: "Material & Sole Breakdown: The Samba uses a firmer full-grain leather upper with a suede T-toe and a dark, low-profile vulcanized gum cupsole. The Gazelle features a buttery all-suede upper, a translucent gum midsole with a honeycomb tread, and a molded Trefoil tongue. Sambas feel flatter with direct ground feel, while Gazelles have a slightly softer step-in cushion.",
          recommendedShoes: found,
          actionChips: [
            { label: 'Filter Terrace Classics', action: () => onSelectCategory && onSelectCategory('Classics') },
            { label: 'How to style them', action: () => handleSendMessage('How do I style Sambas and Gazelles?') }
          ]
        };
      } else if (variant === 1) {
        return {
          reply: "Styling & Culture Comparison: The Samba originated in 1950 for icy football pitches and became the definitive European terrace uniform. It pairs sharply with wide-leg suit trousers, dark denim, and tailored trench coats. The Gazelle (1966) leans into rich vibrant colorways—ideal for 90s Britpop vibes, oversized graphic knits, and relaxed summer linen shorts.",
          recommendedShoes: found,
          actionChips: [
            { label: 'Inspect Samba OG', action: () => samba && onSelectShoe && onSelectShoe(samba) },
            { label: 'Inspect Gazelle Indoor', action: () => gazelle && onSelectShoe && onSelectShoe(gazelle) }
          ]
        };
      } else {
        return {
          reply: "Fit Telemetry: Sambas run narrow through the arch and midfoot—if you have wider feet, our data recommends going up a half size. Gazelles have slightly more forgiving suede stretch across the toe box after 48 hours of wear.",
          recommendedShoes: found,
          actionChips: [
            { label: 'View Size Telemetry', action: () => handleSendMessage('Do Sambas run true to size?') }
          ]
        };
      }
    }

    // 12. COMPARISON: Spezial vs Samba
    if (lower.includes('spezial')) {
      const variant = getNextVariantIndex('spezial', 2);
      const spezial = allShoes.find(s => s.name.toLowerCase().includes('spezial'));
      const samba = allShoes.find(s => s.name.toLowerCase().includes('samba'));

      if (variant === 0) {
        return {
          reply: "The Handball Spezial (1979) was designed for high-impact indoor handball courts. It features a lush pigskin suede upper with a reinforced cleat-effect gum sole for sudden lateral pivots. It feels slightly softer and more flexible right out of the box than the leather Samba.",
          recommendedShoes: [spezial, samba].filter(Boolean) as Shoe[],
          actionChips: [
            { label: 'Inspect Spezial', action: () => spezial && onSelectShoe && onSelectShoe(spezial) }
          ]
        };
      } else {
        return {
          reply: "Aesthetic Appeal: The Spezial is the connoisseur's terrace shoe with signature gold foil branding and a distinct curved heel counter. If you want a sneaker that's less ubiquitous than the Samba but equally iconic, the Spezial in Collegiate Navy or Earth Brown is our top recommendation.",
          recommendedShoes: [spezial].filter(Boolean) as Shoe[],
          actionChips: [
            { label: 'Show Classics', action: () => onSelectCategory && onSelectCategory('Classics') }
          ]
        };
      }
    }

    // 13. STYLING & OUTFIT ADVICE
    if (lower.includes('style') || lower.includes('wear with') || lower.includes('outfit') || lower.includes('pants') || lower.includes('jeans') || lower.includes('clothes') || lower.includes('fashion') || lower.includes('look good')) {
      const variant = getNextVariantIndex('styling', 3);
      if (variant === 0) {
        return {
          reply: "Terrace Classic Styling: Because Sambas and Gazelles have a low profile, they look best anchored by wide-leg or straight-cut denim that breaks gently over the tongue. Pair them with clean white crew socks, a boxy heavyweight tee, and an unbuttoned overshirt or chore coat.",
          actionChips: [
            { label: 'Show Terrace Classics', action: () => onSelectCategory && onSelectCategory('Classics') },
            { label: 'Recommend for wide feet', action: () => handleSendMessage('Recommend for wide feet') }
          ]
        };
      } else if (variant === 1) {
        return {
          reply: "Tailored Smart-Casual: You can elevate the Samba OG or Stan Smith Lux with pleated charcoal trousers, a relaxed wool blazer, and a tucked fine-knit sweater. The gum sole adds an understated vintage edge without looking like gym gear.",
          actionChips: [
            { label: 'View Stan Smith Lux', action: () => {
              const stan = allShoes.find(s => s.name.toLowerCase().includes('stan'));
              if (stan && onSelectShoe) onSelectShoe(stan);
            }}
          ]
        };
      } else {
        return {
          reply: "Y2K Skate Silhouette Styling: For the Campus 00s, go full volume. Pair them with baggy cargo pants, oversized vintage sports jerseys, and let the fat laces sit prominent. Keep the rest of the outfit relaxed to balance the chunky silhouette.",
          actionChips: [
            { label: 'View Campus 00s', action: () => {
              const campus = allShoes.find(s => s.name.toLowerCase().includes('campus'));
              if (campus && onSelectShoe) onSelectShoe(campus);
            }}
          ]
        };
      }
    }

    // 14. COMFORT & ALL-DAY WALKING
    if (lower.includes('walk') || lower.includes('comfortable') || lower.includes('comfort') || lower.includes('standing') || lower.includes('travel') || lower.includes('feet hurt') || lower.includes('arch')) {
      const variant = getNextVariantIndex('comfort', 2);
      const ultra = allShoes.find(s => s.name.toLowerCase().includes('ultra') || s.name.toLowerCase().includes('boost'));
      const retropy = allShoes.find(s => s.name.toLowerCase().includes('retropy'));

      if (variant === 0) {
        return {
          reply: "For 20,000+ step days and long travel: We strongly recommend our Boost silhouettes like the UltraBoost Light or Retropy E5. They feature hundreds of microscopic TPU steam-capsules that compress under pressure and return explosive kinetic rebound, drastically reducing heel fatigue.",
          recommendedShoes: [ultra, retropy].filter(Boolean) as Shoe[],
          actionChips: [
            { label: 'Filter Running & Boost', action: () => onSelectCategory && onSelectCategory('Running') },
            { label: 'Sambas for walking?', action: () => handleSendMessage('Are Sambas comfortable for walking?') }
          ]
        };
      } else {
        return {
          reply: "Are Terrace shoes like Sambas comfortable? Yes, but in a different way. They have an internal die-cut EVA wedge that delivers low-to-the-ground court stability. They aren't plush marshmallow foam, but once the full-grain leather upper molds to your foot after 48 hours, they feel like a tailored second skin.",
          actionChips: [
            { label: 'Do they need break-in?', action: () => handleSendMessage('Do Sambas need break-in?') }
          ]
        };
      }
    }

    // 15. BREAK-IN & LEATHER STRETCH
    if (lower.includes('break in') || lower.includes('break-in') || lower.includes('stiff') || lower.includes('stretch') || lower.includes('blister') || lower.includes('rub')) {
      return {
        reply: "Break-In Telemetry: Fresh out of the box, the Samba's full-grain calfskin leather and synthetic heel counter can feel structured. Wear them with thick athletic crew socks for the first 2 or 3 short outings. The leather naturally absorbs body heat, stretches by approximately 2 to 3 millimeters, and molds permanently to your foot contour.",
        actionChips: [
          { label: 'Sizing & Fit Advice', action: () => handleSendMessage('Do Sambas run true to size?') }
        ]
      };
    }

    // 16. CLEANING, SUEDE CARE & CREASING
    if (lower.includes('clean') || lower.includes('wash') || lower.includes('protect') || lower.includes('care') || lower.includes('dirty') || lower.includes('crease') || lower.includes('creasing')) {
      return {
        reply: "Footwear Care Protocol: 1) Never submerge or machine wash leather or suede shoes—it deteriorates the vulcanized gum rubber bond. 2) Clean the smooth leather upper with a damp microfiber cloth and mild soap. 3) For the suede T-toe, use a dry crepe suede brush in circular motions. 4) Use cedar shoe trees to smooth out toe-box creasing when not in use.",
        actionChips: [
          { label: 'Can I wear in the rain?', action: () => handleSendMessage('Are they good in the rain?') }
        ]
      };
    }

    // 17. WEATHER, RAIN & DURABILITY
    if (lower.includes('rain') || lower.includes('water') || lower.includes('wet') || lower.includes('weather') || lower.includes('winter') || lower.includes('durable') || lower.includes('durability') || lower.includes('last long')) {
      return {
        reply: "Weather & Longevity: The vulcanized gum cupsole is virtually indestructible and delivers outstanding traction on slick pavement. However, raw suede T-toes can absorb water and darken. We recommend applying a breathable hydrophobic waterproofing spray across the suede prior to wearing them in heavy rain.",
        actionChips: [
          { label: 'Check Leather Specs', action: () => handleSendMessage('What leather is used?') }
        ]
      };
    }

    // 18. WHY SO POPULAR / HISTORY & ORIGIN
    if (lower.includes('why') && (lower.includes('popular') || lower.includes('famous') || lower.includes('hype') || lower.includes('history') || lower.includes('story') || lower.includes('origin'))) {
      return {
        reply: "The Cultural Genesis: Created in 1950 so European footballers could train on frozen icy turf, the Samba earned its name at the 1950 Rio World Cup. In the 1970s and 80s, UK football fans traveling to away games across Europe brought pairs back, turning it into the signature terrace uniform. Today, its minimal silhouette and versatility have cemented it as one of the most celebrated sneaker designs in human history.",
        actionChips: [
          { label: 'Explore Terrace Classics', action: () => onSelectCategory && onSelectCategory('Classics') }
        ]
      };
    }

    // 19. RECOMMENDATION & WHICH ONE SHOULD I BUY
    if (lower.includes('which one') || lower.includes('recommend') || lower.includes('suggest') || lower.includes('what should i buy') || lower.includes('help me choose') || lower.includes('pick one') || lower.includes('best shoe')) {
      const samba = allShoes.find(s => s.name.toLowerCase().includes('samba'));
      const gazelle = allShoes.find(s => s.name.toLowerCase().includes('gazelle'));
      const campus = allShoes.find(s => s.name.toLowerCase().includes('campus'));
      const topPicks = [samba, gazelle, campus].filter(Boolean) as Shoe[];

      return {
        reply: "Here is our curated recommendation matrix: 1) For the ultimate everyday wardrobe staple: Samba OG ($110). 2) For rich colors and buttery suede texture: Gazelle Indoor ($120). 3) For relaxed Y2K street volume: Campus 00s ($110). Tap any silhouette below to inspect its 3D anatomy.",
        recommendedShoes: topPicks,
        actionChips: [
          { label: 'Samba OG Details', action: () => samba && onSelectShoe && onSelectShoe(samba) },
          { label: 'Gazelle Indoor Details', action: () => gazelle && onSelectShoe && onSelectShoe(gazelle) }
        ]
      };
    }

    // 20. BUDGET / UNDER $100 / UNDER $120
    const priceMatch = lower.match(/under\s*\$?(\d+)/i) || lower.match(/less than\s*\$?(\d+)/i);
    if (priceMatch || lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable') || lower.includes('price')) {
      const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : 120;
      const budgetShoes = allShoes
        .filter(s => s.price <= maxPrice && s.inStock)
        .sort((a, b) => a.price - b.price)
        .slice(0, 3);

      return {
        reply: budgetShoes.length > 0 
          ? `Here are our highest-rated silhouettes priced at or under $${maxPrice}: ${budgetShoes.map(s => `${s.name} ($${s.price})`).join(', ')}. All feature authentic archive construction and qualify for free shipping on orders over $100.`
          : `Archive pricing begins at $65 for the Adilette 22 Slides up to $110 for the Samba OG. Every order qualifies for free Express Courier over $100.`,
        recommendedShoes: budgetShoes,
        actionChips: [
          { label: 'Check Promo Code', action: () => handleSendMessage('What promo code works?') }
        ]
      };
    }

    // 21. BEST SELLERS / TRENDING
    if (lower.includes('best seller') || lower.includes('bestseller') || lower.includes('popular') || lower.includes('trending') || lower.includes('top rated')) {
      const bestSellers = allShoes.filter(s => s.isBestSeller || s.rating >= 4.8).slice(0, 3);
      return {
        reply: `Our most requested silhouettes right now are the ${bestSellers.map(s => s.name).join(', ')}. Verified wearers consistently rate them 4.8+ stars for enduring leather quality and timeless styling.`,
        recommendedShoes: bestSellers,
      };
    }

    // 22. RUNNING / BOOST / MARATHON
    if (lower.includes('running') || lower.includes('boost') || lower.includes('marathon') || lower.includes('workout') || lower.includes('gym')) {
      if (onSelectCategory) onSelectCategory('Running');
      const runningShoes = allShoes.filter(s => s.category === 'Running' || s.name.toLowerCase().includes('boost') || s.name.toLowerCase().includes('adizero')).slice(0, 3);
      return {
        reply: "For training and distance: The UltraBoost Light offers high-rebound energy return paired with a Continental rubber outsole for wet traction. The Primeknit upper gently conforms to your foot without hot spots.",
        recommendedShoes: runningShoes,
        actionChips: [
          { label: 'View All Running Footwear', action: () => onSelectCategory && onSelectCategory('Running') }
        ]
      };
    }

    // 23. SKATE / STREET / CHUNKY
    if (lower.includes('skate') || lower.includes('campus') || lower.includes('chunky') || lower.includes('fat laces')) {
      if (onSelectCategory) onSelectCategory('Skate');
      const skateShoes = allShoes.filter(s => s.category === 'Skate' || s.name.toLowerCase().includes('campus')).slice(0, 3);
      return {
        reply: "The Campus 00s redefines chunky Y2K skateboarding heritage with oversized proportions, padded ankle collar cushioning, reinforced ollie zones, and 25mm fat laces.",
        recommendedShoes: skateShoes,
        actionChips: [
          { label: 'Show Skate Silhouettes', action: () => onSelectCategory && onSelectCategory('Skate') }
        ]
      };
    }

    // 24. COLOR QUERIES: Black, White, Red, Blue, Green, Cream, Brown
    const colors = ['black', 'white', 'red', 'blue', 'green', 'brown', 'cream', 'beige', 'grey'];
    const matchedColor = colors.find(c => lower.includes(c));
    if (matchedColor) {
      const colorMatches = allShoes.filter(s => 
        s.colors.some(c => c.name.toLowerCase().includes(matchedColor)) ||
        s.name.toLowerCase().includes(matchedColor)
      ).slice(0, 3);

      if (colorMatches.length > 0) {
        if (onSearch) onSearch(matchedColor);
        return {
          reply: `Filtered the archive for ${matchedColor} silhouettes. Recommended models include the ${colorMatches.map(s => s.name).join(', ')}.`,
          recommendedShoes: colorMatches,
        };
      }
    }

    // 25. SPECIFIC SHOE INQUIRY (Samba, Spezial, Gazelle, Stan Smith, Forum, Ozelia, Retropy)
    const specificShoe = allShoes.find(s => lower.includes(s.name.toLowerCase()) || lower.includes(s.id.toLowerCase()));
    if (specificShoe) {
      const reviewQuote = specificShoe.reviews?.[0] ? ` Verified buyer ${specificShoe.reviews[0].author} noted: "${specificShoe.reviews[0].title}".` : '';
      return {
        reply: `${specificShoe.name} (${specificShoe.series}): Priced at $${specificShoe.price}. Upper: ${specificShoe.specs.upper}. Outsole: ${specificShoe.specs.outsole}. ${specificShoe.fitSummary.trueToSizePct}% of verified wearers report true-to-size fit.${reviewQuote}`,
        recommendedShoes: [specificShoe],
        actionChips: [
          { label: `Inspect ${specificShoe.name} in 3D`, action: () => onSelectShoe && onSelectShoe(specificShoe) }
        ]
      };
    }

    // 26. SIZING & FIT TELEMETRY
    if (lower.includes('size') || lower.includes('fit') || lower.includes('small') || lower.includes('large') || lower.includes('tight') || lower.includes('wide')) {
      if (currentShoe) {
        return {
          reply: `For the ${currentShoe.name}: ${currentShoe.fitSummary.trueToSizePct}% of ${currentShoe.reviewCount} buyers report true to size. ${
            currentShoe.fitSummary.runsSmallPct > 12 
              ? 'Because terrace silhouettes feature a narrow T-toe box, we advise going up a half size if you have wider feet.' 
              : 'It fits standard width true-to-size. Order your normal sneaker size.'
          }`,
          recommendedShoes: [currentShoe],
          actionChips: [
            { label: 'View Shoe Details', action: () => onSelectShoe && onSelectShoe(currentShoe) },
            { label: 'Open Size Guide', action: () => onOpenSizeGuide && onOpenSizeGuide() }
          ]
        };
      }
      return {
        reply: "Sizing Telemetry Overview: Across our catalog, 94% report true to size. European terrace models (Samba, Spezial, SL 72) feature a tapered athletic fit—wide feet should opt for half a size up. Chunky skate models (Campus 00s) and runners (UltraBoost) have roomier step-in ergonomics.",
        actionChips: [
          { label: 'Open Size Guide', action: () => onOpenSizeGuide && onOpenSizeGuide() }
        ]
      };
    }

    // 27. MATERIALS & LEATHER CRAFTSMANSHIP
    if (lower.includes('leather') || lower.includes('material') || lower.includes('gum') || lower.includes('suede') || lower.includes('quality') || lower.includes('craft')) {
      return {
        reply: "Our Archive Craftsmanship: We use hand-burnished full-grain bovine leather that patinas with age, paired with heavy-nap suede T-toe overlays and high-density vulcanized gum rubber cupsoles engineered for tactile traction and decades of wear.",
      };
    }

    // 28. CONVERSATIONAL FALLBACK WITH DYNAMIC DISCOVERY
    const fallbackVariant = getNextVariantIndex('fallback', 3);
    if (fallbackVariant === 0) {
      return {
        reply: "I can assist you with all store features—from fit telemetry and size charts to order tracking, 3D model rotation, and terrace outfit styling. What would you like to explore?",
        actionChips: [
          { label: 'Samba vs Gazelle', action: () => handleSendMessage('What is the difference between Samba and Gazelle?') },
          { label: 'Size Chart', action: () => onOpenSizeGuide && onOpenSizeGuide() },
          { label: 'Shoes under $120', action: () => handleSendMessage('Show me shoes under $120') }
        ]
      };
    } else if (fallbackVariant === 1) {
      return {
        reply: "Looking for recommendations? Tell me what you need—whether it's an everyday city walker, a retro terrace icon, or long-distance Boost cushioning, I can match the right silhouette to your preferences.",
        actionChips: [
          { label: 'Recommend for me', action: () => handleSendMessage('Which shoe should I buy?') },
          { label: 'Track Order', action: () => onOpenOrders && onOpenOrders() }
        ]
      };
    } else {
      return {
        reply: "Feel free to ask me anything about leather craftsmanship, break-in duration, rain durability, order tracking, or active promo codes. What can I check for you?",
        actionChips: [
          { label: 'Are they good in rain?', action: () => handleSendMessage('Are they good in the rain?') },
          { label: 'Active promo code', action: () => handleSendMessage('What promo code works?') }
        ]
      };
    }
  };

  // Process User Query & Execute Store Commands
  const handleSendMessage = (queryText?: string) => {
    const textToSend = (queryText || textInput).trim();
    if (!textToSend) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');
    lastTranscriptRef.current = '';

    // Stop mic if listening
    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    // Stop any current voice speech before thinking
    stopVoice();

    // Generate intelligent AI response
    const { reply, recommendedShoes, actionChips } = generateAIResponse(textToSend);

    // Realistic brief latency for natural conversation feel
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedShoes,
        actionChips,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      speakText(reply);
    }, 350);
  };

  // Keep ref up to date for speech callbacks
  handleSendMessageRef.current = handleSendMessage;

  // Initialize Speech Recognition with generous 2.2s natural speech debounce
  useEffect(() => {
    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechRecognitionSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      // Continuous mode so the engine does NOT cut off while speaking
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        lastTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        let transcript = '';

        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const trimmed = transcript.trim();
        if (trimmed) {
          lastTranscriptRef.current = trimmed;
          setTextInput(trimmed);

          // Clear any pending timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          // Relaxed natural pause timer: Wait 2.2 seconds of silence before auto-sending!
          // This ensures the user can take breaths and speak multi-clause sentences without being cut off!
          silenceTimerRef.current = window.setTimeout(() => {
            try {
              recognition.stop();
            } catch (_) {}
          }, 2200);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      // When speech recognition ends (after 2.2s silence or manual stop)
      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const spoken = lastTranscriptRef.current.trim();
        if (spoken) {
          lastTranscriptRef.current = '';
          handleSendMessageRef.current(spoken);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to init speech recognition:', err);
      setSpeechRecognitionSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopVoice();
    };
  }, []);

  // Voice synthesizer function (TTS)
  const speakText = (text: string, onDone?: () => void) => {
    if (!('speechSynthesis' in window) || isMuted) {
      if (onDone) onDone();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.88;
    utterance.rate = 1.10;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('guy') || 
        v.name.toLowerCase().includes('george') || 
        v.name.toLowerCase().includes('daniel') || 
        v.name.toLowerCase().includes('male')
      )
    ) || voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onDone) onDone();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = () => {
    setIsTourPlaying(false);
    isTourPlayingRef.current = false;
    setIsSpeaking(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Toggle Microphone Listening
  const handleToggleMic = () => {
    if (!speechRecognitionSupported) {
      alert("Speech recognition isn't supported in this browser. You can type your question in the text box below!");
      return;
    }

    if (isListening) {
      // If user clicks while listening, stop immediately and process what was spoken
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      setIsListening(false);
      const spoken = lastTranscriptRef.current.trim();
      if (spoken) {
        lastTranscriptRef.current = '';
        handleSendMessage(spoken);
      }
    } else {
      stopVoice();
      lastTranscriptRef.current = '';
      setTextInput('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  // Tour Step Player
  const speakStep = (index: number) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    if (index >= tourSteps.length) {
      setIsTourPlaying(false);
      isTourPlayingRef.current = false;
      setActiveSpeechText('Tour complete. Explore the archive at your leisure.');
      if (onExplodeToggle) onExplodeToggle(false);
      return;
    }

    const step = tourSteps[index];
    currentStepRef.current = index;
    setCurrentStepIndex(index);
    setActiveSpeechText(step.script);

    if (onStepChange) {
      onStepChange(index, step.title);
    }

    if (onExplodeToggle && step.triggerExploded !== undefined) {
      onExplodeToggle(step.triggerExploded);
    }

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(step.script);
    utterance.pitch = 0.88;
    utterance.rate = 1.10;

    const voices = window.speechSynthesis.getVoices();
    const deepMaleVoice = voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('daniel') || 
        v.name.toLowerCase().includes('george')
      )
    ) || voices.find(v => v.lang.startsWith('en'));

    if (deepMaleVoice) {
      utterance.voice = deepMaleVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (!isTourPlayingRef.current) return;
      timerRef.current = window.setTimeout(() => {
        if (isTourPlayingRef.current) {
          speakStep(currentStepRef.current + 1);
        }
      }, 1000);
    };

    utterance.onerror = () => {
      setIsTourPlaying(false);
      isTourPlayingRef.current = false;
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startTour = () => {
    setIsExpanded(true);
    setActiveTab('tour');
    setIsTourPlaying(true);
    isTourPlayingRef.current = true;
    speakStep(0);
  };

  const pauseTour = () => {
    setIsTourPlaying(false);
    isTourPlayingRef.current = false;
    stopVoice();
  };

  const resumeTour = () => {
    setIsTourPlaying(true);
    isTourPlayingRef.current = true;
    speakStep(currentStepIndex);
  };

  const nextStep = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      speakStep(currentStepIndex + 1);
    } else {
      stopVoice();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleClearChat = () => {
    stopVoice();
    interactionTurnRef.current = {};
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation cleared. Tap the microphone and speak your question at your own pace—I will answer directly.",
        timestamp: 'Now',
        actionChips: [
          { label: 'Samba vs Gazelle', action: () => handleSendMessage('What is the difference between Samba and Gazelle?') },
          { label: 'Size Guide', action: () => onOpenSizeGuide && onOpenSizeGuide() },
          { label: 'Track Order', action: () => onOpenOrders && onOpenOrders() }
        ]
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 transition-all duration-500">
      {/* 21st.dev Shimmer Pill - Collapsed Launcher */}
      {!isExpanded && (
        <div className="p-[1.5px] rounded-full bg-gradient-to-r from-cyan-500 via-[#ff2a6d] to-emerald-400 animate-border-glow shadow-[0_12px_36px_rgba(6,182,212,0.35)] transition-transform duration-300 hover:scale-[1.03] active:scale-95">
          <button
            id="voice-assistant-launch-btn"
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2.5 rounded-full bg-slate-950/95 hover:bg-slate-900 backdrop-blur-2xl flex items-center gap-3 cursor-pointer text-white border border-white/10"
            aria-label="Open AI Voice & Chat Concierge"
          >
            {/* Pulsing AI Capsule */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <span className="absolute -inset-1 rounded-full bg-cyan-400/40 animate-ping pointer-events-none" />
              <Mic className="w-4 h-4 relative z-10" />
            </div>

            {/* Label and Live Status */}
            <div className="text-left pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono-code font-bold tracking-widest text-cyan-400 uppercase">
                  AI Voice & Concierge
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-mono-code font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Relaxed Voice
                </span>
              </div>
              <p className="text-xs font-heading font-bold text-white flex items-center gap-1 mt-0.5">
                Speak or Ask Questions
                <ChevronRight className="w-3 h-3 text-cyan-400" />
              </p>
            </div>

            {/* Live Audio Equalizer indicator */}
            <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-900 rounded-full border border-white/10">
              {[40, 80, 50, 90, 60].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full transition-all duration-150 ${isSpeaking || isListening ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}
                  style={{
                    height: `${h * 0.16}px`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          </button>
        </div>
      )}

      {/* 21st.dev Dynamic Island - Full Two-Way Voice & Chat HUD */}
      {isExpanded && (
        <div 
          data-lenis-prevent="true"
          className="w-[360px] sm:w-[410px] h-[550px] max-h-[85vh] rounded-3xl bg-slate-950/95 border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-white"
        >
          {/* Top Gradient Laser Accent */}
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-[#ff2a6d] to-emerald-400 animate-border-glow shrink-0" />

          {/* HUD Header */}
          <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                  STRIDE Concierge
                  <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                </h4>
                <p className="text-[10px] font-mono-code text-slate-400 font-medium">
                  {isListening ? 'LISTENING... (2.2S SILENCE AUTO-SENDS)' : isSpeaking ? 'SPEAKING AUDIO RESPONSE...' : 'FULL-STORE AI ASSISTANT'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute voice' : 'Mute voice'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-[#ff2a6d]" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
              <button
                onClick={() => {
                  stopVoice();
                  if (isListening) recognitionRef.current?.stop();
                  setIsExpanded(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Close AI Concierge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs: AI Chat vs Audio Tour */}
          <div className="flex border-b border-white/10 bg-slate-950/60 shrink-0 text-xs font-mono-code font-bold">
            <button
              onClick={() => {
                setActiveTab('chat');
                stopVoice();
              }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'chat' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Voice & Text Chat
            </button>
            <button
              onClick={() => {
                setActiveTab('tour');
                if (!isTourPlaying) startTour();
              }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'tour' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Guided Audio Tour
            </button>
          </div>

          {/* TAB 1: TWO-WAY VOICE & TEXT CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Conversation Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md font-medium'
                          : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-tl-xs shadow-md'
                      }`}
                    >
                      <p>{m.text}</p>

                      {/* Recommended Shoe Cards directly inside chat */}
                      {m.recommendedShoes && m.recommendedShoes.length > 0 && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-white/10">
                          <span className="text-[10px] font-mono-code uppercase tracking-wider text-cyan-400 font-bold block">
                            Recommended Silhouettes:
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {m.recommendedShoes.map((shoe) => (
                              <div
                                key={shoe.id}
                                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 transition-colors group"
                              >
                                <img
                                  src={shoe.colors[0]?.image || shoe.images[0]}
                                  alt={shoe.name}
                                  className="w-12 h-12 object-contain rounded-lg bg-slate-900 shrink-0 p-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <h6 className="font-heading text-xs font-bold text-white truncate">
                                    {shoe.name}
                                  </h6>
                                  <p className="text-[10px] font-mono-code text-cyan-300 font-bold">
                                    ${shoe.price} • {shoe.category}
                                  </p>
                                </div>
                                <button
                                  onClick={() => onSelectShoe && onSelectShoe(shoe)}
                                  className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono-code font-bold uppercase rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
                                  title="Inspect 3D Detail"
                                >
                                  Inspect
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Action Chips */}
                      {m.actionChips && m.actionChips.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                          {m.actionChips.map((chip, chipIdx) => (
                            <button
                              key={chipIdx}
                              onClick={chip.action}
                              className="px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono-code font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1"
                            >
                              <span>{chip.label}</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[9px] font-mono-code text-slate-500">
                        {m.sender === 'user' ? 'You' : 'STRIDE Voice AI'} • {m.timestamp}
                      </span>
                      {m.sender === 'assistant' && isSpeaking && (
                        <button
                          onClick={stopVoice}
                          className="text-[9px] font-mono-code text-rose-400 hover:text-rose-300 flex items-center gap-0.5 cursor-pointer"
                          title="Stop audio playback"
                        >
                          <Square className="w-2.5 h-2.5 fill-current" />
                          Stop audio
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Listening Live Waveform Indicator with Generous Pause Note */}
                {isListening && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono-code animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-400 shrink-0">
                      <Mic className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-300">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                        Listening... Speak naturally (2.2s silence auto-sends)
                      </div>
                      <p className="text-[10px] text-rose-400/80 mt-0.5">
                        {textInput ? `"${textInput}"` : 'Take your time—I won’t cut you off mid-sentence!'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Categorized Quick Prompt Suggestion Carousel with Left/Right Nav Arrows & Wheel/Drag Slide */}
              <div className="relative px-2 py-2 bg-slate-950/90 border-t border-white/5 flex items-center gap-1 shrink-0 group/carousel">
                {/* Left Scroll Arrow */}
                <button
                  onClick={() => scrollSuggestions('left')}
                  className="p-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-white/10 shrink-0 transition-colors cursor-pointer shadow-xs"
                  aria-label="Scroll options left"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>

                {/* Scrollable Container */}
                <div 
                  ref={suggestionsRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={(e) => {
                    if (e.deltaY) {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none scroll-smooth"
                >
                  {CATEGORIZED_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/40 text-[10px] font-mono-code text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Right Scroll Arrow */}
                <button
                  onClick={() => scrollSuggestions('right')}
                  className="p-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-white/10 shrink-0 transition-colors cursor-pointer shadow-xs"
                  aria-label="Scroll options right"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Input Area: Hands-Free Voice Button + Text Typing Field */}
              <div className="p-3 border-t border-white/10 bg-slate-900/60 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Push-to-Talk Voice Button */}
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-105'
                        : 'bg-slate-850 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400'
                    }`}
                    title={isListening ? 'Click to finish speaking right now' : 'Click to speak comfortably at your own pace'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Typing Input */}
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={isListening ? 'Listening... will wait 2.2s after you finish' : 'Type question or tap mic to speak...'}
                    className="flex-1 bg-slate-950 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: GUIDED FOOTWEAR AUDIO TOUR (Beloved earlier design) */}
          {activeTab === 'tour' && (
            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* 16-Bar Spectrum Equalizer */}
                <div className="py-3 px-3.5 bg-slate-900/80 mb-3 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-end gap-1 h-6">
                    {[35, 60, 90, 45, 80, 100, 70, 50, 85, 95, 65, 40, 75, 90, 55, 30].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 rounded-full transition-all duration-100 bg-gradient-to-t from-cyan-400 to-[#ff2a6d]"
                        style={{
                          height: isSpeaking ? `${Math.max(4, Math.round((h / 100) * 22 * (0.4 + Math.random() * 0.6)))}px` : '4px',
                          opacity: isSpeaking ? 0.95 : 0.25,
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-mono-code text-cyan-300 font-bold bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    STEP {currentStepIndex + 1} OF {tourSteps.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-[#ff2a6d] transition-all duration-500 ease-out"
                    style={{ width: `${((currentStepIndex + 1) / tourSteps.length) * 100}%` }}
                  />
                </div>

                {/* Transcript & Step Details */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono-code uppercase tracking-widest text-cyan-400 font-bold block">
                    {tourSteps[currentStepIndex]?.subtitle}
                  </span>
                  <h5 className="text-sm font-heading font-bold text-white uppercase mt-0.5">
                    {tourSteps[currentStepIndex]?.title}
                  </h5>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed mt-2 p-3 rounded-xl bg-slate-900/80 border border-white/10">
                    "{activeSpeechText || tourSteps[currentStepIndex]?.script}"
                  </p>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isTourPlaying ? (
                    <button
                      onClick={pauseTour}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-white/15 text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5 text-cyan-400" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeTour}
                      className="shimmer-btn px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-heading font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-[0_4px_15px_rgba(6,182,212,0.35)] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play Tour
                    </button>
                  )}

                  <button
                    onClick={nextStep}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/15 transition-colors cursor-pointer"
                    title="Next Step"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    const nextStepIndex = (currentStepIndex + 1) % tourSteps.length;
                    speakStep(nextStepIndex);
                  }}
                  className="text-[11px] font-mono-code font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Skip Chapter
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
