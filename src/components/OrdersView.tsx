import React from 'react';
import { Package, CheckCircle, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import type { OrderRecord } from '../shared/types.ts';

interface OrdersViewProps {
  orders: OrderRecord[];
  onStartShopping: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onStartShopping }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
          <span>Guilt-Free Records</span>
          <span aria-hidden="true">·</span>
          <span>Simulated Shipments</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Your Imaginary Orders
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Each order below fulfilled a shopping urge while keeping your bank balance intact.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4 stroke-1" />
          <h3 className="text-base font-bold text-stone-900 mb-1">No imaginary orders yet</h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Ready to spend some BasCash and save real money? Pick any luxury product and checkout.
          </p>
          <button
            onClick={onStartShopping}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Browse Storefront
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Top Order Strip */}
              <div className="p-4 sm:p-5 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="block text-stone-400 text-[11px]">Order Number</span>
                    <span className="font-mono font-bold text-stone-900">{order.order_number}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-[11px]">Order Date</span>
                    <span className="text-stone-700">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-[11px]">Total BasCash</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-[11px]">Real Money Saved</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      ₹{order.real_money_saved.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Real Payment: ₹0</span>
                  </span>
                </div>
              </div>

              {/* Items List Snapshot */}
              <div className="p-4 sm:p-6 divide-y divide-stone-100">
                {order.items?.map((item) => (
                  <div key={item.order_item_id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_url_snapshot ? (
                        <img
                          src={item.image_url_snapshot}
                          alt={item.product_name_snapshot}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-stone-900 truncate">
                          {item.product_name_snapshot}
                        </h4>
                        <span className="text-[11px] text-stone-500">
                          Quantity: {item.quantity} · Price Snapshot: ₹{item.unit_price_snapshot.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-xs font-bold text-stone-900 tabular-nums">
                        ₹{item.line_total.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-medium">₹0 Billed</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulated Tracking Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Tracking status:</strong> {order.tracking_message}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-mono">
                  Sheets ID: {order.order_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
