import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Building,
  Smartphone,
  Check
} from 'lucide-react';
import { CartItem, ShippingAddress, DeliveryOption, PaymentDetails, OrderRecord } from '../types';

interface SecureCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  promoCode: string;
  onOrderComplete: (order: OrderRecord) => void;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Ground Delivery',
    price: 0,
    estimatedDays: '3-5 Business Days',
    description: 'Tracked contactless delivery to your doorstep',
  },
  {
    id: 'express',
    name: 'Express 2-Day Air',
    price: 9.99,
    estimatedDays: '2 Business Days',
    description: 'Priority flight logistics with signature confirmation',
  },
  {
    id: 'nextday',
    name: 'Priority Next-Day Rush',
    price: 19.99,
    estimatedDays: 'Next Business Day',
    description: 'Guaranteed delivery tomorrow morning before 12 PM',
  },
];

export const SecureCheckoutModal: React.FC<SecureCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discountAmount,
  promoCode,
  onOrderComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Initiating 256-Bit SSL Handshake...');

  // Step 1: Shipping Address State
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-8890',
    addressLine1: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
  });

  // Step 2: Delivery Option
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]);

  // Step 3: Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gpay' | 'apple_pay' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 8900 1234 5678',
    holder: 'ALEX MORGAN',
    expiry: '08/28',
    cvv: '842',
  });

  if (!isOpen) return null;

  // Formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardDetails({ ...cardDetails, expiry: raw });
  };

  const shippingFee = selectedDelivery.price;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

  // Card brand detection
  const getCardBrand = (number: string) => {
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5')) return 'MASTERCARD';
    if (clean.startsWith('3')) return 'AMEX';
    return 'CARD';
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    // Realistic multi-stage verification animation
    setTimeout(() => {
      setProcessingStatus('Verifying 3D Secure Authentication...');
    }, 900);

    setTimeout(() => {
      setProcessingStatus('Securing Payment with Card Issuer...');
    }, 1800);

    setTimeout(() => {
      setProcessingStatus('Payment Authorized! Generating Order Confirmation...');
    }, 2700);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const generatedOrder: OrderRecord = {
        orderId: `STR-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
        items,
        shippingAddress: address,
        deliveryOption: selectedDelivery,
        paymentMethod:
          paymentMethod === 'card'
            ? `Credit Card (${getCardBrand(cardDetails.number)} **** ${cardDetails.number.slice(-4)})`
            : paymentMethod === 'gpay'
            ? 'Google Pay'
            : paymentMethod === 'apple_pay'
            ? 'Apple Pay'
            : 'Cash On Delivery',
        cardLast4: cardDetails.number.slice(-4),
        subtotal,
        discount: discountAmount,
        promoCodeApplied: promoCode || undefined,
        shippingFee,
        tax: estimatedTax,
        total: grandTotal,
        status: 'Order Placed',
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(
          'en-US',
          { weekday: 'short', month: 'short', day: 'numeric' }
        ),
      };

      onOrderComplete(generatedOrder);
    }, 3400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden"
      data-lenis-prevent="true"
    >
      <div 
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in-50 zoom-in-95"
        data-lenis-prevent="true"
      >
        {/* Top Security Banner */}
        <div className="bg-neutral-900 text-white px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              256-Bit SSL Encrypted Secure Checkout
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              PCI-DSS Level 1 Compliant
            </span>
            <button
              onClick={onClose}
              disabled={isProcessingPayment}
              className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Step Checkout Breadcrumbs */}
        <div className="px-6 py-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs font-bold shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 cursor-pointer ${
                currentStep >= 1 ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 1
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span>Shipping Address</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />

            <button
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-1.5 cursor-pointer ${
                currentStep >= 2 ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 2
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span>Delivery Method</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />

            <div
              className={`flex items-center gap-1.5 ${
                currentStep === 3 ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep === 3
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                3
              </span>
              <span>Payment & Review</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div 
          data-lenis-prevent="true"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6"
        >
          {isProcessingPayment ? (
            /* Gateway Verification Screen */
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="relative w-20 h-20">
                <div className="w-full h-full border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
                <Lock className="w-8 h-8 text-neutral-900 absolute inset-0 m-auto" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-neutral-900">
                Processing Secure Payment
              </h3>
              <p className="text-xs text-neutral-600 font-medium max-w-sm animate-pulse">
                {processingStatus}
              </p>
              <div className="text-[11px] text-neutral-400">
                Please do not refresh or navigate away from this screen.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column (7 cols) */}
              <div className="lg:col-span-7">
                {/* STEP 1: SHIPPING ADDRESS */}
                {currentStep === 1 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setCurrentStep(2);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="font-display text-base font-bold uppercase text-neutral-900 mb-1">
                        1. Shipping & Contact Info
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Where should we dispatch your authentic sneakers?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.fullName}
                          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={address.email}
                          onChange={(e) => setAddress({ ...address, email: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Phone Number (for SMS updates) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Country
                        </label>
                        <select
                          value={address.country}
                          onChange={(e) => setAddress({ ...address, country: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                        >
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>Canada</option>
                          <option>Australia</option>
                          <option>Germany</option>
                          <option>India</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={address.addressLine1}
                        onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                        placeholder="House / Apt / Street"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          State / Province *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          ZIP / Postal *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        Continue to Delivery Method
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: DELIVERY METHOD */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-base font-bold uppercase text-neutral-900 mb-1">
                        2. Choose Delivery Speed
                      </h3>
                      <p className="text-xs text-neutral-500">
                        All shipments include verified tracking and insurance.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {DELIVERY_OPTIONS.map((opt) => {
                        const isSelected = selectedDelivery.id === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedDelivery(opt)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                                : 'border-neutral-200 hover:border-neutral-400 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                  isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                                  <span>{opt.name}</span>
                                  <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">
                                    {opt.estimatedDays}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                  {opt.description}
                                </p>
                              </div>
                            </div>

                            <span className="font-display text-sm font-bold text-neutral-900">
                              {opt.price === 0 ? 'FREE' : `$${opt.price.toFixed(2)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        Proceed to Secure Payment
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENT & CONFIRMATION */}
                {currentStep === 3 && (
                  <form onSubmit={handlePlaceOrder} className="space-y-5">
                    <div>
                      <h3 className="font-display text-base font-bold uppercase text-neutral-900 mb-1">
                        3. Encrypted Payment Gateway
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Choose your preferred payment method.
                      </p>
                    </div>

                    {/* Payment Mode Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-300 hover:border-neutral-900 text-neutral-700 bg-white'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Card
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('gpay')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'gpay'
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-300 hover:border-neutral-900 text-neutral-700 bg-white'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Google Pay
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'cod'
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-300 hover:border-neutral-900 text-neutral-700 bg-white'
                        }`}
                      >
                        <Building className="w-5 h-5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Pay On Delivery
                        </span>
                      </button>
                    </div>

                    {/* Card Form */}
                    {paymentMethod === 'card' && (
                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                        {/* Card Number */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                              Card Number *
                            </label>
                            <span className="text-[10px] font-extrabold uppercase bg-neutral-900 text-white px-2 py-0.5 rounded">
                              {getCardBrand(cardDetails.number)}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={cardDetails.number}
                              onChange={handleCardNumberChange}
                              placeholder="4532 8900 1234 5678"
                              className="w-full pl-10 pr-3 py-2.5 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                            />
                            <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                          </div>
                        </div>

                        {/* Name on Card */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={cardDetails.holder}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, holder: e.target.value.toUpperCase() })
                            }
                            placeholder="ALEX MORGAN"
                            className="w-full px-3 py-2 text-xs uppercase font-medium rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                          />
                        </div>

                        {/* Expiry & CVV */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                              Expiry Date (MM/YY) *
                            </label>
                            <input
                              type="text"
                              required
                              value={cardDetails.expiry}
                              onChange={handleExpiryChange}
                              placeholder="08/28"
                              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                              CVV / Security Code *
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              required
                              value={cardDetails.cvv}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  cvv: e.target.value.replace(/\D/g, ''),
                                })
                              }
                              placeholder="•••"
                              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'gpay' && (
                      <div className="p-4 bg-neutral-100 rounded-xl text-center space-y-2">
                        <Smartphone className="w-8 h-8 text-neutral-800 mx-auto" />
                        <p className="text-xs font-bold text-neutral-800">
                          Instant 1-Tap Google Pay Checkout
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          You will verify the payment using your biometric or device lock.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="p-4 bg-neutral-100 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-neutral-800">
                          Cash On Delivery / UPI at Doorstep
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Pay in cash or scan delivery agent's QR code when your sneakers arrive.
                        </p>
                      </div>
                    )}

                    {/* Security promise */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        Protected by bank-grade TLS encryption. Your card details are never saved on our servers.
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900"
                      >
                        Back
                      </button>
                      <button
                        id="final-pay-btn"
                        type="submit"
                        className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-display text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-emerald-400" />
                        Authorize & Pay ${grandTotal.toFixed(2)}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Order Summary Right Column (5 cols) */}
              <div className="lg:col-span-5 bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h4>

                {/* Items preview list */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs">
                      <img
                        src={item.selectedColor.image}
                        alt={item.shoe.name}
                        className="w-14 h-14 object-cover rounded-lg bg-white border border-neutral-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{item.shoe.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          Size: {item.shoe.category === 'Equipment' || item.shoe.category === 'Bags' ? 'One Size' : `US ${item.selectedSize}`}
                        </p>
                        <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-neutral-900">
                        ${(item.shoe.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing summary */}
                <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({promoCode})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery ({selectedDelivery.name.split(' ')[0]})</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedDelivery.price === 0 ? 'FREE' : `$${selectedDelivery.price.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="font-semibold text-neutral-900">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Total Due</span>
                    <span className="font-display">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping destination quick recap */}
                {currentStep > 1 && (
                  <div className="pt-3 border-t border-neutral-200 text-xs text-neutral-500">
                    <span className="font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Shipping To:
                    </span>
                    <p className="text-neutral-900 font-medium">
                      {address.fullName}, {address.addressLine1}, {address.city}, {address.state}{' '}
                      {address.postalCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
