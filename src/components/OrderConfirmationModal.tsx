import React from 'react';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  Printer, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { OrderRecord } from '../types';

interface OrderConfirmationModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderHistory: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenOrderHistory,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-hidden"
      data-lenis-prevent="true"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95"
        data-lenis-prevent="true"
      >
        {/* Banner */}
        <div className="bg-neutral-900 text-white p-6 sm:p-8 text-center relative overflow-hidden shrink-0">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle className="w-9 h-9" />
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest bg-white/10 text-neutral-300 px-3 py-1 rounded-full mb-2">
            Payment Authorized • 100% Authentic
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-1">
            Order Confirmed!
          </h2>
          <p className="text-xs text-neutral-300">
            Thank you, {order.shippingAddress.fullName}! We are prepping your pairs for dispatch.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-neutral-800 border border-neutral-700 px-4 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-neutral-400">Order Ref:</span>
            <span className="font-bold text-emerald-400">{order.orderId}</span>
          </div>
        </div>

        {/* Content */}
        <div 
          data-lenis-prevent="true"
          className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain"
        >
          {/* Tracking Timeline */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
              <span>Estimated Delivery:</span>
              <span className="text-neutral-900">{order.estimatedDeliveryDate}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto">
                  ✓
                </div>
                <span className="text-neutral-900">Placed</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto animate-pulse">
                  ••
                </div>
                <span className="text-neutral-900">Preparing</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mx-auto">
                  3
                </div>
                <span className="text-neutral-400">In Transit</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mx-auto">
                  4
                </div>
                <span className="text-neutral-400">Delivered</span>
              </div>
            </div>
          </div>

          {/* Purchased Items */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Items Ordered ({order.items.length})
            </h4>
            <div className="space-y-2.5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs"
                >
                  <img
                    src={item.selectedColor.image}
                    alt={item.shoe.name}
                    className="w-14 h-14 object-cover rounded-lg bg-white border border-neutral-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 truncate">{item.shoe.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {item.selectedColor.name} • US {item.selectedSize}
                    </p>
                    <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-neutral-900">
                    ${(item.shoe.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-neutral-900 mb-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                Shipping Details
              </div>
              <p className="font-semibold text-neutral-900">{order.shippingAddress.fullName}</p>
              <p className="text-neutral-600">{order.shippingAddress.addressLine1}</p>
              <p className="text-neutral-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">{order.shippingAddress.email}</p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-neutral-900 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
                Payment Breakdown
              </div>
              <p className="text-neutral-600">
                Method: <strong className="text-neutral-900">{order.paymentMethod}</strong>
              </p>
              <p className="text-neutral-600">
                Subtotal: <span className="font-semibold text-neutral-900">${order.subtotal.toFixed(2)}</span>
              </p>
              {order.discount > 0 && (
                <p className="text-emerald-700 font-semibold">
                  Discount: -${order.discount.toFixed(2)}
                </p>
              )}
              <p className="text-neutral-600">Shipping: {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee}`}</p>
              <p className="text-neutral-900 font-bold text-sm pt-1 border-t border-neutral-200">
                Total Paid: ${order.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenOrderHistory();
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-200 rounded-lg cursor-pointer"
            >
              View All Orders
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
