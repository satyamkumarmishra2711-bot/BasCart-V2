import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ShieldAlert, Sparkles, Check } from 'lucide-react';
import type { ProductRecord } from '../shared/types.ts';

interface ProductDetailModalProps {
  product: ProductRecord | null;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductRecord, quantity: number) => void;
  onToggleWishlist: (product: ProductRecord) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-stone-100 overflow-hidden">
            {!imgError ? (
              <img
                src={product.image_url}
                alt={product.product_name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-stone-100 text-stone-400">
                <ShoppingBag className="w-12 h-12 mb-3" />
                <span className="text-sm font-medium">{product.product_name}</span>
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider mb-2 font-medium">
                <span>{product.category_id.replace('cat_', '')}</span>
                <span aria-hidden="true">·</span>
                <span className={product.stock_status === 'low_stock' ? 'text-amber-600' : 'text-stone-500'}>
                  {product.stock_status.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-stone-900 mb-3 leading-snug">
                {product.product_name}
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Guilt-Free Value Proposition Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-6 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>The BasCart Real-Life Savings Rule</span>
                </div>
                <p>
                  Placing an imaginary order for this item saves your real bank account{' '}
                  <strong className="font-bold text-emerald-800">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </strong>
                  .
                </p>
              </div>

              {/* Price & Quantity */}
              <div className="flex items-end justify-between mb-6 pb-6 border-b border-stone-200">
                <div>
                  <span className="block text-xs text-stone-500">Virtual Price</span>
                  <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">Real Cost: ₹0.00</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-stone-700 font-semibold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-stone-700 font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                disabled={product.stock_status === 'out_of_stock'}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Imaginary Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Simulated Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                aria-label="Wishlist toggle"
                className={`p-3 rounded-xl border transition-colors ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
