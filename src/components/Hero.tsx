import React from 'react';
import { ArrowDown, PiggyBank, Sparkles, ShieldCheck, ShoppingCart, UserPlus } from 'lucide-react';
import type { UserRecord, WalletState } from '../shared/types.ts';

interface HeroProps {
  user: UserRecord | null;
  wallet: WalletState | null;
  onExploreClick: () => void;
  onOpenWallet: () => void;
  onSignUpClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  user,
  wallet,
  onExploreClick,
  onOpenWallet,
  onSignUpClick,
}) => {
  const savedAmount = wallet?.total_saved ?? 0;
  const balance = wallet?.balance ?? 50000;

  return (
    <section className="relative bg-stone-900 text-stone-100 overflow-hidden">
      {/* Background Image with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/bascart_hero_lifestyle_1791637639824.jpg"
          alt="BasCart curated aesthetic collection"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 filter brightness-75 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Subtle Editorial Kicker */}
          <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-amber-300 font-medium mb-4">
            <span>Guilt-Free Retail Therapy</span>
            <span aria-hidden="true">·</span>
            <span>Zero Real Spend</span>
            <span aria-hidden="true">·</span>
            <span>Google Sheets Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Your cart is full. <br />
            <span className="text-stone-300 font-light italic">Your wallet isn’t.</span>
          </h1>

          <p className="text-lg text-stone-300 mb-8 leading-relaxed font-light">
            Satisfy your late-night impulse buying cravings without harming your bank account.
            {user ? (
              <>
                {' '}You have <strong className="text-white font-medium">₹{balance.toLocaleString('en-IN')} BasCash</strong> ready to spend on curated luxury goods.
              </>
            ) : (
              <>
                {' '}Receive <strong className="text-white font-medium">₹50,000 in virtual BasCash upon sign-up</strong>,
                add coveted goods to your cart, and place completely imaginary orders.
              </>
            )}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-stone-900/80 border border-stone-800 backdrop-blur-md mb-8">
            {/* BasCash Card: Only displays active balance AFTER login */}
            {user ? (
              <div>
                <span className="block text-xs text-stone-400">Available BasCash</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
                  ₹{balance.toLocaleString('en-IN')}
                </span>
              </div>
            ) : (
              <div>
                <span className="block text-xs text-amber-300/80">Sign-Up Grant</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-300 tabular-nums">
                  ₹50,000 <span className="text-xs font-normal text-stone-400">BasCash</span>
                </span>
              </div>
            )}

            <div>
              <span className="block text-xs text-stone-400">Real Money Saved</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
                ₹{savedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs text-stone-400">Bank Card Required</span>
              <span className="text-xl sm:text-2xl font-bold text-stone-300">
                ₹0 <span className="text-xs font-normal text-stone-400">(Never)</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreClick}
              className="px-6 py-3.5 bg-white text-stone-950 font-semibold text-sm rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-2 shrink-0"
            >
              <span>Explore Products</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            {user ? (
              <button
                onClick={onOpenWallet}
                className="px-6 py-3.5 bg-stone-800 text-stone-200 font-medium text-sm rounded-lg hover:bg-stone-700 transition-colors border border-stone-700 flex items-center gap-2 shrink-0"
              >
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                <span>Inspect BasCash Ledger</span>
              </button>
            ) : (
              <button
                onClick={onSignUpClick}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Sign Up with Email OTP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
