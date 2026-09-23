import React from 'react';
import { X, PackageCheck, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { OrderRecord } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onSelectOrder: (order: OrderRecord) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden"
      data-lenis-prevent="true"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col animate-in fade-in-50 zoom-in-95"
        data-lenis-prevent="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-neutral-900" />
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-neutral-900">
              Your Order History ({orders.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div 
          data-lenis-prevent="true"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-4"
        >
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
              <h4 className="font-display text-base font-bold uppercase text-neutral-900">
                No orders placed yet
              </h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Once you complete a secure checkout, your tracking details and receipts will appear here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                onClick={() => onSelectOrder(order)}
                className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-900 transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-neutral-900 text-sm">
                      {order.orderId}
                    </span>
                    <span className="text-neutral-400 ml-2">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {order.status}
                  </span>
                </div>

                {/* Shoes thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {order.items.map((item) => (
                    <img
                      key={item.id}
                      src={item.selectedColor.image}
                      alt={item.shoe.name}
                      title={`${item.shoe.name} (US ${item.selectedSize})`}
                      className="w-12 h-12 object-cover rounded-lg bg-white border border-neutral-200 shrink-0"
                    />
                  ))}
                  <div className="text-xs text-neutral-600 pl-2">
                    {order.items.length} {order.items.length === 1 ? 'pair' : 'pairs'} • $
                    {order.total.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                  <span>Est. Arrival: <strong className="text-neutral-800">{order.estimatedDeliveryDate}</strong></span>
                  <span className="text-neutral-900 font-bold group-hover:underline flex items-center">
                    View Full Receipt <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
