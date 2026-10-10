import React from 'react';
import { PiggyBank, Heart, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import type { WalletState, OrderRecord } from '../shared/types.ts';

interface ImpactViewProps {
  wallet: WalletState | null;
  orders: OrderRecord[];
  onStartShopping: () => void;
}

export const ImpactView: React.FC<ImpactViewProps> = ({ wallet, orders, onStartShopping }) => {
  const saved = wallet?.total_saved ?? 0;
  const orderCount = orders.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
          <span>Behavioral Finance</span>
          <span aria-hidden="true">·</span>
          <span>Guilt-Free Impulse Protection</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Your Real-Life Money Saved Dashboard
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          The psychological thrill of clicking “Place Order”, without the 30-day billing statement regret.
        </p>
      </div>

      {/* Main Impact Hero Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="max-w-xl relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full mb-4 border border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Net Financial Preservation</span>
          </span>
          <div className="text-4xl sm:text-6xl font-extrabold tracking-tight tabular-nums text-white mb-4">
            ₹{saved.toLocaleString('en-IN')}
          </div>
          <p className="text-base text-stone-300 leading-relaxed font-light mb-8">
            Across <strong>{orderCount} simulated checkout session(s)</strong>, you added coveted designer goods,
            tech accessories, and artisanal luxury to your imaginary cart. Because you checked out on BasCart,
            that entire amount remains safely parked in your bank account.
          </p>

          <button
            onClick={onStartShopping}
            className="px-6 py-3.5 bg-emerald-500 text-stone-950 font-bold text-sm rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
          >
            <span>Satisfy Another Urge (Free)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proof & Behavioral Psychology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
            <PiggyBank className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-stone-900 mb-2">Zero EMI Commitments</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            No 18% APR revolving credit card interest. No "Pay in 4" BNPL reminders cluttering your inbox.
          </p>
        </div>

        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
            <Heart className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-stone-900 mb-2">Immediate Dopamine Release</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Neuroscience shows the majority of shopping pleasure occurs during item selection and checkout anticipation.
          </p>
        </div>

        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-stone-900 mb-2">Clutter-Free Living Space</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            No unopened cardboard delivery boxes piling up in your entryway that you later regret ordering.
          </p>
        </div>
      </div>
    </div>
  );
};
