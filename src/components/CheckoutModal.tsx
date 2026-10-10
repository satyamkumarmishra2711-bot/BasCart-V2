import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CartItemRecord, WalletState } from '../shared/types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItemRecord[];
  wallet: WalletState | null;
  onConfirmCheckout: (payload: {
    idempotency_key: string;
    shipping_name: string;
    shipping_city: string;
  }) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  wallet,
  onConfirmCheckout,
}) => {
  const [shippingName, setShippingName] = useState('Satisfied Shopper');
  const [shippingCity, setShippingCity] = useState('Mind Palace, Tranquility');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const idempotencyKey = 'chk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      await onConfirmCheckout({
        idempotency_key: idempotencyKey,
        shipping_name: shippingName,
        shipping_city: shippingCity,
      });
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 sm:p-8 border border-stone-200">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
          <Sparkles className="w-4 h-4" />
          <span>Simulated Checkout Flow</span>
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-2">
          Confirm Imaginary Order
        </h3>

        <p className="text-xs text-stone-500 mb-6 leading-relaxed">
          No credit card or UPI required. ₹{subtotal.toLocaleString('en-IN')} will be deducted from your virtual BasCash balance. No physical products will be shipped.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Recipient / Dream Shopper Name
              </label>
              <input
                type="text"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs focus:outline-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Simulated Delivery Destination
              </label>
              <input
                type="text"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs focus:outline-stone-900"
                required
              />
            </div>
          </div>

          {/* Ledger Impact Breakdown */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-stone-700">
              <span>Virtual Cart Subtotal:</span>
              <span className="font-semibold tabular-nums text-stone-900">
                ₹{subtotal.toLocaleString('en-IN')} BasCash
              </span>
            </div>
            <div className="flex justify-between text-emerald-800 font-bold">
              <span>Real Bank Card Charge:</span>
              <span>₹0.00 (Zero)</span>
            </div>
            <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-amber-200/60">
              <span>Real Money Saved:</span>
              <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-stone-400"
            >
              {isSubmitting ? (
                <span>Simulating Transaction...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Place Imaginary Order (₹0 Real)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
