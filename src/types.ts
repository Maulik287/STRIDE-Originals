export interface ShoeReview {
  id: string;
  author: string;
  rating: number; // 1 to 5
  date: string;
  fit: 'runs_small' | 'true_to_size' | 'runs_large';
  comfortRating: number; // 1 to 5
  verifiedBuyer: boolean;
  title: string;
  comment: string;
  helpfulCount: number;
  userVotedHelpful?: boolean;
}

export interface ShoeColorway {
  name: string;
  hex: string;
  image: string;
  images?: string[];
}

export interface Shoe {
  id: string;
  name: string;
  series: string; // e.g. "Originals", "Terrace Classics", "Performance Boost"
  subtitle: string;
  category: 'Classics' | 'Running' | 'Skate' | 'Basketball' | 'Slides' | 'Equipment' | 'Bags';
  gender: 'Men' | 'Women' | 'Unisex';
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  colors: ShoeColorway[];
  sizes: number[]; // US sizes, e.g. [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]
  inStock: boolean;
  lowStockSizes?: number[];
  fitSummary: {
    runsSmallPct: number;
    trueToSizePct: number;
    runsLargePct: number;
  };
  description: string;
  features: string[];
  specs: {
    closure: string;
    upper: string;
    outsole: string;
    lining: string;
  };
  images: string[];
  reviews: ShoeReview[];
}

export interface FilterState {
  searchQuery: string;
  categories: string[];
  genders: string[];
  selectedSizes: number[];
  selectedColors: string[];
  priceRange: [number, number];
  minRating: number;
  onlyInStock: boolean;
  onlySale: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface CartItem {
  id: string; // unique item id composed of shoeId-size-color
  shoe: Shoe;
  selectedSize: number;
  selectedColor: ShoeColorway;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
}

export interface PaymentDetails {
  method: 'card' | 'gpay' | 'apple_pay' | 'cod';
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'unknown';
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  deliveryOption: DeliveryOption;
  paymentMethod: string;
  cardLast4?: string;
  subtotal: number;
  discount: number;
  promoCodeApplied?: string;
  shippingFee: number;
  tax: number;
  total: number;
  status: 'Order Placed' | 'Preparing Shipment' | 'On the Way' | 'Delivered';
  estimatedDeliveryDate: string;
}
