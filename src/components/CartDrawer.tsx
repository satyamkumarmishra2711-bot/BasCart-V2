import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import type { CartItemRecord, WalletState } from '../shared/types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItemRecord[];
  wallet: WalletState | null;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemoveItem: (cartId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  wallet,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const balance = wallet?.balance ?? 50000;
  const hasSufficientBasCash = balance >= subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-lg font-bold text-stone-900">Your Imaginary Cart</h2>
              <span className="text-xs text-stone-500 tabular-nums">
                ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <ShoppingBag className="w-12 h-12 mb-3 stroke-1 text-stone-300" />
                <p className="text-base font-semibold text-stone-700 mb-1">Your cart is empty</p>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Add high-ticket imaginary items to satisfy your cravings and save real money!
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cart_id}
                  className="flex gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 items-center"
                >
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.product_name || 'Product'}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-stone-900 truncate">
                      {item.product?.product_name || 'Product item'}
                    </h4>
                    <div className="text-xs font-bold text-stone-900 mt-1 tabular-nums">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      ₹{(item.product?.price || 0).toLocaleString('en-IN')} each
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.cart_id, item.quantity - 1)}
                      className="w-6 h-6 rounded border border-stone-300 hover:bg-white flex items-center justify-center text-xs text-stone-600"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cart_id, item.quantity + 1)}
                      className="w-6 h-6 rounded border border-stone-300 hover:bg-white flex items-center justify-center text-xs text-stone-600"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.cart_id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/50 space-y-4">
              {/* Savings callout */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real Money Saved:</span>
                </div>
                <strong className="font-bold text-sm text-emerald-700 tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Simulated Subtotal</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')} BasCash
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Real Bank Payment</span>
                  <span className="font-bold text-emerald-600">₹0.00 (Untouched)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200">
                  <span>Available BasCash</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      hasSufficientBasCash ? 'text-stone-900' : 'text-rose-600'
                    }`}
                  >
                    ₹{balance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {!hasSufficientBasCash && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  Insufficient BasCash! Remove some items to proceed.
                </div>
              )}

              <button
                onClick={onCheckout}
                disabled={!hasSufficientBasCash}
                className="w-full py-3.5 px-4 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Simulated Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
