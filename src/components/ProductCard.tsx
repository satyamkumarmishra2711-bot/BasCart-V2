import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import type { ProductRecord } from '../shared/types.ts';

interface ProductCardProps {
  product: ProductRecord;
  isWishlisted: boolean;
  onAddToCart: (product: ProductRecord) => void;
  onToggleWishlist: (product: ProductRecord) => void;
  onViewDetails: (product: ProductRecord) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onViewDetails,
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const getStockLabel = () => {
    if (product.stock_status === 'out_of_stock') return 'Out of Stock';
    if (product.stock_status === 'low_stock') return 'Few Units Left';
    return 'In Stock';
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col cursor-pointer"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {!imgError ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 p-4 text-center">
            <ShoppingBag className="w-8 h-8 text-stone-300 mb-2" />
            <span className="text-xs text-stone-400 font-medium">{product.product_name}</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors backdrop-blur-md ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-0 bottom-3 px-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1.5 bg-stone-900/90 text-white text-xs font-medium rounded-md shadow-sm backdrop-blur-sm flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Quick Inspect
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">
        {/* Unboxed Metadata */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
          <span>{product.category_id.replace('cat_', '')}</span>
          <span aria-hidden="true">·</span>
          <span className={product.stock_status === 'low_stock' ? 'text-amber-600' : 'text-stone-500'}>
            {getStockLabel()}
          </span>
        </div>

        <h3 className="font-semibold text-stone-900 text-sm line-clamp-1 mb-1">
          {product.product_name}
        </h3>

        <p className="text-xs text-stone-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Bottom Bar: Price & Add Button */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] text-stone-400">Imaginary Price</span>
            <span className="text-base font-bold text-stone-900 tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock_status === 'out_of_stock'}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
