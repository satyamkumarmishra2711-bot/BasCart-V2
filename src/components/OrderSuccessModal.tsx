import React from 'react';
import { X, CheckCircle, Package, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import type { OrderRecord } from '../shared/types.ts';

interface OrderSuccessModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 border border-stone-200 text-center">
        {/* Celebration Badge */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Congratulations!
        </h2>
        <p className="text-base font-semibold text-stone-700 mb-4">
          You bought absolutely nothing.
        </p>

        {/* Brand Slogan Card */}
        <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl mb-6 text-xs text-left space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span>Order Reference:</span>
            <span className="font-mono text-white font-semibold">{order.order_number}</span>
          </div>
          <div className="flex justify-between items-center text-stone-400">
            <span>Imaginary Total:</span>
            <span className="text-stone-300 font-semibold tabular-nums">
              ₹{order.total_amount.toLocaleString('en-IN')} BasCash
            </span>
          </div>
          <div className="flex justify-between items-center text-emerald-400 font-bold pt-2 border-t border-stone-800">
            <span>Real Money Saved:</span>
            <span className="text-sm tabular-nums">₹{order.real_money_saved.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-stone-400">
            <span>Real Bank Account Charged:</span>
            <span className="text-emerald-400 font-bold">₹0.00</span>
          </div>
        </div>

        {/* Simulated Tracking Timeline */}
        <div className="text-left mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
            Simulated Delivery Status
          </h4>
          <ol className="space-y-3 text-xs">
            <li className="flex items-center gap-2.5 text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>1. Order Placed in Imagination — Recorded</span>
            </li>
            <li className="flex items-center gap-2.5 text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>2. Impulse Cravings Satisfied — Guilt Neutralized</span>
            </li>
            <li className="flex items-center gap-2.5 text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>3. Real Bank Balance Untouched — Verified</span>
            </li>
            <li className="flex items-center gap-2.5 text-stone-500">
              <Package className="w-4 h-4 shrink-0 text-stone-400" />
              <span>4. Delivered to Peace of Mind — In Continuous Progress</span>
            </li>
          </ol>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Keep Shopping
          </button>
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
